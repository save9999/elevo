"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLumoSpeech(ageGroup: string) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── Fallback Web Speech API ───────────────────────────────────────────────
  const speakWebSpeech = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSpeaking(false);
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();

    // Découpe en phrases pour éviter le bug de coupure Chrome (>200 chars)
    const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];

    let idx = 0;
    const speakNext = () => {
      if (idx >= sentences.length) { setSpeaking(false); onEnd?.(); return; }
      const utterance = new SpeechSynthesisUtterance(sentences[idx++].trim());
      utterance.lang   = "fr-FR";
      utterance.rate   = ageGroup === "maternelle" ? 0.80 : ageGroup === "primaire" ? 0.90 : 0.98;
      utterance.pitch  = ageGroup === "maternelle" ? 1.20 : ageGroup === "primaire" ? 1.05 : 0.95;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const best =
        voices.find((v) => v.lang === "fr-FR" && /amelie|thomas|natural|neural|siri|google/i.test(v.name)) ||
        voices.find((v) => v.lang === "fr-FR") ||
        voices.find((v) => v.lang.startsWith("fr"));
      if (best) utterance.voice = best;

      utterance.onend   = speakNext;
      utterance.onerror = () => { setSpeaking(false); onEnd?.(); };
      window.speechSynthesis.speak(utterance);
    };

    setSpeaking(true);
    // Charge les voix d'abord si pas encore disponibles
    if (window.speechSynthesis.getVoices().length > 0) {
      speakNext();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", speakNext, { once: true });
      // Démarre quand même après 300ms si l'événement ne se déclenche pas
      setTimeout(() => {
        if (idx === 0) speakNext();
      }, 300);
    }
  }, [ageGroup]);

  // ── Lecture audio blob ────────────────────────────────────────────────────
  const playBlob = useCallback(async (blob: Blob, fallbackText: string, onEnd?: () => void) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audioRef.current = null;
    };

    audio.onended = () => { setSpeaking(false); cleanup(); onEnd?.(); };
    audio.onerror = () => { setSpeaking(false); cleanup(); speakWebSpeech(fallbackText, onEnd); };

    try {
      await audio.play();
    } catch {
      // Autoplay bloqué → fallback Web Speech
      cleanup();
      speakWebSpeech(fallbackText, onEnd);
    }
  }, [speakWebSpeech]);

  // ── Speak principal ───────────────────────────────────────────────────────
  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (!text?.trim()) { onEnd?.(); return; }
    stop();

    const cleanText = text
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
      .replace(/[✦★☆•→←↑↓🔊▶⏹]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) { onEnd?.(); return; }

    setSpeaking(true);

    // Tentative API serveur avec timeout 6s
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, ageGroup }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 500) {
          await playBlob(blob, cleanText, onEnd);
          return;
        }
      }
    } catch { /* timeout ou erreur réseau */ }

    // Fallback Web Speech
    speakWebSpeech(cleanText, onEnd);
  }, [ageGroup, stop, speakWebSpeech, playBlob]);

  return { speak, stop, speaking };
}
