// Wrapper autour d'Anthropic SDK. Implémentation réelle dans le Plan 2.
// Pour le moment, juste un placeholder typé qui permet au reste du code de compiler.

export interface AiClient {
  chat(prompt: string): Promise<string>;
}

export function createAiClient(): AiClient {
  return {
    async chat() {
      throw new Error('AiClient not implemented — see Plan 2');
    },
  };
}
