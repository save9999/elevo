import type { TTSProvider, Voice } from './provider';

/**
 * Provider TTS basé sur l'API Web Speech du navigateur.
 *
 * Gratuit, zéro clé API. Qualité variable selon le navigateur/OS.
 * Pour la prod, on remplacera par OpenAITTSProvider (même interface).
 *
 * Note : l'interface `TTSProvider` retourne un `ArrayBuffer`, mais Web Speech
 * ne renvoie PAS d'audio buffer — il joue directement le son. On retourne
 * donc un buffer vide après la fin de la parole, et c'est le caller qui
 * décide quoi en faire.
 */
export class WebSpeechProvider implements TTSProvider {
  async synthesize(text: string, voice: Voice = 'nova'): Promise<ArrayBuffer> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Environnement non-navigateur ou API non supportée : on résout silencieusement
      return new ArrayBuffer(0);
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 0.9;

      // Essayer de trouver une voix française
      const frenchVoice = pickFrenchVoice(voice);
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onend = () => resolve(new ArrayBuffer(0));
      utterance.onerror = (event) => {
        // Les erreurs de synthèse ne sont pas critiques — on log et résout
        // pour ne pas bloquer l'UX de l'enfant.
        console.warn('[tts] speech synthesis error', event.error);
        resolve(new ArrayBuffer(0));
      };

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        reject(e);
      }
    });
  }

  /** Annule toute parole en cours. */
  cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

/**
 * Sélectionne une voix française parmi les voix disponibles dans le navigateur.
 * Le paramètre `voice` est une préférence douce : si plusieurs voix FR existent,
 * on essaie de matcher par ton. Sinon, on prend la première dispo.
 */
function pickFrenchVoice(voice: Voice): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const all = window.speechSynthesis.getVoices();
  const fr = all.filter((v) => v.lang.toLowerCase().startsWith('fr'));
  if (fr.length === 0) return null;

  // Préférences par voix logique :
  // - nova  → voix féminine douce
  // - alloy → voix neutre
  // - echo  → voix masculine
  const preferences: Record<Voice, RegExp[]> = {
    nova: [/Amelie|Audrey|Marie|Celine|Virginie|Julie/i, /female/i],
    alloy: [/Thomas|Daniel/i, /neutral/i],
    echo: [/Thomas|Nicolas|Paul/i, /male/i],
  };

  for (const pattern of preferences[voice]) {
    const match = fr.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return fr[0];
}
