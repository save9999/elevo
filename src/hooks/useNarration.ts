"use client";
// Narration vocale via API TTS serveur (ElevenLabs ou Google TTS)
// Lecture MP3 via Web Audio API — voix naturelle, non robotique

import { useRef, useState } from "react";

export function useNarration() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);

  async function narrate(text: string) {
    if (typeof window === "undefined") return;

    // Arrêter la lecture en cours
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSpeaking(false);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`TTS error: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      setSpeaking(true);
      await audio.play();
    } catch {
      setSpeaking(false);
    }
  }

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSpeaking(false);
  }

  return { narrate, stop, speaking };
}
