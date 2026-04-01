"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLumoSpeech(ageGroup: string) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);

  const stop = useCallback(() => {
    queueRef.current = [];
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang   = "fr-FR";
    utterance.rate   = ageGroup === "maternelle" ? 0.80 : ageGroup === "primaire" ? 0.90 : 0.98;
    utterance.pitch  = ageGroup === "maternelle" ? 1.35 : ageGroup === "primaire" ? 1.10 : 0.95;
    utterance.volume = 1;

    // Meilleure voix FR disponible dans le navigateur
    const tryGetVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const best =
        voices.find((v) => v.lang === "fr-FR" && /natural|neural|lucie|google/i.test(v.name)) ||
        voices.find((v) => v.lang === "fr-FR") ||
        voices.find((v) => v.lang.startsWith("fr"));
      if (best) utterance.voice = best;
    };
    tryGetVoices();
    if (!utterance.voice) {
      window.speechSynthesis.addEventListener("voiceschanged", tryGetVoices, { once: true });
    }

    utterance.onend   = () => { setSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setSpeaking(false); onEnd?.(); };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [ageGroup]);

  // ── Speak principal — essaie l'API, fallback Web Speech ──────────────────
  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (!text?.trim()) { onEnd?.(); return; }
    stop();

    const cleanText = text
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
      .replace(/[✦★☆•→←↑↓🔊▶⏹]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) { onEnd?.(); return; }

    // Tentative API serveur (ElevenLabs → OpenAI)
    try {
      setSpeaking(true);
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, ageGroup }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          onEnd?.();
        };
        audio.onerror = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          speakWebSpeech(cleanText, onEnd); // re-fallback
        };
        await audio.play();
        return;
      }
    } catch { /* réseau */ }

    // Fallback Web Speech
    speakWebSpeech(cleanText, onEnd);
  }, [ageGroup, stop, speakWebSpeech]);

  return { speak, stop, speaking };
}
