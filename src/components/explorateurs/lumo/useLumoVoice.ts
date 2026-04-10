'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WebSpeechProvider } from '@/engine/tts/webspeech';
import type { LumoMood } from './LumoSphere';

/**
 * Hook qui gère la parole de LUMO.
 *
 * Retourne le mood courant (à passer à `<LumoSphere mood={...}>`) et une
 * fonction `speak(text)` qui déclenche la synthèse vocale et met LUMO en
 * mood `speaking` pendant la durée de la parole.
 */
export function useLumoVoice() {
  const providerRef = useRef<WebSpeechProvider | null>(null);
  const [mood, setMood] = useState<LumoMood>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      providerRef.current = new WebSpeechProvider();
    }
    return () => {
      providerRef.current?.cancel();
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!providerRef.current) return;
    setMood('speaking');
    try {
      await providerRef.current.synthesize(text, 'nova');
    } finally {
      setMood('idle');
    }
  }, []);

  const stop = useCallback(() => {
    providerRef.current?.cancel();
    setMood('idle');
  }, []);

  return { mood, speak, stop };
}
