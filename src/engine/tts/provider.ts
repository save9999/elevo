// Interface TTS qu'une implémentation OpenAI ou Web Speech devra satisfaire.
// Implémentations concrètes dans le Plan 2.

export type Voice = 'nova' | 'alloy' | 'echo';

export interface TTSProvider {
  synthesize(text: string, voice: Voice): Promise<ArrayBuffer>;
}
