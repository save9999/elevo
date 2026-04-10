import type { ObservationDomain } from '../observation/collector';
import type { AlertSeverity } from './alerts-types';

export type { AlertSeverity } from './alerts-types';

export interface ObservationInput {
  domain: ObservationDomain;
  signal: string;
  weight: number;
  createdAt: Date;
}

export interface AlertSuggestion {
  severity: AlertSeverity;
  domain: ObservationDomain;
  title: string;
  body: string;
  evidenceCount: number;
  action: 'bilan_suggere' | 'consulter_pro' | 'aucune';
}

/**
 * Seuils par domaine pour déclencher une alerte.
 *
 * Simple rule engine : pour chaque domaine, on somme les `weight` des
 * observations récentes (30 derniers jours) et on compare à un seuil.
 */
const THRESHOLDS: Partial<
  Record<
    ObservationDomain,
    { attention: number; important: number; label: string; troubleHint: string }
  >
> = {
  PHONOLOGY: {
    attention: 3,
    important: 6,
    label: 'phonologie et reconnaissance des sons',
    troubleHint: 'troubles du décodage de la lecture',
  },
  READING_ACCURACY: {
    attention: 3,
    important: 6,
    label: 'précision de lecture',
    troubleHint: 'difficultés de décodage',
  },
  READING_SPEED: {
    attention: 3,
    important: 6,
    label: 'vitesse de lecture',
    troubleHint: 'fluence de lecture',
  },
  WRITING: {
    attention: 3,
    important: 6,
    label: 'écriture et orthographe',
    troubleHint: 'difficultés d\'orthographe',
  },
  NUMERIC: {
    attention: 3,
    important: 6,
    label: 'sens du nombre et du calcul',
    troubleHint: 'difficultés en numération',
  },
  ATTENTION: {
    attention: 4,
    important: 8,
    label: 'attention et concentration',
    troubleHint: 'troubles de l\'attention',
  },
  MEMORY: {
    attention: 4,
    important: 8,
    label: 'mémoire de travail',
    troubleHint: 'difficultés de mémoire de travail',
  },
  VISUO_SPATIAL: {
    attention: 3,
    important: 6,
    label: 'orientation visuo-spatiale',
    troubleHint: 'difficultés de coordination',
  },
};

/**
 * Agrège les observations par domaine et renvoie la liste des alertes
 * suggérées (ordre décroissant de sévérité).
 *
 * Cette fonction est pure : tests possibles sans DB.
 */
export function evaluateAlerts(
  observations: ObservationInput[],
  now: Date = new Date(),
): AlertSuggestion[] {
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const cutoff = now.getTime() - THIRTY_DAYS;

  // Ne conserver que les observations récentes ET porteuses de signaux "négatifs"
  // (celles avec un weight ≥ 0.5 — les signaux positifs ont un weight plus faible par convention)
  const recent = observations.filter(
    (o) => o.createdAt.getTime() >= cutoff && o.weight >= 0.5,
  );

  const byDomain = new Map<ObservationDomain, number>();
  for (const obs of recent) {
    byDomain.set(obs.domain, (byDomain.get(obs.domain) ?? 0) + obs.weight);
  }

  const suggestions: AlertSuggestion[] = [];

  for (const [domain, score] of byDomain.entries()) {
    const threshold = THRESHOLDS[domain];
    if (!threshold) continue;

    if (score >= threshold.important) {
      suggestions.push({
        severity: 'IMPORTANT',
        domain,
        title: `Signes marqués en ${threshold.label}`,
        body:
          `Depuis quelques semaines, nous avons remarqué plusieurs hésitations récurrentes ` +
          `autour de ${threshold.label} chez votre enfant. Ce type de répétition peut être ` +
          `associé à des ${threshold.troubleHint}. Nous vous recommandons de prendre ` +
          `rendez-vous avec un·e orthophoniste pour un bilan officiel. ` +
          `En attendant, vous pouvez lancer un bilan au Cabinet de LUMO.`,
        evidenceCount: Math.round(score * 10) / 10,
        action: 'consulter_pro',
      });
    } else if (score >= threshold.attention) {
      suggestions.push({
        severity: 'ATTENTION',
        domain,
        title: `À surveiller : ${threshold.label}`,
        body:
          `Nous avons remarqué quelques hésitations autour de ${threshold.label} ` +
          `chez votre enfant ces dernières semaines. Ce n'est pas un diagnostic — ` +
          `ce genre de variations est fréquent. Si vous le souhaitez, vous pouvez ` +
          `lancer un petit bilan au Cabinet de LUMO pour y voir plus clair.`,
        evidenceCount: Math.round(score * 10) / 10,
        action: 'bilan_suggere',
      });
    }
  }

  // Tri par sévérité
  const severityOrder: Record<AlertSeverity, number> = {
    IMPORTANT: 0,
    ATTENTION: 1,
    INFO: 2,
  };
  suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return suggestions;
}
