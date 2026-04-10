# Refonte Elevo — Plan 1 : Fondations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire table rase du code obsolète d'Elevo, mettre en place le nouveau schéma Prisma de la refonte Adibou, scaffolder le moteur `src/engine/`, installer l'infra de tests (Vitest + Playwright), et créer la route `/onboarding` qui dispatche un enfant vers le bon parcours. À la fin de ce plan, `npm run build` passe, au moins 1 test unitaire et 1 test e2e passent, et l'app tourne avec un enfant qui peut voir un placeholder parcours après login.

**Architecture:** Next.js 14 App Router + TypeScript strict + PostgreSQL Neon + Prisma + NextAuth v5 JWT-only (sans PrismaAdapter). Nouveau dossier `src/engine/` pour le moteur métier zéro-React. Tests unitaires avec Vitest (moteur) et e2e avec Playwright (parcours critiques).

**Tech Stack:**
- Framework : Next.js 14 App Router
- DB : PostgreSQL Neon + Prisma
- Auth : NextAuth v5 beta (Credentials + JWT, sans adapter)
- Tests : Vitest + `@testing-library/react` (unit) + Playwright (e2e)
- TypeScript strict, pas de `any`

**Référence spec :** `docs/superpowers/specs/2026-04-10-elevo-refonte-adibou-design.md` — jalon J1 du §11.

**Déviations assumées par rapport au spec :**
- Le spec §4 montre un model `User` minimal sans les champs NextAuth. Dans ce plan, on **supprime le `PrismaAdapter`** parce qu'on n'utilise que Credentials + JWT, donc les modèles `Account`/`Session`/`VerificationToken` ne sont plus nécessaires. Décision documentée dans Task 5.

---

## Prérequis avant de commencer

- [ ] Working directory : `/Users/superbot/elevo`
- [ ] Node installé, `npm` disponible
- [ ] Base `DATABASE_URL` accessible (prod Neon) — **⚠️ on va faire un `prisma db push` destructif sur cette base si on l'utilise directement. Travailler avec une base dev séparée si possible, sinon s'assurer d'avoir un backup.**
- [ ] L'utilisateur a validé le spec et ce plan
- [ ] `git status` est propre OU les changements en cours sont stashés/commités

---

## Task 1 — Branche de travail & backup de sécurité

**Files:**
- Modify: (aucun, opérations git)

- [ ] **Step 1.1 : Vérifier git status et stasher les changements non liés**

Run: `cd /Users/superbot/elevo && git status --short`

Expected: si des fichiers sont modifiés (ex. `src/app/child/[id]/chapter/...`), les stasher pour ne pas les perdre :

```bash
cd /Users/superbot/elevo
git stash push -m "wip avant refonte" -- src/app/child/\[id\]/chapter
```

- [ ] **Step 1.2 : Créer et basculer sur la branche `refonte-adibou-fondations`**

```bash
git checkout -b refonte-adibou-fondations
```

Expected: `Switched to a new branch 'refonte-adibou-fondations'`

- [ ] **Step 1.3 : Tag de safety sur `main` pour pouvoir revenir en arrière**

```bash
git tag pre-refonte-adibou-$(date +%Y%m%d) main
```

Expected: tag créé en local. (Ne pas push ce tag sauf si on veut le garder sur le remote.)

- [ ] **Step 1.4 : Commit vide de début pour marquer le début du plan**

```bash
git commit --allow-empty -m "chore: start refonte-adibou Plan 1 — Fondations"
```

Expected: nouveau commit vide sur la branche `refonte-adibou-fondations`.

---

## Task 2 — Installation et configuration de Vitest + Playwright

**Files:**
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/engine/__tests__/smoke.test.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (dépendances + scripts)

- [ ] **Step 2.1 : Installer Vitest et ses helpers**

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Expected: dépendances installées sans erreur. Si `typescript` est à une version invalide (`^6.0.2` dans l'actuel `package.json`), `npm` peut se plaindre — dans ce cas corriger à `"typescript": "^5.6.3"` et relancer.

- [ ] **Step 2.2 : Installer Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Expected: binaire Chromium installé.

- [ ] **Step 2.3 : Créer `vitest.config.ts`**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'tests/e2e/**', '.next'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**'],
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 2.4 : Créer `src/test/setup.ts`**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2.5 : Créer `playwright.config.ts`**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2.6 : Ajouter les scripts dans `package.json`**

Modify `package.json` — ajouter dans la section `scripts` :

```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "prisma generate && prisma db push --skip-generate --accept-data-loss && next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "npx tsx prisma/seed.ts",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2.7 : Premier test unitaire smoke qui valide que Vitest tourne**

```typescript
// src/engine/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('vitest smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2.8 : Exécuter le test unitaire**

```bash
npm run test:run -- src/engine/__tests__/smoke.test.ts
```

Expected: `1 passed`.

- [ ] **Step 2.9 : Premier test e2e smoke qui vérifie que la homepage répond**

```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('homepage répond', async ({ page }) => {
  await page.goto('/');
  // On vérifie juste qu'on a une balise <html> et qu'il n'y a pas eu d'erreur 500
  await expect(page.locator('html')).toBeAttached();
});
```

- [ ] **Step 2.10 : Commit**

```bash
git add vitest.config.ts playwright.config.ts src/test/setup.ts src/engine/__tests__/smoke.test.ts tests/e2e/smoke.spec.ts package.json package-lock.json
git commit -m "chore: add Vitest + Playwright test infrastructure"
```

---

## Task 3 — Scaffolder `src/engine/` (types + premier cas TDD réel)

**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/diagnostic/types.ts`
- Create: `src/engine/diagnostic/scoring.ts`
- Create: `src/engine/diagnostic/__tests__/scoring.test.ts`
- Create: `src/engine/ai/client.ts` (stub)
- Create: `src/engine/tts/provider.ts` (interface uniquement)
- Create: `src/engine/observation/collector.ts` (stub)
- Create: `src/engine/exercises/library.ts` (stub)
- Create: `src/engine/game-kit/types.ts`
- Create: `src/engine/README.md`

- [ ] **Step 3.1 : Écrire d'abord le test qui guide l'API du scoring**

```typescript
// src/engine/diagnostic/__tests__/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { computeBand, type RawScore } from '../scoring';

describe('computeBand', () => {
  it('classifie "normal" quand la précision est ≥ 0.75', () => {
    const raw: RawScore = { correct: 80, total: 100, durationMs: 60_000, errors: [] };
    expect(computeBand(raw)).toBe('normal');
  });

  it('classifie "attention" quand la précision est entre 0.50 et 0.75', () => {
    const raw: RawScore = { correct: 60, total: 100, durationMs: 60_000, errors: [] };
    expect(computeBand(raw)).toBe('attention');
  });

  it('classifie "preoccupant" quand la précision est < 0.50', () => {
    const raw: RawScore = { correct: 30, total: 100, durationMs: 60_000, errors: [] };
    expect(computeBand(raw)).toBe('preoccupant');
  });

  it('lève une erreur si total est 0', () => {
    const raw: RawScore = { correct: 0, total: 0, durationMs: 0, errors: [] };
    expect(() => computeBand(raw)).toThrow('total must be > 0');
  });
});
```

- [ ] **Step 3.2 : Exécuter le test pour vérifier qu'il échoue (rouge)**

```bash
npm run test:run -- src/engine/diagnostic/__tests__/scoring.test.ts
```

Expected: `FAIL` avec erreur d'import (`scoring.ts` n'existe pas encore).

- [ ] **Step 3.3 : Écrire l'implémentation minimale**

```typescript
// src/engine/diagnostic/types.ts
export type ErrorTaxonomy =
  | 'substitution'
  | 'omission'
  | 'inversion'
  | 'addition'
  | 'confusion_phoneme'
  | 'other';

export type Band = 'normal' | 'attention' | 'preoccupant';
```

```typescript
// src/engine/diagnostic/scoring.ts
import type { Band, ErrorTaxonomy } from './types';

export interface RawScore {
  correct: number;
  total: number;
  durationMs: number;
  errors: ErrorTaxonomy[];
}

export interface NormedScore {
  percentile: number;
  standardDeviation: number;
  classReference: string;
  band: Band;
  source: string;
}

/**
 * Classifie une précision brute en 3 bandes.
 * Règle provisoire du MVP : 0..0.5 = preoccupant, 0.5..0.75 = attention, >= 0.75 = normal.
 * À remplacer par une classification adossée aux normes par protocole dans les plans ultérieurs.
 */
export function computeBand(raw: RawScore): Band {
  if (raw.total <= 0) {
    throw new Error('total must be > 0');
  }
  const accuracy = raw.correct / raw.total;
  if (accuracy < 0.5) return 'preoccupant';
  if (accuracy < 0.75) return 'attention';
  return 'normal';
}
```

- [ ] **Step 3.4 : Relancer le test pour vérifier qu'il passe (vert)**

```bash
npm run test:run -- src/engine/diagnostic/__tests__/scoring.test.ts
```

Expected: `4 passed`.

- [ ] **Step 3.5 : Créer les stubs et types pour les autres sous-dossiers du moteur**

```typescript
// src/engine/types.ts
export type Parcours = 'PETITS' | 'EXPLORATEURS' | 'AVENTURIERS' | 'LYCEENS';

export interface Child {
  id: string;
  firstName: string;
  birthdate: Date;
  parcours: Parcours;
}
```

```typescript
// src/engine/ai/client.ts
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
```

```typescript
// src/engine/tts/provider.ts
// Interface TTS qu'une implémentation OpenAI ou Web Speech devra satisfaire.
// Implémentations concrètes dans le Plan 2.

export type Voice = 'nova' | 'alloy' | 'echo';

export interface TTSProvider {
  synthesize(text: string, voice: Voice): Promise<ArrayBuffer>;
}
```

```typescript
// src/engine/observation/collector.ts
// Collecteur d'observations ambiantes. Implémentation réelle dans le Plan 3.

export type ObservationDomain =
  | 'READING_SPEED'
  | 'READING_ACCURACY'
  | 'PHONOLOGY'
  | 'WRITING'
  | 'NUMERIC'
  | 'ATTENTION'
  | 'MEMORY'
  | 'VISUO_SPATIAL'
  | 'MOTOR';

export interface ObservationInput {
  childId: string;
  sessionId?: string;
  domain: ObservationDomain;
  signal: string;
  weight: number;
  context?: Record<string, unknown>;
}

export interface ObservationCollector {
  record(input: ObservationInput): Promise<void>;
}
```

```typescript
// src/engine/exercises/library.ts
// Index de la bibliothèque d'exercices d'orthophonie. Contenu dans le Plan 8.

export interface ExerciseMeta {
  id: string;
  targetTrouble: 'dyslexie' | 'dysorthographie' | 'dyscalculie' | 'articulation';
  competency: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisites: string[];
}

export const exerciseLibrary: ExerciseMeta[] = [];
```

```typescript
// src/engine/game-kit/types.ts
// Primitives pour les mini-jeux. Implémentation dans le Plan 3.

export interface GameSessionContext {
  childId: string;
  planetSlug: string;
  activitySlug: string;
  startedAt: Date;
}

export interface GameResult {
  score: number;
  durationMs: number;
  metadata?: Record<string, unknown>;
}
```

- [ ] **Step 3.6 : Créer `src/engine/README.md` qui documente la structure et les règles**

```markdown
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
- `tts/` — interface TTS et providers (OpenAI, Web Speech)

## Tests

```bash
npm run test          # watch mode
npm run test:run      # single run
npm run test:coverage # avec couverture
```

La couverture cible est 100% sur `src/engine/diagnostic/scoring.ts` et `src/engine/diagnostic/alerts.ts` (fonctions critiques).
```

- [ ] **Step 3.7 : Relancer tous les tests unitaires**

```bash
npm run test:run
```

Expected: `2 passed` (smoke + scoring).

- [ ] **Step 3.8 : Commit**

```bash
git add src/engine/ src/test/
git commit -m "feat(engine): scaffold engine/ with types, scoring and first unit test"
```

---

## Task 4 — Remplacer le schéma Prisma

**Files:**
- Modify: `prisma/schema.prisma` (réécriture complète)

- [ ] **Step 4.1 : Réécrire entièrement `prisma/schema.prisma`**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// --- Comptes ---

enum UserRole {
  PARENT
  PRO
  ADMIN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         UserRole @default(PARENT)
  proCode      String?  @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  children   Child[] @relation("ParentChildren")
  proClients Child[] @relation("ProSupervises")
}

// --- Enfant ---

enum Parcours {
  PETITS
  EXPLORATEURS
  AVENTURIERS
  LYCEENS
}

model Child {
  id        String   @id @default(cuid())
  parentId  String
  parent    User     @relation("ParentChildren", fields: [parentId], references: [id], onDelete: Cascade)
  proId     String?
  pro       User?    @relation("ProSupervises", fields: [proId], references: [id], onDelete: SetNull)

  firstName String
  birthdate DateTime
  parcours  Parcours
  avatar    Json?

  xp             Int      @default(0)
  level          Int      @default(1)
  planetsVisited String[] @default([])

  // Agrégat calculé à partir des Observation et Bilan — jamais source de vérité
  dysProfile Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions     GameSession[]
  observations Observation[]
  bilans       Bilan[]
  exerciseLogs ExerciseLog[]
  alerts       Alert[]
}

// --- Sessions de jeu ---

model GameSession {
  id           String    @id @default(cuid())
  childId      String
  child        Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  planetSlug   String
  activitySlug String
  startedAt    DateTime  @default(now())
  endedAt      DateTime?
  score        Int?
  metadata     Json?

  observations Observation[]
}

// --- Observations ambiantes ---

enum ObservationDomain {
  READING_SPEED
  READING_ACCURACY
  PHONOLOGY
  WRITING
  NUMERIC
  ATTENTION
  MEMORY
  VISUO_SPATIAL
  MOTOR
}

model Observation {
  id        String            @id @default(cuid())
  childId   String
  child     Child             @relation(fields: [childId], references: [id], onDelete: Cascade)
  sessionId String?
  session   GameSession?      @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  domain    ObservationDomain
  signal    String
  weight    Float
  context   Json?
  createdAt DateTime          @default(now())
}

// --- Bilans standardisés (Cabinet) ---

enum BilanMode {
  PARENT
  PRO
}

enum BilanTrigger {
  PARENT_REQUEST
  PRO_REQUEST
  AI_SUGGESTION
}

model Bilan {
  id              String       @id @default(cuid())
  childId         String
  child           Child        @relation(fields: [childId], references: [id], onDelete: Cascade)
  protocolId      String
  protocolVersion String
  startedAt       DateTime     @default(now())
  completedAt     DateTime?
  rawAnswers      Json
  rawScores       Json?
  normedScores    Json?
  interpretation  String?
  mode            BilanMode
  triggeredBy     BilanTrigger
}

// --- Exercices d'orthophonie ---

model ExerciseLog {
  id            String    @id @default(cuid())
  childId       String
  child         Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  exerciseId    String
  targetTrouble String
  difficulty    Int
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  success       Boolean?
  metadata      Json?
}

// --- Alertes parent ---

enum AlertSeverity {
  INFO
  ATTENTION
  IMPORTANT
}

model Alert {
  id             String        @id @default(cuid())
  childId        String
  child          Child         @relation(fields: [childId], references: [id], onDelete: Cascade)
  severity       AlertSeverity
  title          String
  body           String
  observationIds String[]
  createdAt      DateTime      @default(now())
  acknowledgedAt DateTime?
  action         String?
}
```

- [ ] **Step 4.2 : Générer le client Prisma**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client`.

- [ ] **Step 4.3 : Commit (avant push DB, pour pouvoir rollback si le push casse)**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): replace schema with refonte models (User, Child, Observation, Bilan, Alert...)"
```

---

## Task 5 — Simplifier `src/lib/auth.ts` (retirer le PrismaAdapter)

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 5.1 : Réécrire `src/lib/auth.ts` sans PrismaAdapter**

Contexte : on n'utilise que le provider `Credentials` avec session JWT, donc le `PrismaAdapter` ne sert à rien. Le retirer nous libère des modèles `Account`, `Session`, `VerificationToken` qu'on n'a pas dans le nouveau schéma.

```typescript
// src/lib/auth.ts
import NextAuth, { type User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 5.2 : Supprimer `@auth/prisma-adapter` de `package.json`**

```bash
npm uninstall @auth/prisma-adapter
```

- [ ] **Step 5.3 : Vérifier que le typecheck passe**

```bash
npm run typecheck
```

Expected: pas d'erreur. (Note : `typecheck` peut encore se plaindre d'anciens fichiers `src/app/child/...` qui référencent d'anciens modèles Prisma. On les nuke dans la Task 7, donc ces erreurs sont attendues et on les résoudra là-bas. Si d'autres erreurs apparaissent dans `src/lib/auth.ts` ou ses imports, les corriger maintenant.)

- [ ] **Step 5.4 : Commit**

```bash
git add src/lib/auth.ts package.json package-lock.json
git commit -m "refactor(auth): drop PrismaAdapter — JWT-only with Credentials"
```

---

## Task 6 — Pousser le nouveau schéma en DB et vérifier

**Files:**
- (aucun fichier — opérations DB)

- [ ] **Step 6.1 : ⚠️ AVANT de push le schéma, confirmer la DB cible**

Run: `cd /Users/superbot/elevo && cat .env 2>/dev/null | grep DATABASE_URL || echo "no .env"`

Expected: voir le `DATABASE_URL` utilisé. **Si c'est une DB de prod qui contient des données réelles, STOPPER ici et demander à l'utilisateur d'utiliser une DB dev séparée avant de continuer.** Le `--accept-data-loss` du script `build` va supprimer toutes les anciennes tables.

- [ ] **Step 6.2 : Push le schéma Prisma**

```bash
npx prisma db push --accept-data-loss
```

Expected: nouvelles tables créées (`User`, `Child`, `GameSession`, `Observation`, `Bilan`, `ExerciseLog`, `Alert`), anciennes tables supprimées (`ChildProfile`, `LearningSession`, `Achievement`, `Assessment`, `Chapter`, `ChapterStep`, `ChildProgress`, `DailyQuest`, `ShopItem`, `ChildInventory`, `ChildCurrency`, `Account`, `Session`, `VerificationToken`).

- [ ] **Step 6.3 : Ouvrir Prisma Studio pour vérification visuelle (optionnel mais recommandé)**

```bash
npx prisma studio
```

Expected: les 7 modèles nouveaux apparaissent et sont tous vides. Fermer studio avec Ctrl+C.

- [ ] **Step 6.4 : Pas de commit ici** (on n'a modifié que la DB, pas de fichier)

---

## Task 7 — Table rase : supprimer les routes et composants obsolètes

**Files:**
- Delete: `src/app/api/ai/`, `src/app/api/assessment/`, `src/app/api/children/`, `src/app/api/child/`, `src/app/api/dys-assessment/`, `src/app/api/parent/`, `src/app/api/progress/`, `src/app/api/quests/`, `src/app/api/seed/`, `src/app/api/sessions/`, `src/app/api/shop/`, `src/app/api/tts/`, `src/app/api/user/`
- Delete: `src/app/child/`, `src/app/parent/`, `src/app/dashboard/`, `src/app/cgu/`, `src/app/confidentialite/`, `src/app/contact/`, `src/app/app/`, `src/app/not-found.tsx` (si présent et lié à l'ancien design)
- Delete: `src/components/` (presque tout, on garde `SessionProvider.tsx` et on recrée ce dont on a besoin)
- Delete: `src/lib/fallback-stories.ts`, `src/lib/gamification.ts`
- Keep: `src/app/api/auth/`, `src/app/login/`, `src/app/register/`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/utils.ts` (si existe), `src/components/SessionProvider.tsx`

- [ ] **Step 7.1 : Supprimer les routes API obsolètes**

```bash
cd /Users/superbot/elevo
rm -rf src/app/api/ai \
       src/app/api/assessment \
       src/app/api/children \
       src/app/api/child \
       src/app/api/dys-assessment \
       src/app/api/parent \
       src/app/api/progress \
       src/app/api/quests \
       src/app/api/seed \
       src/app/api/sessions \
       src/app/api/shop \
       src/app/api/tts \
       src/app/api/user
```

Expected: ne reste que `src/app/api/auth` et `src/app/api/register` (si register existe en API).

- [ ] **Step 7.2 : Vérifier ce qu'il reste dans `src/app/api`**

```bash
ls src/app/api
```

Expected: `auth` (+ éventuellement `register` si c'est une route API). Si `register` est présent, le garder.

- [ ] **Step 7.3 : Supprimer les pages obsolètes**

```bash
rm -rf src/app/child \
       src/app/parent \
       src/app/dashboard \
       src/app/cgu \
       src/app/confidentialite \
       src/app/contact \
       src/app/app
```

- [ ] **Step 7.4 : Supprimer les composants obsolètes — garder uniquement `SessionProvider.tsx`**

```bash
cd /Users/superbot/elevo/src/components
ls | grep -v '^SessionProvider.tsx$' | grep -v '^ui$' | xargs -I {} rm -rf {}
ls
```

Expected: sortie = `SessionProvider.tsx` et éventuellement `ui/` si ce dossier existe et contient des primitives Button/Card/Modal qu'on veut garder. Sinon, juste `SessionProvider.tsx`.

- [ ] **Step 7.5 : Inspecter `src/components/ui/` s'il existe — décider quoi garder**

```bash
ls src/components/ui 2>/dev/null
```

Si `ui/` contient des primitives utiles (Button, Card, Modal, Toast), **les garder**. Sinon ou en cas de doute, **supprimer le dossier entier** — on reconstruira des primitives propres au Plan 2.

```bash
# Si on décide de supprimer:
rm -rf src/components/ui
```

- [ ] **Step 7.6 : Supprimer les libs obsolètes**

```bash
rm -f src/lib/fallback-stories.ts src/lib/gamification.ts
ls src/lib
```

Expected: `auth.ts`, `prisma.ts` (et `utils.ts` s'il existe).

- [ ] **Step 7.7 : Typecheck pour identifier les imports cassés**

```bash
npm run typecheck 2>&1 | head -80
```

Expected: une liste d'erreurs d'imports. Les fichiers qui cassent sont soit `src/app/page.tsx` (landing), soit `src/middleware.ts`. On les corrige dans les tasks suivantes.

- [ ] **Step 7.8 : Commit** (même si le typecheck casse — on est en cours de table rase, le commit marque l'étape "suppression")

```bash
git add -A
git commit -m "chore: nuke old routes, components and libs for refonte"
```

---

## Task 8 — Créer les stubs pour les 4 parcours, parent et pro

**Files:**
- Create: `src/app/explorateurs/[childId]/page.tsx`
- Create: `src/app/explorateurs/[childId]/layout.tsx`
- Create: `src/app/petits/[childId]/page.tsx`
- Create: `src/app/aventuriers/[childId]/page.tsx`
- Create: `src/app/lyceens/[childId]/page.tsx`
- Create: `src/app/parent/page.tsx`
- Create: `src/app/pro/page.tsx`

- [ ] **Step 8.1 : Créer le stub du parcours Explorateurs (le seul qu'on développera dans ce MVP)**

```tsx
// src/app/explorateurs/[childId]/page.tsx
export default function ExplorateurStationPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-wider text-slate-500">
        Station Elevo — parcours Explorateurs (6-10 ans)
      </p>
      <h1 className="text-3xl font-semibold">Bienvenue, petit·e astronaute ✨</h1>
      <p className="text-slate-400">
        Ici viendra le hub Station avec LUMO et les 6 planètes.
      </p>
      <p className="text-xs text-slate-600">childId : {params.childId}</p>
    </main>
  );
}
```

```tsx
// src/app/explorateurs/[childId]/layout.tsx
export default function ExplorateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 8.2 : Créer les stubs "bientôt disponible" pour les 3 autres parcours**

```tsx
// src/app/petits/[childId]/page.tsx
export default function PetitsStubPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold text-amber-900">Les Petits — bientôt disponible</h1>
      <p className="text-amber-800">
        Le parcours 4-6 ans arrive prochainement.
      </p>
      <p className="text-xs text-amber-700">childId : {params.childId}</p>
    </main>
  );
}
```

```tsx
// src/app/aventuriers/[childId]/page.tsx
export default function AventuriersStubPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold text-indigo-900">Les Aventuriers — bientôt disponible</h1>
      <p className="text-indigo-800">Le parcours 10-14 ans arrive prochainement.</p>
      <p className="text-xs text-indigo-700">childId : {params.childId}</p>
    </main>
  );
}
```

```tsx
// src/app/lyceens/[childId]/page.tsx
export default function LyceensStubPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Lycéens — bientôt disponible</h1>
      <p className="text-slate-700">Le parcours 14-18 ans arrive prochainement.</p>
      <p className="text-xs text-slate-500">childId : {params.childId}</p>
    </main>
  );
}
```

- [ ] **Step 8.3 : Créer le stub du dashboard parent**

```tsx
// src/app/parent/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-wider text-slate-500">Dashboard parent</p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Bonjour {session.user.name ?? session.user.email} 👋
      </h1>
      <p className="text-slate-600">
        Le dashboard parent sera construit dans le Plan 5.
      </p>
    </main>
  );
}
```

- [ ] **Step 8.4 : Créer le stub du dashboard pro**

```tsx
// src/app/pro/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-wider text-slate-500">Mode Pro — Orthophoniste</p>
      <h1 className="text-3xl font-semibold">Cabinet LUMO</h1>
      <p className="text-slate-400">Le mode pro sera construit dans le Plan 9.</p>
    </main>
  );
}
```

- [ ] **Step 8.5 : Commit**

```bash
git add src/app/explorateurs src/app/petits src/app/aventuriers src/app/lyceens src/app/parent src/app/pro
git commit -m "feat(app): add stub pages for 4 parcours + parent + pro dashboards"
```

---

## Task 9 — Route `/onboarding` avec logique de dispatch (TDD)

**Files:**
- Create: `src/engine/onboarding/dispatch.ts`
- Create: `src/engine/onboarding/__tests__/dispatch.test.ts`
- Create: `src/app/onboarding/page.tsx`

- [ ] **Step 9.1 : Écrire d'abord le test de la fonction de dispatch (pure)**

```typescript
// src/engine/onboarding/__tests__/dispatch.test.ts
import { describe, it, expect } from 'vitest';
import { computeParcours, routeForChild } from '../dispatch';

describe('computeParcours', () => {
  const today = new Date('2026-04-10');

  it('renvoie PETITS pour un enfant de 4 ans', () => {
    const birth = new Date('2022-04-10');
    expect(computeParcours(birth, today)).toBe('PETITS');
  });

  it('renvoie PETITS pour un enfant de 5 ans', () => {
    const birth = new Date('2021-01-10');
    expect(computeParcours(birth, today)).toBe('PETITS');
  });

  it('renvoie EXPLORATEURS pour un enfant de 6 ans', () => {
    const birth = new Date('2020-01-10');
    expect(computeParcours(birth, today)).toBe('EXPLORATEURS');
  });

  it('renvoie EXPLORATEURS pour un enfant de 9 ans', () => {
    const birth = new Date('2017-01-10');
    expect(computeParcours(birth, today)).toBe('EXPLORATEURS');
  });

  it('renvoie AVENTURIERS pour un enfant de 10 ans', () => {
    const birth = new Date('2016-01-10');
    expect(computeParcours(birth, today)).toBe('AVENTURIERS');
  });

  it('renvoie AVENTURIERS pour un enfant de 13 ans', () => {
    const birth = new Date('2012-06-10');
    expect(computeParcours(birth, today)).toBe('AVENTURIERS');
  });

  it('renvoie LYCEENS pour un enfant de 14 ans', () => {
    const birth = new Date('2012-01-10');
    expect(computeParcours(birth, today)).toBe('LYCEENS');
  });

  it('renvoie LYCEENS pour un enfant de 18 ans', () => {
    const birth = new Date('2007-11-10');
    expect(computeParcours(birth, today)).toBe('LYCEENS');
  });

  it('lève une erreur pour un enfant < 4 ans', () => {
    const birth = new Date('2023-01-10');
    expect(() => computeParcours(birth, today)).toThrow('age_out_of_range');
  });

  it('lève une erreur pour un enfant > 18 ans', () => {
    const birth = new Date('2006-01-10');
    expect(() => computeParcours(birth, today)).toThrow('age_out_of_range');
  });
});

describe('routeForChild', () => {
  it('renvoie /explorateurs/[id] pour parcours EXPLORATEURS', () => {
    expect(routeForChild({ id: 'c1', parcours: 'EXPLORATEURS' })).toBe('/explorateurs/c1');
  });

  it('renvoie /petits/[id] pour parcours PETITS', () => {
    expect(routeForChild({ id: 'c2', parcours: 'PETITS' })).toBe('/petits/c2');
  });

  it('renvoie /aventuriers/[id] pour parcours AVENTURIERS', () => {
    expect(routeForChild({ id: 'c3', parcours: 'AVENTURIERS' })).toBe('/aventuriers/c3');
  });

  it('renvoie /lyceens/[id] pour parcours LYCEENS', () => {
    expect(routeForChild({ id: 'c4', parcours: 'LYCEENS' })).toBe('/lyceens/c4');
  });
});
```

- [ ] **Step 9.2 : Exécuter pour voir l'échec**

```bash
npm run test:run -- src/engine/onboarding/__tests__/dispatch.test.ts
```

Expected: `FAIL` — import introuvable.

- [ ] **Step 9.3 : Implémenter `dispatch.ts`**

```typescript
// src/engine/onboarding/dispatch.ts
import type { Parcours } from '../types';

/**
 * Calcule le parcours d'un enfant à partir de sa date de naissance.
 *
 * Seuils basés sur §5.1 et §2 du spec refonte :
 *   4-5 ans  → PETITS
 *   6-9 ans  → EXPLORATEURS
 *   10-13 ans → AVENTURIERS
 *   14-18 ans → LYCEENS
 *
 * Les enfants hors de [4, 18] lèvent `age_out_of_range`.
 */
export function computeParcours(birthdate: Date, today: Date = new Date()): Parcours {
  const age = computeAge(birthdate, today);
  if (age < 4 || age > 18) {
    throw new Error('age_out_of_range');
  }
  if (age <= 5) return 'PETITS';
  if (age <= 9) return 'EXPLORATEURS';
  if (age <= 13) return 'AVENTURIERS';
  return 'LYCEENS';
}

/**
 * Âge en années révolues (date-of-birth aware, pas approximation par division).
 */
function computeAge(birthdate: Date, today: Date): number {
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Retourne la route Next.js à utiliser pour un enfant, selon son parcours.
 */
export function routeForChild(child: { id: string; parcours: Parcours }): string {
  switch (child.parcours) {
    case 'PETITS':
      return `/petits/${child.id}`;
    case 'EXPLORATEURS':
      return `/explorateurs/${child.id}`;
    case 'AVENTURIERS':
      return `/aventuriers/${child.id}`;
    case 'LYCEENS':
      return `/lyceens/${child.id}`;
  }
}
```

- [ ] **Step 9.4 : Relancer le test**

```bash
npm run test:run -- src/engine/onboarding/__tests__/dispatch.test.ts
```

Expected: `14 passed`.

- [ ] **Step 9.5 : Créer la route `/onboarding` qui consomme `dispatch.ts`**

```tsx
// src/app/onboarding/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeParcours, routeForChild } from '@/engine/onboarding/dispatch';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { childId?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const parentId = (session.user as { id: string }).id;
  const { childId } = searchParams;

  // Cas 1 : pas de childId → lister les enfants du parent
  if (!childId) {
    const children = await prisma.child.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
    if (children.length === 0) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-2xl font-semibold">Aucun enfant enregistré</h1>
          <p className="text-slate-600">
            Ajoute un premier enfant depuis ton dashboard parent pour commencer.
          </p>
          <a href="/parent" className="underline text-indigo-600">
            Aller au dashboard parent
          </a>
        </main>
      );
    }
    // Si un seul enfant → on dispatche directement
    if (children.length === 1) {
      const child = children[0];
      const parcours = child.parcours ?? computeParcours(child.birthdate);
      redirect(routeForChild({ id: child.id, parcours }));
    }
    // Sinon → choisir quel enfant (UI minimale pour le MVP)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold">Quel enfant rejoint la station ?</h1>
        <ul className="flex flex-col gap-2">
          {children.map((c) => (
            <li key={c.id}>
              <a
                href={`/onboarding?childId=${c.id}`}
                className="underline text-indigo-600"
              >
                {c.firstName}
              </a>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  // Cas 2 : childId fourni → dispatcher vers le bon parcours
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!child) {
    redirect('/parent');
  }

  const parcours = child.parcours ?? computeParcours(child.birthdate);
  redirect(routeForChild({ id: child.id, parcours }));
}
```

- [ ] **Step 9.6 : Typecheck**

```bash
npm run typecheck
```

Expected: pas d'erreur sur les nouveaux fichiers. Si `session.user` type cause un souci, utiliser une assertion de type `(session.user as { id: string }).id` comme fait ci-dessus.

- [ ] **Step 9.7 : Commit**

```bash
git add src/engine/onboarding src/app/onboarding
git commit -m "feat(onboarding): add /onboarding route that dispatches by parcours (TDD)"
```

---

## Task 10 — Mettre à jour `src/middleware.ts` pour les nouvelles routes

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 10.1 : Réécrire le middleware avec les nouveaux matchers**

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/parent/:path*',
    '/pro/:path*',
    '/explorateurs/:path*',
    '/petits/:path*',
    '/aventuriers/:path*',
    '/lyceens/:path*',
  ],
};
```

- [ ] **Step 10.2 : Commit**

```bash
git add src/middleware.ts
git commit -m "chore(middleware): update matchers for new parcours routes"
```

---

## Task 11 — Mettre à jour minimalement la landing page

**Files:**
- Modify: `src/app/page.tsx` (seulement si nécessaire pour le build)
- Modify: `src/app/layout.tsx` (métadonnées)

- [ ] **Step 11.1 : Lancer le build pour voir si la landing casse**

```bash
npm run build 2>&1 | tail -60
```

Expected: deux scénarios possibles :
- ✅ Le build passe → sauter à Step 11.4
- ❌ Le build casse → la landing importe probablement des composants supprimés dans Task 7. Aller à Step 11.2.

- [ ] **Step 11.2 : Si le build casse, identifier les imports cassés dans `src/app/page.tsx`**

```bash
npm run typecheck 2>&1 | grep "src/app/page.tsx"
```

- [ ] **Step 11.3 : Remplacer `src/app/page.tsx` par une landing minimale qui ne dépend que des primitives**

```tsx
// src/app/page.tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100 flex flex-col items-center justify-center gap-8 p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">Elevo</p>
      <h1 className="text-5xl font-bold text-center max-w-3xl">
        La Station Elevo
      </h1>
      <p className="text-lg text-slate-400 text-center max-w-2xl">
        Une plateforme éducative adaptative pour les enfants de 4 à 18 ans,
        avec repérage des signes de troubles dys et exercices d&apos;orthophonie ludiques.
      </p>
      <div className="flex gap-4 mt-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-full bg-indigo-500 hover:bg-indigo-400 font-medium transition"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-full border border-slate-700 hover:border-slate-500 transition"
        >
          Créer un compte
        </Link>
      </div>
      <p className="absolute bottom-4 text-xs text-slate-600">
        Refonte en cours — version Plan 1 Fondations
      </p>
    </main>
  );
}
```

- [ ] **Step 11.4 : Ajuster les métadonnées du layout pour ne plus mentionner l'ancienne promesse "3 à 18 ans"**

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

const siteUrl = 'https://elevo-five.vercel.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/favicon.svg',
  },
  title: {
    default: 'Elevo — La Station éducative IA pour enfants',
    template: '%s — Elevo',
  },
  description:
    "Elevo accompagne les enfants de 4 à 18 ans avec un parcours éducatif adaptatif, un repérage des signes de troubles dys et des exercices d'orthophonie ludiques.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Elevo',
    title: 'Elevo — La Station éducative IA pour enfants',
    description:
      "Parcours adaptatif de 4 à 18 ans, repérage des troubles dys, exercices d'orthophonie.",
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 min-h-screen antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 11.5 : Rebuild pour confirmer**

```bash
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`.

- [ ] **Step 11.6 : Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat(landing): minimal landing page + layout for refonte Station"
```

---

## Task 12 — Mettre à jour le `.gitignore` pour ignorer les dossiers tooling

**Files:**
- Modify: `.gitignore`

- [ ] **Step 12.1 : Ajouter `.superpowers/` et `.serena/`**

```bash
cd /Users/superbot/elevo
cat .gitignore | tail -20
```

Ajouter à la fin de `.gitignore` :

```
# Tooling local
.superpowers/
.serena/

# Audit scripts (non-committed locals)
audit-*.ts
audit-screenshots/
.env.vercel
```

- [ ] **Step 12.2 : Vérifier qu'aucun fichier de ces dossiers n'est déjà tracké**

```bash
git ls-files | grep -E '\.superpowers|\.serena' | head
```

Expected: aucune ligne. S'il y en a, les retirer de l'index avec `git rm --cached <file>`.

- [ ] **Step 12.3 : Commit**

```bash
git add .gitignore
git commit -m "chore(git): ignore tooling dirs (.superpowers, .serena) and audit scripts"
```

---

## Task 13 — Test e2e smoke complet sur les nouvelles routes

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 13.1 : Étendre le test e2e**

```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('smoke — post-refonte Fondations', () => {
  test('homepage affiche "Station Elevo"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Station Elevo/i })).toBeVisible();
  });

  test('page login est accessible', async ({ page }) => {
    await page.goto('/login');
    // on vérifie qu'on n'a pas une erreur 500 en regardant qu'une input email existe
    const emailInputs = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInputs.first()).toBeVisible({ timeout: 10_000 });
  });

  test('page register est accessible', async ({ page }) => {
    await page.goto('/register');
    const emailInputs = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInputs.first()).toBeVisible({ timeout: 10_000 });
  });

  test('/parent sans session redirige vers /login', async ({ page }) => {
    await page.goto('/parent');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/onboarding sans session redirige vers /login', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

- [ ] **Step 13.2 : Lancer les tests e2e**

```bash
npm run test:e2e
```

Expected: 5 tests passés. Note : Playwright va lancer `npm run dev` automatiquement via `webServer`. Si le dev server met du temps à démarrer, le `timeout: 120_000` dans `playwright.config.ts` couvre.

**Si un test échoue :**
- `homepage` : vérifier que `src/app/page.tsx` contient bien le heading "Station Elevo"
- `login`/`register` : vérifier que leurs pages n'ont pas été cassées par la table rase
- redirections : vérifier que le middleware est bien configuré (Task 10)

- [ ] **Step 13.3 : Commit**

```bash
git add tests/e2e/smoke.spec.ts
git commit -m "test(e2e): smoke tests for homepage, auth pages and redirect middleware"
```

---

## Task 14 — Vérification finale, build, typecheck, tests tous ensemble

**Files:**
- (aucun — seulement des commandes de validation)

- [ ] **Step 14.1 : Typecheck complet**

```bash
npm run typecheck
```

Expected: `✓ no errors`. Si des erreurs persistent, les corriger avant de continuer.

- [ ] **Step 14.2 : Tous les tests unitaires**

```bash
npm run test:run
```

Expected: tous les tests passent (smoke + scoring + dispatch = ~19 tests).

- [ ] **Step 14.3 : Build Next.js**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Des warnings ESLint sont acceptables. **Des erreurs de type ou de compilation ne le sont pas.**

- [ ] **Step 14.4 : Lancer le dev server manuellement pour vérification visuelle**

```bash
npm run dev
```

Dans un autre terminal ou dans le navigateur :
- `http://localhost:3002/` → doit afficher "La Station Elevo"
- `http://localhost:3002/login` → formulaire de login
- `http://localhost:3002/parent` → redirection vers `/login`
- `http://localhost:3002/explorateurs/test-id` → page Explorateurs stub (pas de protection middleware redirigeant vers login car pas connecté — normal, le middleware est appliqué mais l'Auth.js va laisser passer par défaut tant qu'on n'a pas défini le callback `authorized`. Si on veut protéger, on le fera dans une task future.)

Kill le dev server avec Ctrl+C.

- [ ] **Step 14.5 : Tests e2e complets**

```bash
npm run test:e2e
```

Expected: 5 tests passés.

- [ ] **Step 14.6 : Commit final vide qui marque la fin du Plan 1**

```bash
git commit --allow-empty -m "chore: end of Plan 1 — Fondations complete ✓"
```

---

## Task 15 — Mise à jour de la documentation du projet

**Files:**
- Modify: `CLAUDE.md` (à la racine d'elevo)

- [ ] **Step 15.1 : Lire le `CLAUDE.md` actuel**

```bash
cat CLAUDE.md
```

- [ ] **Step 15.2 : Mettre à jour la section "Architecture" du `CLAUDE.md` pour refléter la nouvelle structure**

Remplacer la section "Architecture" actuelle par :

```markdown
## Architecture (refonte Adibou — post Plan 1)

- `src/app/page.tsx` — landing page (Station Elevo)
- `src/app/login` + `register` — auth NextAuth v5 JWT (sans PrismaAdapter)
- `src/app/onboarding/` — route de dispatch post-login vers le bon parcours
- `src/app/parent/` — dashboard parent (stub, voir Plan 5)
- `src/app/pro/` — dashboard orthophoniste (stub, voir Plan 9)
- `src/app/explorateurs/[childId]/` — parcours 6-10 ans (développé dans Plans 2-8)
- `src/app/petits|aventuriers|lyceens/[childId]/` — stubs "bientôt disponible"
- `src/app/api/auth/` — NextAuth handler
- `src/engine/` — moteur métier **zéro-React**, sous-dossiers :
  - `ai/` — wrapper Anthropic (Plan 2+)
  - `diagnostic/` — protocoles dys, scoring, normes, alertes (Plans 4+6)
  - `exercises/` — bibliothèque orthophonie (Plan 8)
  - `game-kit/` — primitives mini-jeux (Plan 3)
  - `observation/` — collecte ambiante (Plan 3)
  - `tts/` — interface + providers (Plan 2)
  - `onboarding/dispatch.ts` — calcul parcours et route
- `prisma/schema.prisma` — nouveau schéma (User, Child, Observation, Bilan, ExerciseLog, Alert, GameSession, enums)
- `vitest.config.ts` + `src/test/setup.ts` — config tests unitaires
- `playwright.config.ts` + `tests/e2e/` — config tests e2e

## Tests

```bash
npm run test          # vitest watch
npm run test:run      # vitest single run
npm run test:e2e      # playwright
npm run typecheck     # tsc --noEmit
```

## Spec et plans

- Spec : `docs/superpowers/specs/2026-04-10-elevo-refonte-adibou-design.md`
- Plans : `docs/superpowers/plans/2026-04-10-elevo-refonte-fondations.md` (Plan 1, ce plan)
```

- [ ] **Step 15.3 : Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for refonte Adibou Plan 1 architecture"
```

---

## Critères de sortie du Plan 1

À la fin de l'exécution de ce plan, **tout ce qui suit doit être vrai** :

- [ ] `npm run typecheck` passe sans erreur
- [ ] `npm run test:run` passe avec ≥ 19 tests verts (smoke + scoring + dispatch)
- [ ] `npm run build` passe
- [ ] `npm run test:e2e` passe avec les 5 smoke tests
- [ ] La branche `refonte-adibou-fondations` contient une suite de commits atomiques et lisibles
- [ ] `src/engine/` est scaffoldée avec `types.ts`, `diagnostic/scoring.ts` testé à 100%, et des stubs pour les autres sous-dossiers
- [ ] Le schéma Prisma de la refonte est en base
- [ ] NextAuth v5 tourne sans `PrismaAdapter`, en mode Credentials + JWT uniquement
- [ ] `/onboarding` dispatche un enfant connecté vers le bon parcours (testé unitairement)
- [ ] Les 4 parcours ont au minimum une page stub qui répond
- [ ] `.gitignore` ignore `.superpowers/` et `.serena/`

---

## Ce qu'on NE fait PAS dans ce plan (cf. Plans suivants)

- ❌ Composants visuels de la Station Spatiale (Plan 2)
- ❌ LUMO animée (Plan 2)
- ❌ TTS OpenAI fonctionnel (Plan 2)
- ❌ Cinematic d'arrivée (Plan 2)
- ❌ Mini-jeux et observation ambiante réelle (Plan 3)
- ❌ Cabinet et protocoles dys (Plan 4)
- ❌ Dashboard parent avec contenu réel (Plan 5)
- ❌ Alertes et moteur d'analyse (Plan 6)
- ❌ Planètes 2 à 6 avec contenu (Plan 7)
- ❌ Bibliothèque orthophonie (Plan 8)
- ❌ Mode pro fonctionnel (Plan 9)
- ❌ RGPD / consentement / déploiement (Plan 10)

---

## Risques et mitigations pendant l'exécution

| Risque | Mitigation |
|---|---|
| `typescript: ^6.0.2` dans `package.json` est invalide → `npm install` peut échouer | Task 2.1 note le point, corriger à `^5.6.3` au besoin |
| `prisma db push --accept-data-loss` détruit des données réelles | Task 6.1 fait une vérif explicite du `DATABASE_URL`. Si doute, demander à l'utilisateur de pointer vers une DB dev. |
| `src/app/page.tsx` (553 lignes) importe des composants supprimés → build casse | Task 11 a une branche conditionnelle : si build OK, on touche rien ; sinon on remplace la landing par une version minimale. |
| Playwright `webServer` n'arrive pas à démarrer `npm run dev` | Augmenter le `timeout` dans `playwright.config.ts` ou lancer `npm run dev` dans un terminal séparé et retirer temporairement le bloc `webServer` |
| Des fichiers `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` référencent l'ancien contenu | Les laisser tels quels s'ils compilent. S'ils cassent le build, les simplifier ou les supprimer (ils sont accessoires pour le MVP). |
