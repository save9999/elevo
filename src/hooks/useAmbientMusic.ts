"use client";
// Musique d'ambiance générée par Web Audio API — pas de fichiers externes
// Différents thèmes par tranche d'âge

import { useEffect, useRef, useState } from "react";

type AgeGroup = "maternelle" | "primaire" | "college-lycee";

interface Note {
  freq: number;
  duration: number;
  delay: number;
  gain: number;
}

// Séquences musicales par tranche d'âge
const MELODIES: Record<AgeGroup, Note[]> = {
  maternelle: [
    // Do-Mi-Sol-Mi-Do — simple, joyeux, comme un xylophone
    { freq: 523.25, duration: 0.4, delay: 0, gain: 0.12 },
    { freq: 659.25, duration: 0.4, delay: 0.5, gain: 0.10 },
    { freq: 783.99, duration: 0.4, delay: 1.0, gain: 0.12 },
    { freq: 659.25, duration: 0.4, delay: 1.5, gain: 0.10 },
    { freq: 523.25, duration: 0.6, delay: 2.0, gain: 0.12 },
    { freq: 392.00, duration: 0.4, delay: 2.8, gain: 0.08 },
    { freq: 440.00, duration: 0.4, delay: 3.3, gain: 0.09 },
    { freq: 523.25, duration: 0.6, delay: 3.8, gain: 0.12 },
  ],
  primaire: [
    // Mélodie douce et encourageante
    { freq: 392.00, duration: 0.5, delay: 0, gain: 0.09 },
    { freq: 440.00, duration: 0.5, delay: 0.6, gain: 0.09 },
    { freq: 523.25, duration: 0.5, delay: 1.2, gain: 0.10 },
    { freq: 587.33, duration: 0.5, delay: 1.8, gain: 0.10 },
    { freq: 659.25, duration: 0.8, delay: 2.4, gain: 0.11 },
    { freq: 587.33, duration: 0.5, delay: 3.4, gain: 0.09 },
    { freq: 523.25, duration: 0.5, delay: 4.0, gain: 0.09 },
    { freq: 440.00, duration: 0.8, delay: 4.6, gain: 0.08 },
  ],
  "college-lycee": [
    // Ambiant, focus, contemplatif — intervalles larges, lent
    { freq: 293.66, duration: 1.2, delay: 0, gain: 0.07 },
    { freq: 369.99, duration: 1.2, delay: 1.5, gain: 0.07 },
    { freq: 440.00, duration: 1.2, delay: 3.0, gain: 0.08 },
    { freq: 493.88, duration: 1.5, delay: 4.5, gain: 0.07 },
    { freq: 440.00, duration: 1.0, delay: 6.2, gain: 0.06 },
    { freq: 369.99, duration: 1.5, delay: 7.4, gain: 0.07 },
  ],
};

const CYCLE_DURATION: Record<AgeGroup, number> = {
  maternelle: 5.5,
  primaire: 6.5,
  "college-lycee": 10.0,
};

export function useAmbientMusic(ageGroup: AgeGroup, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  function stopAll() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setIsPlaying(false);
  }

  function playNote(ctx: AudioContext, note: Note, startTime: number) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    // Filtre passe-bas pour adoucir le son
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = ageGroup === "college-lycee" ? 800 : 1200;
    filter.Q.value = 1;

    osc.type = ageGroup === "maternelle" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(note.freq, startTime);

    // Envelope ADSR douce
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(note.gain, startTime + 0.05);
    gainNode.gain.setValueAtTime(note.gain, startTime + note.duration * 0.6);
    gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + note.duration + 0.05);
  }

  function scheduleCycle(ctx: AudioContext, startOffset = 0) {
    const melody = MELODIES[ageGroup];
    const cycleDuration = CYCLE_DURATION[ageGroup];
    const now = ctx.currentTime;

    melody.forEach(note => {
      playNote(ctx, note, now + note.delay + startOffset);
    });

    // Planifier le prochain cycle
    const t = setTimeout(() => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        scheduleCycle(ctxRef.current, 0);
      }
    }, (cycleDuration + startOffset) * 1000);
    timeoutsRef.current.push(t);
  }

  function startMusic() {
    if (isPlaying) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctxRef.current = ctx;
      scheduleCycle(ctx, 0);
      setIsPlaying(true);
    } catch {
      // AudioContext non supporté
    }
  }

  useEffect(() => {
    if (!enabled) {
      stopAll();
    }
    return () => stopAll();
  }, [enabled]); // eslint-disable-line

  return { isPlaying, startMusic, stopMusic: stopAll };
}
