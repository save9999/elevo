# Elevo — App éducative Station Spatiale pour enfants (refonte Adibou)

## Vision

Plateforme éducative pour enfants de 4 à 18 ans, organisée en 4 parcours d'âge. Le parcours **Explorateurs (6-10 ans)** est le MVP : un hub Station Spatiale explorable, un compagnon IA holographique (LUMO), 6 planètes thématiques, un Cabinet de bilans dys et une bibliothèque d'exercices d'orthophonie. Les autres parcours (Petits, Aventuriers, Lycéens) partagent le même back et seront développés après.

## Stack
Next.js 14 App Router, TypeScript strict, Tailwind CSS, PostgreSQL (Neon en prod, Postgres local en dev), Prisma, NextAuth v5 JWT (sans PrismaAdapter), Anthropic Claude, OpenAI TTS.
Port dev : 3002 | GitHub : save9999/elevo | Vercel : elevo-five.vercel.app

## Architecture (refonte Adibou — post Plan 1)

- `src/app/page.tsx` — landing Station Elevo
- `src/app/login` + `register` — auth NextAuth v5 JWT
- `src/app/onboarding/` — route post-login qui dispatche vers le bon parcours selon l'âge
- `src/app/parent/` — dashboard parent (stub, Plan 5)
- `src/app/pro/` — dashboard orthophoniste (stub, Plan 9)
- `src/app/explorateurs/[childId]/` — **parcours 6-10 ans** (développé Plans 2-8)
- `src/app/petits/[childId]/` — stub "bientôt disponible"
- `src/app/aventuriers/[childId]/` — stub "bientôt disponible"
- `src/app/lyceens/[childId]/` — stub "bientôt disponible"
- `src/app/api/auth/` — NextAuth handler
- `src/engine/` — **moteur métier zéro-React**, sous-dossiers :
  - `ai/` — wrapper Anthropic (Plan 2+)
  - `diagnostic/` — protocoles dys, scoring, normes, alertes (Plans 4+6)
  - `exercises/` — bibliothèque orthophonie (Plan 8)
  - `game-kit/` — primitives mini-jeux (Plan 3)
  - `observation/` — collecte ambiante (Plan 3)
  - `tts/` — interface + providers (Plan 2)
  - `onboarding/dispatch.ts` — calcul parcours et route (testé TDD)
- `src/components/`
  - `SessionProvider.tsx` — NextAuth context
  - `ui/` — primitives (Button, Card, Badge, Input)
- `prisma/schema.prisma` — User, Child, GameSession, Observation, Bilan, ExerciseLog, Alert + enums
- `vitest.config.ts` + `src/test/setup.ts` — tests unitaires
- `playwright.config.ts` + `tests/e2e/` — tests e2e

## Règles non-négociables

1. **`src/engine/` ne contient aucun import React, Next ou composant**. Testable avec Vitest seul.
2. **Un fichier = une responsabilité**, 250 lignes max par composant. Sinon scinder.
3. **TypeScript strict**, pas de `any`, pas de `console.log` en prod.
4. **Protocoles dys versionnés** (`version` + `publishedAt`) pour comparabilité longitudinale.
5. **Normes = données JSON sourcées**, pas du code. PR de données pour les mises à jour.
6. **Prompts Claude versionnés** sous `src/engine/ai/prompts/`. Jamais inline dans un composant.

## Env vars

- `DATABASE_URL` — local : `postgresql://superbot@localhost:5432/elevo_refonte_dev` / prod : Neon UE
- `DIRECT_URL` — idem DATABASE_URL pour Prisma
- `NEXTAUTH_SECRET` — obligatoire en prod
- `NEXTAUTH_URL` — URL de déploiement
- `ANTHROPIC_API_KEY` — pour LUMO (à partir du Plan 2)
- `OPENAI_API_KEY` — pour TTS (à partir du Plan 2)

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

| Âge | Parcours | Route |
|---|---|---|
| 4-5 | PETITS | `/petits/[childId]` |
| 6-9 | EXPLORATEURS | `/explorateurs/[childId]` |
| 10-13 | AVENTURIERS | `/aventuriers/[childId]` |
| 14-18 | LYCEENS | `/lyceens/[childId]` |

## Spec et plans

- **Spec** : `docs/superpowers/specs/2026-04-10-elevo-refonte-adibou-design.md`
- **Plan 1 Fondations** (exécuté) : `docs/superpowers/plans/2026-04-10-elevo-refonte-fondations.md`
- Plans 2-10 : à écrire après Plan 1

## Modèles Claude (routage)

- `claude-haiku-4-5` : micro-feedback, chat libre avec LUMO
- `claude-sonnet-4-6` : alertes parent, plans pédagogiques, interprétations de bilans (mode parent)
- `claude-opus-4-6` : interprétations de bilans en mode pro orthophoniste (qualité clinique)
