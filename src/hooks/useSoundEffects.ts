"use client";
import { useRef, useCallback } from "react";

type SoundType = "correct" | "wrong" | "combo" | "click" | "victory" | "woosh" | "pop" | "streak" | "star";

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

function playTone(ctx: AudioContext, freq: number, duration: number, gain: number, type: OscillatorType = "sine", delay = 0) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2000;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  g.gain.setValueAtTime(0, ctx.currentTime + delay);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.02);
  g.gain.setValueAtTime(gain, ctx.currentTime + delay + duration * 0.7);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

  osc.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

function playNoise(ctx: AudioContext, duration: number, gain: number, delay = 0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 4000;

  g.gain.setValueAtTime(0, ctx.currentTime + delay);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.01);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

  source.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  source.start(ctx.currentTime + delay);
}

const SOUNDS: Record<SoundType, (ctx: AudioContext) => void> = {
  correct: (ctx) => {
    // Joyful ascending arpeggio
    playTone(ctx, 523, 0.12, 0.15, "triangle", 0);
    playTone(ctx, 659, 0.12, 0.15, "triangle", 0.08);
    playTone(ctx, 784, 0.2, 0.18, "triangle", 0.16);
  },
  wrong: (ctx) => {
    // Low buzzy descending
    playTone(ctx, 250, 0.15, 0.1, "sawtooth", 0);
    playTone(ctx, 200, 0.2, 0.08, "sawtooth", 0.12);
  },
  combo: (ctx) => {
    // Sparkly ascending scale
    [523, 659, 784, 988, 1047].forEach((f, i) => {
      playTone(ctx, f, 0.1, 0.12, "triangle", i * 0.06);
    });
    playNoise(ctx, 0.08, 0.03, 0.25);
  },
  click: (ctx) => {
    playTone(ctx, 800, 0.05, 0.08, "sine");
    playNoise(ctx, 0.02, 0.02);
  },
  pop: (ctx) => {
    playTone(ctx, 600, 0.08, 0.1, "sine");
    playTone(ctx, 900, 0.06, 0.06, "sine", 0.03);
  },
  woosh: (ctx) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    playNoise(ctx, 0.12, 0.04);
  },
  victory: (ctx) => {
    // Fanfare triomphale
    const notes = [523, 659, 784, 784, 880, 784, 1047];
    const delays = [0, 0.12, 0.24, 0.42, 0.54, 0.66, 0.78];
    const durs = [0.1, 0.1, 0.15, 0.1, 0.1, 0.1, 0.35];
    notes.forEach((f, i) => {
      playTone(ctx, f, durs[i], 0.14, "triangle", delays[i]);
    });
    playNoise(ctx, 0.1, 0.03, 0.9);
  },
  streak: (ctx) => {
    // Quick rising sparkle
    playTone(ctx, 880, 0.08, 0.1, "triangle", 0);
    playTone(ctx, 1047, 0.08, 0.1, "triangle", 0.06);
    playTone(ctx, 1319, 0.12, 0.12, "triangle", 0.12);
  },
  star: (ctx) => {
    // Magical chime
    playTone(ctx, 1047, 0.3, 0.1, "sine", 0);
    playTone(ctx, 1319, 0.25, 0.08, "sine", 0.05);
    playTone(ctx, 1568, 0.35, 0.06, "sine", 0.1);
  },
};

export function useSoundEffects() {
  const enabledRef = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getCtx();
      SOUNDS[sound](ctx);
    } catch {
      // AudioContext not supported
    }
  }, []);

  const setEnabled = useCallback((val: boolean) => { enabledRef.current = val; }, []);

  return { play, setEnabled, isEnabled: enabledRef.current };
}
