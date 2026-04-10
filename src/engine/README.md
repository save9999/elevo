# src/engine — Moteur métier Elevo

Ce dossier contient **tout le code métier non-React**. Il est conçu pour être testable unitairement, réutilisable par n'importe quel parcours (Petits, Explorateurs, Aventuriers, Lycéens) et extractible dans un package séparé si on veut plus tard un CLI ou une app mobile.

## Règles non-négociables

1. **Zéro import de `react`, `next`, ou de quoi que ce soit dans `src/components/`**. Si tu as besoin de lire le DOM ou de déclencher un re-render, tu es dans la mauvaise couche.
2. **Fonctions pures autant que possible.** Les effets (DB, réseau, TTS, LLM) passent par des interfaces injectables.
3. **Tests unitaires Vitest obligatoires** pour toute fonction de scoring, d'alerte, de sélection d'exercice.
4. **Types explicites**, pas de `any`.

## Sous-dossiers

- `ai/` — wrapper Anthropic SDK et construction des contextes
- `diagnostic/` — protocoles dys, scoring, normes, alertes
- `exercises/` — bibliothèque d'exercices d'orthophonie et sélection adaptative
- `game-kit/` — primitives partagées par les mini-jeux
- `observation/` — collecte et agrégation d'observations ambiantes
- `onboarding/` — calcul du parcours à partir de la date de naissance
- `tts/` — interface TTS et providers (OpenAI, Web Speech)

## Tests

```bash
npm run test          # watch mode
npm run test:run      # single run
npm run test:coverage # avec couverture
```

La couverture cible est 100% sur `src/engine/diagnostic/scoring.ts` et `src/engine/diagnostic/alerts.ts` (fonctions critiques).
