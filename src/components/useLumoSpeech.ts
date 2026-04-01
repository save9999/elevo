"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLumoSpeech(ageGroup: string) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    // Arrêter l'audio HTML5
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Arrêter aussi le fallback Web Speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (!text?.trim()) return;
    stop();

    // ── Tentative voix naturelle OpenAI ────────────────────────────────
    try {
      setSpeaking(true);

      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.replace(/[^\w\s.,!?;:àâäéèêëîïôùûüç'-]/gi, " "), ageGroup }),
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
          onEnd?.();
        };

        await audio.play();
        return; // succès
      }
    } catch {
      // Réseau indisponible ou clé manquante → fallback
    }

    // ── Fallback : Web Speech API (voix du navigateur) ──────────────────
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang   = "fr-FR";
    utterance.rate   = ageGroup === "maternelle" ? 0.78 : ageGroup === "primaire" ? 0.88 : 0.95;
    utterance.pitch  = ageGroup === "maternelle" ? 1.4  : ageGroup === "primaire" ? 1.1  : 0.98;
    utterance.volume = 1;

    // Choisir la meilleure voix FR disponible
    const voices = window.speechSynthesis.getVoices();
    const best =
      voices.find((v) => v.lang === "fr-FR" && v.name.toLowerCase().includes("natural")) ||
      voices.find((v) => v.lang === "fr-FR" && v.name.toLowerCase().includes("lucie"))   ||
      voices.find((v) => v.lang === "fr-FR" && v.name.toLowerCase().includes("google"))  ||
      voices.find((v) => v.lang === "fr-FR") ||
      voices.find((v) => v.lang.startsWith("fr"));
    if (best) utterance.voice = best;

    utterance.onend   = () => { setSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [ageGroup, stop]);

  return { speak, stop, speaking };
}
