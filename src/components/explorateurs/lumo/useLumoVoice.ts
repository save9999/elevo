'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSpeechProvider } from '@/engine/tts/webspeech';
import type { LumoMood } from './LumoSphere';

/**
 * Hook qui gère la parole de LUMO.
 *
 * Stratégie :
 *  1. Essaie d'abord /api/tts qui utilise OpenAI TTS (voix humaine `nova`, FR).
 *  2. Si 503 (pas de clé OpenAI) ou échec réseau → fallback Web Speech API.
 *
 * Retourne le mood courant (à passer à <LumoSphere mood={...}>) et `speak(text)`.
 */
export function useLumoVoice() {
  const webSpeechRef = useRef<WebSpeechProvider | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mood, setMood] = useState<LumoMood>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      webSpeechRef.current = new WebSpeechProvider();
    }
    return () => {
      webSpeechRef.current?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    setMood('speaking');
    try {
      // 1. OpenAI TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        await new Promise<void>((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.play().catch(() => {
            URL.revokeObjectURL(url);
            resolve();
          });
        });
        setMood('idle');
        return;
      }

      // 2. Fallback Web Speech API
      if (webSpeechRef.current) {
        await webSpeechRef.current.synthesize(text, 'nova');
      }
    } catch {
      // Silent fail → fallback Web Speech
      try {
        if (webSpeechRef.current) {
          await webSpeechRef.current.synthesize(text, 'nova');
        }
      } catch {
        // Total fail, silencieux
      }
    } finally {
      setMood('idle');
    }
  }, []);

  const stop = useCallback(() => {
    webSpeechRef.current?.cancel();
    audioRef.current?.pause();
    setMood('idle');
  }, []);

  return { mood, speak, stop };
}
