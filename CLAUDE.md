# Elevo — App éducative Station Spatiale pour enfants (refonte Adibou)

## Vision

Plateforme éducative pour enfants de 4 à 18 ans, organisée en 4 parcours d'âge. Le parcours **Explorateurs (6-10 ans)** est livré en MVP : un hub Station Spatiale explorable, un compagnon IA holographique (LUMO), 6 planètes thématiques, un Cabinet de bilans dys et une bibliothèque d'exercices d'orthophonie. Les autres parcours (Petits, Aventuriers, Lycéens) partagent le même back et existent en stubs.

## Stack
Next.js 14 App Router, TypeScript strict (target es2022), Tailwind CSS, PostgreSQL (Neon en prod, Postgres 18 local en dev), Prisma, NextAuth v5 JWT (sans PrismaAdapter), Anthropic Claude (intégration Plan 2+), Web Speech API (TTS dev) + OpenAI TTS (prod).
Port dev : 3002 | GitHub : save9999/elevo | Vercel : elevo-five.vercel.app

## Architecture complète

### Pages publiques
- `src/app/page.tsx` — landing Station Elevo (ciel étoilé, aura LUMO, 3 feature cards, footer légal)
- `src/app/login` + `src/app/register` — auth NextAuth v5 JWT
- `src/app/cgu` — Conditions générales
- `src/app/confidentialite` — Politique de confidentialité RGPD

### Flows authentifiés
- `src/app/onboarding/` — route post-login qui dispatche vers le bon parcours selon l'âge
- `src/app/parent/` — dashboard parent (liste enfants + form ajout + accès rapports)
- `src/app/parent/child/[childId]/` — rapport détaillé d'un enfant (alertes, carnet d'observation par domaine, historique bilans)
- `src/app/pro/` — dashboard orthophoniste (liste patients, accès `role=PRO`)
- `src/app/pro/patient/[childId]/` — dossier clinique d'un patient (scores bruts, interprétations techniques)

### Parcours Explorateurs (6-10 ans)
- `src/app/explorateurs/[childId]/page.tsx` — **Hub Station** : 6 planètes en orbite + LUMO centrale cliquable
- `src/app/explorateurs/[childId]/planet/[planetSlug]/page.tsx` — vue planète (background thématique, liste activités)
- `src/app/explorateurs/[childId]/planet/[planetSlug]/activity/[activitySlug]/page.tsx` — écran mini-jeu via ActivityRouter
- `src/app/explorateurs/[childId]/cabinet/page.tsx` — Cabinet de LUMO (liste des bilans dys disponibles)
- `src/app/explorateurs/[childId]/cabinet/bilan/[protocolId]/page.tsx` — passage d'un bilan via ProtocolRunner

### Parcours stubs
- `src/app/petits/[childId]/` — stub "bientôt disponible" (4-5 ans)
- `src/app/aventuriers/[childId]/` — stub (10-13 ans)
- `src/app/lyceens/[childId]/` — stub (14-18 ans)

### API routes
- `src/app/api/auth/[...nextauth]` — NextAuth
- `src/app/api/auth/register` — création de compte parent
- `src/app/api/children` — CRUD enfants (GET liste, POST création avec calcul parcours auto)
- `src/app/api/game-sessions` — start/end d'une session de jeu
- `src/app/api/observations` — batch d'observations ambiantes (envoyées par les mini-jeux)
- `src/app/api/bilans` — création/lecture de bilans standardisés avec scoring côté serveur
- `src/app/api/alerts` — GET évalue + retourne les alertes, PATCH acquitte une alerte

### Moteur métier `src/engine/` (zéro-React, 100% testable Vitest)
- `engine/ai/client.ts` — wrapper Anthropic (stub, Plan 2+)
- `engine/diagnostic/`
  - `types.ts`, `scoring.ts` — scoring générique + bandes normal/attention/preoccupant
  - `alerts.ts` + `alerts-types.ts` — moteur d'alertes avec seuils par domaine (pure function)
  - `protocol-scoring.ts` — évaluation déclarative d'un protocole complet
  - `protocols/` — 5 protocoles : Alouette, ODEDYS lecture, ODEDYS dictée, subitisation, Corsi
- `engine/exercises/`
  - `types.ts`, `orthophonic-library.ts` — bibliothèque de **20 exercices** typés par trouble
  - `selector.ts` — sélection adaptative (zone proximale 75%, cooldown 48h après échec)
- `engine/game-kit/GameSession.ts` — squelette commun des mini-jeux (events, score, toObservations)
- `engine/observation/collector.ts` — interface du collecteur d'observations
- `engine/onboarding/dispatch.ts` — calcul parcours depuis birthdate + routing
- `engine/tts/` — `provider.ts` (interface), `webspeech.ts` (provider dev/fallback)

### Composants UI
- `src/components/SessionProvider.tsx` — NextAuth context
- `src/components/CookieBanner.tsx` — bandeau cookies essentiels
- `src/components/ui/` — primitives (Button, Card, Badge, Input)
- `src/components/explorateurs/`
  - `lumo/LumoSphere.tsx` — sphère holographique, 6 moods CSS
  - `lumo/LumoSpeaker.tsx` + `useLumoVoice.ts` — LUMO qui parle (hook + composant)
  - `station/StarField.tsx` — fond étoilé 3 couches
  - `station/Station.tsx` — hub avec 6 planètes en orbite + accès Cabinet
  - `station/PlanetOrb.tsx` + `planets-data.ts` — orbe de planète + métadonnées
  - `planets/PlanetPage.tsx` + `planet-activities.ts` — template commune + catalogue
  - `games/GameShell.tsx` — cadre visuel commun à tous les mini-jeux
  - `games/useGamePlay.ts` — hook qui gère session + observations + score
  - `games/ActivityRouter.tsx` — dispatch slug → composant
  - `games/LetterMatch.tsx`, `SyllableFishing.tsx`, `PseudoWordRead.tsx` — Alphabos
  - `games/Subitize.tsx` — Numeris
  - `games/SimonLumo.tsx` — Memoria
  - `games/PlaceholderActivity.tsx` — placeholder pour activités à venir
  - `cabinet/ProtocolRunner.tsx` — joueur générique de protocole dys (mcq, typed, recall-sequence)

### Data model `prisma/schema.prisma`
- `User` (role: PARENT/PRO/ADMIN, proCode optionnel)
- `Child` (parcours, parentId, proId optionnel, dysProfile agrégat)
- `GameSession` (planetSlug, activitySlug, startedAt, endedAt, score)
- `Observation` (domain, signal, weight, context) — signaux ambiants par mini-jeu
- `Bilan` (protocolId versionné, rawAnswers, rawScores, normedScores, interpretation, mode, triggeredBy)
- `ExerciseLog` (exerciseId, targetTrouble, difficulty, success)
- `Alert` (severity INFO/ATTENTION/IMPORTANT, title, body, observationIds, action, acknowledgedAt)

### Tests
- `vitest.config.ts` + `src/test/setup.ts` — 48 tests unitaires sur tout `src/engine/`
- `playwright.config.ts` + `tests/e2e/` — 13 tests e2e (landing, auth, hub, planet navigation, Cabinet, legal)
- `scripts/seed-test-user.ts` — crée `test@elevo.local` / `password123` + enfant Léa 7 ans

## Règles non-négociables

1. **`src/engine/` ne contient aucun import React, Next ou composant**. Testable avec Vitest seul.
2. **Un fichier = une responsabilité**, 250 lignes max par composant. Sinon scinder.
3. **TypeScript strict**, pas de `any`, pas de `console.log` en prod.
4. **Protocoles dys versionnés** (`version` + `publishedAt`) pour comparabilité longitudinale.
5. **Normes = données JSON sourcées**, pas du code.
6. **Prompts Claude versionnés** sous `src/engine/ai/prompts/` quand ils seront câblés. Jamais inline dans un composant.
7. **Le moteur d'alertes ne dit JAMAIS "dyslexie"** ni autre terme diagnostique — il parle de "signes à surveiller" et recommande un orthophoniste. Règle gravée dans `engine/diagnostic/alerts.ts`.

## Env vars

- `DATABASE_URL` — local : `postgresql://superbot@localhost:5432/elevo_refonte_dev` / prod : Neon UE
- `DIRECT_URL` — idem DATABASE_URL pour Prisma
- `NEXTAUTH_SECRET` — obligatoire en prod
- `NEXTAUTH_URL` — URL de déploiement
- `ANTHROPIC_API_KEY` — pour LUMO intelligente (pas encore câblée ; le TTS marche sans)
- `OPENAI_API_KEY` — optionnel ; Web Speech API tourne par défaut

## Scripts

```bash
npm run dev           # dev server port 3002
npm run build         # next build (inclut prisma generate)
npm run typecheck     # tsc --noEmit
npm run test          # vitest watch
npm run test:run      # vitest single run
npm run test:coverage # couverture moteur
npm run test:e2e      # playwright
npm run db:push       # prisma db push
npm run db:studio     # prisma studio
```

## Parcours par âge (calculé via `computeParcours`)

| Âge | Parcours | Route | Statut |
|---|---|---|---|
| 4-5 | PETITS | `/petits/[childId]` | Stub |
| 6-9 | EXPLORATEURS | `/explorateurs/[childId]` | **Complet (MVP)** |
| 10-13 | AVENTURIERS | `/aventuriers/[childId]` | Stub |
| 14-18 | LYCEENS | `/lyceens/[childId]` | Stub |

## Spec et plans

- **Spec** : `docs/superpowers/specs/2026-04-10-elevo-refonte-adibou-design.md`
- **Plan 1 Fondations** (exécuté) : `docs/superpowers/plans/2026-04-10-elevo-refonte-fondations.md`
- **Plan 2 Hub+LUMO** (exécuté) : `docs/superpowers/plans/2026-04-10-elevo-refonte-hub-lumo.md`
- Plans 3-10 : exécutés en batch inline (voir git log)

## Modèles Claude (routage prévu)

- `claude-haiku-4-5` : micro-feedback, chat libre avec LUMO
- `claude-sonnet-4-6` : alertes parent, plans pédagogiques, interprétations de bilans (mode parent)
- `claude-opus-4-6` : interprétations de bilans en mode pro orthophoniste (qualité clinique)

## Compte de test

```
Email    : test@elevo.local
Password : password123
Enfant   : Léa, 7 ans, parcours EXPLORATEURS
```

Re-seed si besoin : `npx tsx scripts/seed-test-user.ts`
