"use client";
// Narration vocale féminine en français — Web Speech API

import { useRef, useState } from "react";

export function useNarration() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);

  function getBestFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // Priorité : voix féminines naturelles françaises
    return (
      voices.find(v => v.name === "Amélie") ||
      voices.find(v => v.name === "Marie") ||
      voices.find(v => v.name === "Audrey") ||
      voices.find(v => v.name.includes("Amélie")) ||
      voices.find(v => v.lang === "fr-FR" && v.name.toLowerCase().includes("fem")) ||
      voices.find(v => v.lang === "fr-FR" && (v.name.includes("Google") || v.name.includes("Microsoft"))) ||
      voices.find(v => v.lang === "fr-FR" && !v.name.toLowerCase().includes("thomas")) ||
      voices.find(v => v.lang === "fr-FR") ||
      voices.find(v => v.lang.startsWith("fr")) ||
      null
    );
  }

  function narrate(text: string, options?: { rate?: number; pitch?: number }) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleaned = text
      .replace(/[🌍🚀🦋🐱🐶🌈🍎🐸🌟✨⭐💫🎯❓✅❌]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    function speak(voices: SpeechSynthesisVoice[]) {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = "fr-FR";
      utterance.rate = options?.rate ?? 0.82;
      utterance.pitch = options?.pitch ?? 1.08;
      utterance.volume = 1.0;
      const voice = getBestFrenchVoice(voices);
      if (voice) utterance.voice = voice;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.getVoices();
    }
  }

  function stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  return { narrate, stop, speaking };
}
