import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSpeechProvider } from '../webspeech';

describe('WebSpeechProvider', () => {
  beforeEach(() => {
    const mockUtterance = vi.fn();
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
        mockUtterance(text);
      }
    };

    // @ts-expect-error — on installe speechSynthesis
    global.window = {
      speechSynthesis: {
        speak: (u: { onend: (() => void) | null }) => {
          // Simule la fin de parole immédiatement
          setTimeout(() => u.onend?.(), 0);
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
    // @ts-expect-error — simule SSR
    delete global.window;
    const provider = new WebSpeechProvider();
    const result = await provider.synthesize('hello', 'nova');
    expect(result.byteLength).toBe(0);
  });

  it('cancel() ne jette pas quand window est indéfini', () => {
    // @ts-expect-error
    delete global.window;
    const provider = new WebSpeechProvider();
    expect(() => provider.cancel()).not.toThrow();
  });
});
