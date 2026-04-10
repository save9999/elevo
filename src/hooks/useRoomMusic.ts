"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export type RoomId = "chambre" | "bureau" | "atelier" | "jardin" | "salon" | "cour" | "grenier" | "classe" | "labo" | "maison";

interface Note { freq: number; dur: number; delay: number; gain: number }
interface Layer { notes: Note[]; type: OscillatorType; filterFreq: number; filterQ: number }

// ── MAISON (hub) — thème principal accueillant ──────────────────────────────
const MAISON: Layer[] = [
  // Mélodie principale (joyeuse, accueillante)
  { type: "triangle", filterFreq: 1500, filterQ: 0.7, notes: [
    { freq: 523, dur: 0.4, delay: 0, gain: 0.08 },
    { freq: 659, dur: 0.3, delay: 0.5, gain: 0.08 },
    { freq: 784, dur: 0.3, delay: 0.9, gain: 0.09 },
    { freq: 880, dur: 0.5, delay: 1.3, gain: 0.1 },
    { freq: 784, dur: 0.3, delay: 2.0, gain: 0.08 },
    { freq: 659, dur: 0.4, delay: 2.4, gain: 0.08 },
    { freq: 523, dur: 0.6, delay: 3.0, gain: 0.09 },
    { freq: 440, dur: 0.4, delay: 3.8, gain: 0.08 },
    { freq: 523, dur: 0.8, delay: 4.4, gain: 0.09 },
  ]},
  // Pad ambiance
  { type: "sine", filterFreq: 500, filterQ: 0.5, notes: [
    { freq: 262, dur: 3.0, delay: 0, gain: 0.035 },
    { freq: 330, dur: 3.0, delay: 3.2, gain: 0.035 },
  ]},
  // Bass
  { type: "sine", filterFreq: 250, filterQ: 1, notes: [
    { freq: 131, dur: 1.2, delay: 0, gain: 0.045 },
    { freq: 165, dur: 1.2, delay: 2.0, gain: 0.04 },
    { freq: 131, dur: 1.2, delay: 4.0, gain: 0.045 },
  ]},
];

// ── CHAMBRE — berceuse douce ─────────────────────────────────────────────────
const CHAMBRE: Layer[] = [
  { type: "sine", filterFreq: 1000, filterQ: 0.5, notes: [
    { freq: 440, dur: 1.5, delay: 0, gain: 0.06 },
    { freq: 523, dur: 1.2, delay: 1.8, gain: 0.06 },
    { freq: 494, dur: 1.0, delay: 3.2, gain: 0.055 },
    { freq: 440, dur: 1.5, delay: 4.4, gain: 0.06 },
    { freq: 392, dur: 1.8, delay: 6.0, gain: 0.055 },
  ]},
  { type: "sine", filterFreq: 400, filterQ: 0.4, notes: [
    { freq: 220, dur: 4.0, delay: 0, gain: 0.03 },
    { freq: 262, dur: 4.0, delay: 4.5, gain: 0.03 },
  ]},
];

// ── BUREAU — rythmé, focus, calculs ──────────────────────────────────────────
const BUREAU: Layer[] = [
  { type: "triangle", filterFreq: 1800, filterQ: 0.8, notes: [
    { freq: 659, dur: 0.2, delay: 0, gain: 0.08 },
    { freq: 784, dur: 0.2, delay: 0.3, gain: 0.08 },
    { freq: 880, dur: 0.2, delay: 0.6, gain: 0.09 },
    { freq: 988, dur: 0.3, delay: 0.9, gain: 0.09 },
    { freq: 880, dur: 0.2, delay: 1.4, gain: 0.08 },
    { freq: 784, dur: 0.2, delay: 1.7, gain: 0.08 },
    { freq: 659, dur: 0.4, delay: 2.0, gain: 0.08 },
    { freq: 523, dur: 0.4, delay: 2.6, gain: 0.07 },
    { freq: 659, dur: 0.6, delay: 3.2, gain: 0.08 },
  ]},
  { type: "square", filterFreq: 300, filterQ: 2, notes: [
    { freq: 131, dur: 0.3, delay: 0, gain: 0.03 },
    { freq: 131, dur: 0.3, delay: 0.8, gain: 0.03 },
    { freq: 165, dur: 0.3, delay: 1.6, gain: 0.03 },
    { freq: 131, dur: 0.3, delay: 2.4, gain: 0.03 },
    { freq: 131, dur: 0.3, delay: 3.2, gain: 0.03 },
  ]},
];

// ── ATELIER — jazz léger, créatif ───────────────────────────────────────────
const ATELIER: Layer[] = [
  { type: "triangle", filterFreq: 1400, filterQ: 0.9, notes: [
    { freq: 440, dur: 0.3, delay: 0, gain: 0.07 },
    { freq: 523, dur: 0.3, delay: 0.4, gain: 0.07 },
    { freq: 622, dur: 0.4, delay: 0.8, gain: 0.08 },
    { freq: 698, dur: 0.5, delay: 1.3, gain: 0.08 },
    { freq: 622, dur: 0.3, delay: 1.9, gain: 0.07 },
    { freq: 587, dur: 0.4, delay: 2.3, gain: 0.07 },
    { freq: 494, dur: 0.5, delay: 2.8, gain: 0.07 },
    { freq: 440, dur: 0.6, delay: 3.4, gain: 0.07 },
  ]},
  { type: "sine", filterFreq: 450, filterQ: 0.6, notes: [
    { freq: 175, dur: 2.5, delay: 0, gain: 0.035 },
    { freq: 208, dur: 2.5, delay: 2.8, gain: 0.035 },
  ]},
];

// ── JARDIN — nature, oiseaux, vent ──────────────────────────────────────────
const JARDIN: Layer[] = [
  { type: "sine", filterFreq: 2000, filterQ: 0.4, notes: [
    { freq: 1319, dur: 0.1, delay: 0, gain: 0.04 },  // bird
    { freq: 1568, dur: 0.08, delay: 0.15, gain: 0.04 },
    { freq: 1319, dur: 0.1, delay: 0.3, gain: 0.04 },
    { freq: 523, dur: 0.8, delay: 1.5, gain: 0.05 },
    { freq: 587, dur: 0.8, delay: 2.5, gain: 0.05 },
    { freq: 659, dur: 1.0, delay: 3.5, gain: 0.05 },
    { freq: 1568, dur: 0.08, delay: 5.0, gain: 0.04 },
    { freq: 1760, dur: 0.1, delay: 5.15, gain: 0.04 },
    { freq: 1568, dur: 0.08, delay: 5.3, gain: 0.04 },
  ]},
  { type: "sine", filterFreq: 300, filterQ: 0.5, notes: [
    { freq: 147, dur: 6.0, delay: 0, gain: 0.025 },
  ]},
];

// ── SALON — chaleureux, cosy ────────────────────────────────────────────────
const SALON: Layer[] = [
  { type: "triangle", filterFreq: 1200, filterQ: 0.6, notes: [
    { freq: 392, dur: 0.5, delay: 0, gain: 0.07 },
    { freq: 494, dur: 0.5, delay: 0.6, gain: 0.07 },
    { freq: 587, dur: 0.7, delay: 1.2, gain: 0.08 },
    { freq: 523, dur: 0.5, delay: 2.0, gain: 0.07 },
    { freq: 440, dur: 0.6, delay: 2.6, gain: 0.07 },
    { freq: 392, dur: 0.8, delay: 3.3, gain: 0.07 },
  ]},
  { type: "sine", filterFreq: 400, filterQ: 0.5, notes: [
    { freq: 196, dur: 3.5, delay: 0, gain: 0.035 },
  ]},
];

// ── COUR — rythmé, joyeux, récré ────────────────────────────────────────────
const COUR: Layer[] = [
  { type: "triangle", filterFreq: 2000, filterQ: 0.8, notes: [
    { freq: 523, dur: 0.2, delay: 0, gain: 0.08 },
    { freq: 659, dur: 0.2, delay: 0.25, gain: 0.08 },
    { freq: 784, dur: 0.2, delay: 0.5, gain: 0.08 },
    { freq: 1047, dur: 0.3, delay: 0.75, gain: 0.09 },
    { freq: 880, dur: 0.2, delay: 1.15, gain: 0.08 },
    { freq: 784, dur: 0.2, delay: 1.4, gain: 0.08 },
    { freq: 659, dur: 0.3, delay: 1.65, gain: 0.07 },
    { freq: 523, dur: 0.4, delay: 2.0, gain: 0.08 },
    { freq: 784, dur: 0.4, delay: 2.5, gain: 0.08 },
  ]},
  { type: "square", filterFreq: 250, filterQ: 2, notes: [
    { freq: 110, dur: 0.2, delay: 0, gain: 0.025 },
    { freq: 110, dur: 0.2, delay: 0.5, gain: 0.025 },
    { freq: 110, dur: 0.2, delay: 1.0, gain: 0.025 },
    { freq: 110, dur: 0.2, delay: 1.5, gain: 0.025 },
    { freq: 147, dur: 0.2, delay: 2.0, gain: 0.025 },
    { freq: 110, dur: 0.2, delay: 2.5, gain: 0.025 },
  ]},
];

// ── GRENIER — mystérieux, ambiance énigme ──────────────────────────────────
const GRENIER: Layer[] = [
  { type: "sine", filterFreq: 600, filterQ: 0.6, notes: [
    { freq: 330, dur: 1.0, delay: 0, gain: 0.06 },
    { freq: 370, dur: 1.0, delay: 1.2, gain: 0.055 },
    { freq: 415, dur: 1.2, delay: 2.4, gain: 0.06 },
    { freq: 370, dur: 1.0, delay: 3.8, gain: 0.055 },
    { freq: 294, dur: 1.5, delay: 5.0, gain: 0.06 },
  ]},
  { type: "sine", filterFreq: 200, filterQ: 0.5, notes: [
    { freq: 82, dur: 4.0, delay: 0, gain: 0.04 },
    { freq: 98, dur: 4.0, delay: 4.5, gain: 0.035 },
  ]},
];

// ── CLASSE — classique, éducatif ────────────────────────────────────────────
const CLASSE: Layer[] = [
  { type: "triangle", filterFreq: 1400, filterQ: 0.7, notes: [
    { freq: 587, dur: 0.4, delay: 0, gain: 0.07 },
    { freq: 659, dur: 0.3, delay: 0.5, gain: 0.07 },
    { freq: 784, dur: 0.4, delay: 0.9, gain: 0.08 },
    { freq: 659, dur: 0.3, delay: 1.4, gain: 0.07 },
    { freq: 523, dur: 0.5, delay: 1.8, gain: 0.07 },
    { freq: 440, dur: 0.5, delay: 2.4, gain: 0.07 },
    { freq: 392, dur: 0.6, delay: 3.0, gain: 0.07 },
    { freq: 523, dur: 0.5, delay: 3.7, gain: 0.07 },
  ]},
  { type: "sine", filterFreq: 350, filterQ: 0.6, notes: [
    { freq: 175, dur: 3.5, delay: 0, gain: 0.035 },
  ]},
];

// ── LABO — intrigant, sci-fi doux ───────────────────────────────────────────
const LABO: Layer[] = [
  { type: "sine", filterFreq: 1600, filterQ: 1, notes: [
    { freq: 698, dur: 0.3, delay: 0, gain: 0.06 },
    { freq: 831, dur: 0.2, delay: 0.4, gain: 0.06 },
    { freq: 988, dur: 0.3, delay: 0.7, gain: 0.065 },
    { freq: 831, dur: 0.2, delay: 1.1, gain: 0.06 },
    { freq: 698, dur: 0.4, delay: 1.4, gain: 0.06 },
    { freq: 587, dur: 0.4, delay: 1.9, gain: 0.055 },
    { freq: 698, dur: 0.5, delay: 2.4, gain: 0.06 },
  ]},
  { type: "sawtooth", filterFreq: 220, filterQ: 3, notes: [
    { freq: 87, dur: 0.15, delay: 0, gain: 0.025 },
    { freq: 87, dur: 0.15, delay: 0.5, gain: 0.025 },
    { freq: 98, dur: 0.15, delay: 1.0, gain: 0.025 },
    { freq: 87, dur: 0.15, delay: 1.5, gain: 0.025 },
    { freq: 110, dur: 0.15, delay: 2.0, gain: 0.025 },
    { freq: 87, dur: 0.15, delay: 2.5, gain: 0.025 },
  ]},
];

const ROOM_MUSIC: Record<RoomId, { layers: Layer[]; cycle: number }> = {
  maison: { layers: MAISON, cycle: 5.5 },
  chambre: { layers: CHAMBRE, cycle: 8.5 },
  bureau: { layers: BUREAU, cycle: 4.0 },
  atelier: { layers: ATELIER, cycle: 4.5 },
  jardin: { layers: JARDIN, cycle: 6.0 },
  salon: { layers: SALON, cycle: 4.5 },
  cour: { layers: COUR, cycle: 3.5 },
  grenier: { layers: GRENIER, cycle: 7.0 },
  classe: { layers: CLASSE, cycle: 4.8 },
  labo: { layers: LABO, cycle: 3.5 },
};

function playNote(ctx: AudioContext, layer: Layer, note: Note, baseTime: number) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.value = layer.filterFreq;
  filter.Q.value = layer.filterQ;

  osc.type = layer.type;
  osc.frequency.setValueAtTime(note.freq, baseTime + note.delay);

  const attack = 0.05;
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

export function useRoomMusic(roomId: RoomId, enabled: boolean) {
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

  const scheduleCycle = useCallback((ctx: AudioContext) => {
    const room = ROOM_MUSIC[roomId];
    if (!room) return;
    const now = ctx.currentTime;

    room.layers.forEach((layer) => {
      layer.notes.forEach((note) => playNote(ctx, layer, note, now));
    });

    const t = setTimeout(() => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        scheduleCycle(ctxRef.current);
      }
    }, room.cycle * 1000);
    timeoutsRef.current.push(t);
  }, [roomId]);

  const startMusic = useCallback(() => {
    if (isPlaying) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      ctxRef.current = ctx;
      scheduleCycle(ctx);
      setIsPlaying(true);
    } catch {}
  }, [isPlaying, scheduleCycle]);

  useEffect(() => {
    if (!enabled) stopAll();
    return () => stopAll();
  }, [enabled, stopAll]);

  return { isPlaying, startMusic, stopMusic: stopAll };
}
