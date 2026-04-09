"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type AgeGroup = "maternelle" | "primaire" | "college-lycee";

interface Layer {
  notes: { freq: number; dur: number; delay: number; gain: number }[];
  type: OscillatorType;
  filterFreq: number;
  filterQ: number;
}

// ── MATERNELLE: doux, joyeux, xylophone + pad chaud ──────────────────────────
const MATERNELLE_MELODY: Layer = {
  notes: [
    { freq: 523, dur: 0.35, delay: 0, gain: 0.10 },
    { freq: 659, dur: 0.35, delay: 0.5, gain: 0.09 },
    { freq: 784, dur: 0.35, delay: 1.0, gain: 0.10 },
    { freq: 659, dur: 0.35, delay: 1.5, gain: 0.09 },
    { freq: 523, dur: 0.5, delay: 2.0, gain: 0.10 },
    { freq: 440, dur: 0.35, delay: 2.7, gain: 0.08 },
    { freq: 494, dur: 0.35, delay: 3.2, gain: 0.08 },
    { freq: 523, dur: 0.5, delay: 3.7, gain: 0.10 },
    { freq: 784, dur: 0.35, delay: 4.4, gain: 0.09 },
    { freq: 698, dur: 0.35, delay: 4.9, gain: 0.08 },
    { freq: 659, dur: 0.5, delay: 5.4, gain: 0.09 },
    { freq: 523, dur: 0.7, delay: 6.0, gain: 0.10 },
  ],
  type: "triangle",
  filterFreq: 1800,
  filterQ: 0.7,
};

const MATERNELLE_PAD: Layer = {
  notes: [
    { freq: 262, dur: 3.0, delay: 0, gain: 0.04 },
    { freq: 330, dur: 3.0, delay: 3.2, gain: 0.035 },
    { freq: 262, dur: 3.5, delay: 6.5, gain: 0.04 },
  ],
  type: "sine",
  filterFreq: 600,
  filterQ: 0.5,
};

const MATERNELLE_BASS: Layer = {
  notes: [
    { freq: 131, dur: 1.2, delay: 0, gain: 0.05 },
    { freq: 165, dur: 1.2, delay: 2.0, gain: 0.045 },
    { freq: 131, dur: 1.2, delay: 4.0, gain: 0.05 },
    { freq: 110, dur: 1.5, delay: 6.0, gain: 0.04 },
  ],
  type: "sine",
  filterFreq: 300,
  filterQ: 1,
};

// ── PRIMAIRE: encourageant, dynamique, plus de rythme ────────────────────────
const PRIMAIRE_MELODY: Layer = {
  notes: [
    { freq: 392, dur: 0.4, delay: 0, gain: 0.08 },
    { freq: 440, dur: 0.3, delay: 0.5, gain: 0.08 },
    { freq: 523, dur: 0.4, delay: 0.9, gain: 0.09 },
    { freq: 587, dur: 0.3, delay: 1.4, gain: 0.09 },
    { freq: 659, dur: 0.6, delay: 1.8, gain: 0.10 },
    { freq: 587, dur: 0.3, delay: 2.6, gain: 0.08 },
    { freq: 523, dur: 0.3, delay: 3.0, gain: 0.08 },
    { freq: 494, dur: 0.4, delay: 3.4, gain: 0.08 },
    { freq: 523, dur: 0.5, delay: 3.9, gain: 0.09 },
    { freq: 440, dur: 0.4, delay: 4.5, gain: 0.08 },
    { freq: 392, dur: 0.6, delay: 5.0, gain: 0.08 },
    { freq: 440, dur: 0.3, delay: 5.8, gain: 0.07 },
    { freq: 523, dur: 0.7, delay: 6.2, gain: 0.09 },
  ],
  type: "triangle",
  filterFreq: 1500,
  filterQ: 0.8,
};

const PRIMAIRE_PAD: Layer = {
  notes: [
    { freq: 196, dur: 3.5, delay: 0, gain: 0.035 },
    { freq: 220, dur: 3.5, delay: 3.5, gain: 0.03 },
    { freq: 196, dur: 3.0, delay: 7.0, gain: 0.035 },
  ],
  type: "sine",
  filterFreq: 500,
  filterQ: 0.5,
};

const PRIMAIRE_BASS: Layer = {
  notes: [
    { freq: 98, dur: 1.0, delay: 0, gain: 0.045 },
    { freq: 110, dur: 1.0, delay: 1.8, gain: 0.04 },
    { freq: 131, dur: 1.0, delay: 3.5, gain: 0.045 },
    { freq: 110, dur: 1.0, delay: 5.2, gain: 0.04 },
    { freq: 98, dur: 1.2, delay: 6.8, gain: 0.045 },
  ],
  type: "sine",
  filterFreq: 250,
  filterQ: 1,
};

// ── COLLÈGE/LYCÉE: ambiant, lo-fi, contemplatif ──────────────────────────────
const COLLEGE_MELODY: Layer = {
  notes: [
    { freq: 294, dur: 1.5, delay: 0, gain: 0.06 },
    { freq: 370, dur: 1.5, delay: 2.0, gain: 0.055 },
    { freq: 440, dur: 1.2, delay: 4.0, gain: 0.06 },
    { freq: 494, dur: 1.8, delay: 5.5, gain: 0.055 },
    { freq: 440, dur: 1.2, delay: 7.5, gain: 0.05 },
    { freq: 370, dur: 1.5, delay: 9.0, gain: 0.055 },
    { freq: 330, dur: 1.8, delay: 10.8, gain: 0.05 },
  ],
  type: "sine",
  filterFreq: 900,
  filterQ: 0.6,
};

const COLLEGE_PAD: Layer = {
  notes: [
    { freq: 147, dur: 5.0, delay: 0, gain: 0.03 },
    { freq: 165, dur: 5.0, delay: 5.5, gain: 0.025 },
    { freq: 147, dur: 5.0, delay: 11.0, gain: 0.03 },
  ],
  type: "sine",
  filterFreq: 400,
  filterQ: 0.4,
};

const COLLEGE_BASS: Layer = {
  notes: [
    { freq: 73, dur: 2.5, delay: 0, gain: 0.04 },
    { freq: 82, dur: 2.5, delay: 4.0, gain: 0.035 },
    { freq: 73, dur: 2.5, delay: 8.0, gain: 0.04 },
    { freq: 65, dur: 3.0, delay: 12.0, gain: 0.035 },
  ],
  type: "sine",
  filterFreq: 200,
  filterQ: 0.8,
};

const LAYERS: Record<AgeGroup, Layer[]> = {
  maternelle: [MATERNELLE_MELODY, MATERNELLE_PAD, MATERNELLE_BASS],
  primaire: [PRIMAIRE_MELODY, PRIMAIRE_PAD, PRIMAIRE_BASS],
  "college-lycee": [COLLEGE_MELODY, COLLEGE_PAD, COLLEGE_BASS],
};

const CYCLE_DURATION: Record<AgeGroup, number> = {
  maternelle: 7.5,
  primaire: 8.0,
  "college-lycee": 15.0,
};

function playLayerNote(
  ctx: AudioContext,
  layer: Layer,
  note: { freq: number; dur: number; delay: number; gain: number },
  baseTime: number,
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.value = layer.filterFreq;
  filter.Q.value = layer.filterQ;

  osc.type = layer.type;
  osc.frequency.setValueAtTime(note.freq, baseTime + note.delay);

  // Smooth ADSR
  const attack = 0.06;
  const release = Math.min(note.dur * 0.4, 0.3);
  const t0 = baseTime + note.delay;

  gainNode.gain.setValueAtTime(0, t0);
  gainNode.gain.linearRampToValueAtTime(note.gain, t0 + attack);
  gainNode.gain.setValueAtTime(note.gain, t0 + note.dur - release);
  gainNode.gain.linearRampToValueAtTime(0, t0 + note.dur);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + note.dur + 0.05);
}

function playPercTick(ctx: AudioContext, time: number, gain: number) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.04);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 6000;
  g.gain.setValueAtTime(gain, time);
  g.gain.linearRampToValueAtTime(0, time + 0.04);

  source.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  source.start(time);
}

export function useAmbientMusic(ageGroup: AgeGroup, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const scheduleCycle = useCallback((ctx: AudioContext, startOffset = 0) => {
    const layers = LAYERS[ageGroup];
    const cycleDuration = CYCLE_DURATION[ageGroup];
    const now = ctx.currentTime + startOffset;

    // Play all layers
    layers.forEach((layer) => {
      layer.notes.forEach((note) => {
        playLayerNote(ctx, layer, note, now);
      });
    });

    // Light percussion (not for college — too chill)
    if (ageGroup !== "college-lycee") {
      const percInterval = ageGroup === "maternelle" ? 1.0 : 0.8;
      const percCount = Math.floor(cycleDuration / percInterval);
      for (let i = 0; i < percCount; i++) {
        playPercTick(ctx, now + i * percInterval, ageGroup === "maternelle" ? 0.015 : 0.012);
      }
    }

    const t = setTimeout(() => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        scheduleCycle(ctxRef.current, 0);
      }
    }, (cycleDuration + startOffset) * 1000);
    timeoutsRef.current.push(t);
  }, [ageGroup]);

  const startMusic = useCallback(() => {
    if (isPlaying) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctxRef.current = ctx;
      scheduleCycle(ctx, 0);
      setIsPlaying(true);
    } catch {
      // AudioContext not supported
    }
  }, [isPlaying, scheduleCycle]);

  useEffect(() => {
    if (!enabled) stopAll();
    return () => stopAll();
  }, [enabled, stopAll]);

  return { isPlaying, startMusic, stopMusic: stopAll };
}
