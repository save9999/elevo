import type { Protocol, ProtocolAnswer, ProtocolItem } from './protocols/types';
import type { Band, ErrorTaxonomy } from './types';
import { computeBand, type RawScore } from './scoring';

export interface ProtocolResult {
  protocolId: string;
  protocolVersion: string;
  rawScore: RawScore;
  band: Band;
  /** Durée totale estimée en ms. */
  totalDurationMs: number;
  /** Taux de réussite (0..1). */
  accuracy: number;
  /** Liste d'items où l'enfant a échoué. */
  failedItemIds: string[];
  /** Message d'interprétation généré par template (pas encore Claude). */
  interpretation: string;
}

/**
 * Vérifie si une réponse à un item est correcte.
 * - Pour 'mcq', compare l'index (number vs number).
 * - Pour 'typed', compare le texte en lowercase/trimmed (tolérance accents).
 * - Pour 'recall-sequence', compare la chaîne "0,2,1" exactement.
 */
export function isAnswerCorrect(item: ProtocolItem, answer: ProtocolAnswer): boolean {
  if (item.type === 'typed') {
    const expected = String(item.correct).toLowerCase().trim();
    const given = String(answer.value).toLowerCase().trim();
    // Tolérance minimale : on normalise les accents basiques
    return normalize(given) === normalize(expected);
  }
  return answer.value === item.correct;
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Évalue un protocole complet : parcourt les items, compare avec les réponses,
 * produit un RawScore puis un band, et génère une interprétation en texte.
 *
 * Fonction pure, testable unitairement.
 */
export function scoreProtocol(
  protocol: Protocol,
  answers: ProtocolAnswer[],
): ProtocolResult {
  const answersById = new Map(answers.map((a) => [a.itemId, a]));

  let correct = 0;
  let totalDuration = 0;
  const failedItemIds: string[] = [];
  const errors: ErrorTaxonomy[] = [];

  for (const item of protocol.items) {
    const answer = answersById.get(item.id);
    if (!answer) {
      failedItemIds.push(item.id);
      continue;
    }
    totalDuration += answer.durationMs;
    if (isAnswerCorrect(item, answer)) {
      correct += 1;
    } else {
      failedItemIds.push(item.id);
      errors.push(answer.error ?? 'other');
    }
  }

  const total = protocol.items.length;
  const rawScore: RawScore = {
    correct,
    total,
    durationMs: totalDuration,
    errors,
  };
  const band = computeBand(rawScore);
  const accuracy = total > 0 ? correct / total : 0;

  const interpretation = buildInterpretation(protocol, band, accuracy);

  return {
    protocolId: protocol.id,
    protocolVersion: protocol.version,
    rawScore,
    band,
    totalDurationMs: totalDuration,
    accuracy,
    failedItemIds,
    interpretation,
  };
}

/**
 * Génère un message d'interprétation en langage clair, adapté au parent.
 * Respecte les règles du spec §6.5 : jamais le mot "dyslexique", toujours
 * une action possible.
 */
function buildInterpretation(protocol: Protocol, band: Band, accuracy: number): string {
  const pct = Math.round(accuracy * 100);
  const troubleLabel = troubleLabelFor(protocol.targetTrouble);

  if (band === 'normal') {
    return (
      `Votre enfant a réussi ${pct}% des items de ce bilan. ` +
      `C'est un résultat qui ne montre aucun signe particulier à surveiller côté ${troubleLabel}. ` +
      `Vous pouvez continuer à jouer librement sur la Station.`
    );
  }
  if (band === 'attention') {
    return (
      `Votre enfant a réussi ${pct}% des items. ` +
      `On observe quelques hésitations qui méritent d'être suivies sur ${troubleLabel}. ` +
      `Ce n'est pas un diagnostic — mais si ce type de résultat revient plusieurs fois, ` +
      `nous vous conseillerions de consulter un·e orthophoniste pour un bilan officiel.`
    );
  }
  return (
    `Votre enfant a réussi ${pct}% des items. ` +
    `Les difficultés observées sur ${troubleLabel} sont significatives dans le cadre de ce bilan. ` +
    `Nous vous recommandons vivement de prendre rendez-vous avec un·e orthophoniste ` +
    `pour un bilan officiel. Pas de panique : détecter tôt, c'est accompagner mieux.`
  );
}

function troubleLabelFor(t: Protocol['targetTrouble']): string {
  switch (t) {
    case 'dyslexie':
      return 'la lecture et le décodage';
    case 'dysorthographie':
      return 'l\'orthographe';
    case 'dyscalculie':
      return 'le sens du nombre et le calcul';
    case 'dyspraxie':
      return 'la coordination et l\'organisation visuo-spatiale';
    case 'memoire':
      return 'la mémoire de travail';
  }
}
