import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSpeechProvider } from '../webspeech';

describe('WebSpeechProvider', () => {
  beforeEach(() => {
    // @ts-expect-error — on installe un mock minimal de l'API Web Speech
    global.SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: unknown = null;
      onend: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    };

    (global as unknown as { window: unknown }).window = {
      speechSynthesis: {
        speak: (u: unknown) => {
          const utterance = u as { onend: (() => void) | null };
          setTimeout(() => utterance.onend?.(), 0);
        },
        cancel: vi.fn(),
        getVoices: () => [],
      },
    };
  });

  it('résout sans erreur quand speechSynthesis est disponible', async () => {
    const provider = new WebSpeechProvider();
    const result = await provider.synthesize('bonjour Léa', 'nova');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it('résout silencieusement quand window est indéfini (SSR)', async () => {
    delete (global as unknown as { window?: unknown }).window;
    const provider = new WebSpeechProvider();
    const result = await provider.synthesize('hello', 'nova');
    expect(result.byteLength).toBe(0);
  });

  it('cancel() ne jette pas quand window est indéfini', () => {
    delete (global as unknown as { window?: unknown }).window;
    const provider = new WebSpeechProvider();
    expect(() => provider.cancel()).not.toThrow();
  });
});
