# Elevo — App éducative pour enfants (IA adaptative)

## Stack
Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma PostgreSQL, NextAuth v5 beta
Port dev: 3002 | GitHub: save9999/elevo | Vercel: elevo-five.vercel.app

## Architecture
- `src/app/page.tsx` — landing page marketing (Nunito font, gradients colorés)
- `src/app/login/` + `register/` — auth NextAuth
- `src/app/parent/` — tableau de bord parent (gestion enfants, progrès)
- `src/app/child/[id]/` — hub enfant avec modules d'apprentissage
- `src/app/child/[id]/module/[module]/` — 9 modules (lecture, maths, mémoire, etc.)
- `src/app/child/[id]/chat/` — chat IA avec Lumo
- `src/app/child/[id]/lumo/` — compagnon IA animé
- `src/app/child/[id]/avatar/` — wizard avatar
- `src/app/api/ai/` — routes AI (chat, plan, character, assessment, exercise)
- `src/components/LumoCharacter.tsx` — personnage SVG animé avec états d'humeur
- `prisma/schema.prisma` — PostgreSQL (User, Child, ChildProfile, LearningSession, Achievement, Assessment)

## Env vars (Vercel)
- ANTHROPIC_API_KEY — clé Claude
- DATABASE_URL — PostgreSQL Neon
- NEXTAUTH_SECRET / NEXTAUTH_URL

## Features
- Comptes parent/enfant séparés
- 9 modules d'apprentissage adaptatifs
- Détection troubles (dyslexie, TDAH, dyscalculie)
- Système XP/niveau/badges
- Compagnon IA Lumo (humeurs: happy/excited/thinking/sleeping/sad)
- Langues: FR uniquement pour l'instant

## Model guide
- Bug fixes: haiku
- New features: haiku (simple UI)
- Complex AI features: sonnet
