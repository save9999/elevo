"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLumoSpeech(ageGroup: string) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    // Voix adaptée à l'âge
    utterance.rate  = ageGroup === "maternelle" ? 0.78 : ageGroup === "primaire" ? 0.88 : 0.95;
    utterance.pitch = ageGroup === "maternelle" ? 1.45 : ageGroup === "primaire" ? 1.15 : 0.98;
    utterance.volume = 1;

    // Essayer de choisir une voix française
    const voices = window.speechSynthesis.getVoices();
    const frVoice =
      voices.find((v) => v.lang === "fr-FR" && v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang === "fr-FR") ||
      voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => { setSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setSpeaking(false); onEnd?.(); };

    window.speechSynthesis.speak(utterance);
  }, [ageGroup]);

  // Charger les voix (certains navigateurs les chargent de façon asynchrone)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, speaking, supported };
}
