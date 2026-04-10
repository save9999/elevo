# Refonte Elevo — Plan 2 : Hub Station + LUMO + voix off

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** À la fin de ce plan, un parent peut créer un enfant depuis `/parent`, se rendre sur `/onboarding` qui le redirige vers `/explorateurs/[childId]`, et voir le **hub Station Spatiale animé** avec 6 planètes en orbite et **LUMO** (sphère holographique pulsante) qui **dit bonjour à l'enfant par son prénom** en voix off.

**Architecture:** Composants React côté client dans `src/components/explorateurs/` pour l'UI animée (CSS + framer-motion). Moteur TTS dans `src/engine/tts/` avec provider Web Speech API (fallback) et interface prête pour OpenAI TTS. Le hub est statique côté interactions (clics planètes → placeholder pour Plan 3).

**Tech Stack:** Next.js 14 (RSC pour data fetching, client components pour animations), Tailwind, framer-motion, Web Speech API, Prisma.

**Référence spec :** §5.2-5.6 et §8.3 du spec refonte.

---

## Tasks

### Task 1 — API de création d'enfant (minimal)

**Files:**
- Create: `src/app/api/children/route.ts`
- Modify: `src/app/parent/page.tsx` (form minimal)

**Goal:** Permettre au parent connecté de créer un enfant avec `firstName` + `birthdate`. L'API calcule le `parcours` via `computeParcours` et le stocke.

- [ ] Step 1.1 : Créer `POST /api/children` qui lit la session, valide le body `{firstName, birthdate}`, calcule parcours, créé en DB via `prisma.child.create`, renvoie l'enfant en JSON.
- [ ] Step 1.2 : Remplacer le stub `/parent/page.tsx` par une page qui liste les enfants existants + un petit formulaire « Ajouter un enfant » (client component). Bouton « Entrer dans la station » pour chaque enfant qui pointe vers `/onboarding?childId=...`.
- [ ] Step 1.3 : Tester manuellement via curl ou navigateur après avoir enregistré un parent.
- [ ] Step 1.4 : Commit `feat(parent): minimal add-child form + POST /api/children`

### Task 2 — Composant LumoSphere

**Files:**
- Create: `src/components/explorateurs/lumo/LumoSphere.tsx`
- Create: `src/components/explorateurs/lumo/lumo-moods.css` (ou inline Tailwind)

**Goal:** Un composant `<LumoSphere mood="idle" size="md" />` qui affiche une sphère holographique avec 6 états d'humeur (`idle`, `speaking`, `thinking`, `happy`, `gentle`, `sleeping`). Utilise CSS gradient, box-shadow, animation pulse.

- [ ] Step 2.1 : Implémenter la sphère de base (forme, couleur, glow) en pure CSS + Tailwind.
- [ ] Step 2.2 : Ajouter les 6 variantes de mood via props.
- [ ] Step 2.3 : Exporter depuis `src/components/explorateurs/lumo/index.ts`.
- [ ] Step 2.4 : Commit `feat(lumo): LumoSphere component with 6 mood states`

### Task 3 — Composant StarField

**Files:**
- Create: `src/components/explorateurs/station/StarField.tsx`

**Goal:** Fond étoilé animé en CSS (3 couches d'étoiles à vitesses différentes pour parallaxe discret). Composant côté client ou serveur selon performance.

- [ ] Step 3.1 : Implémenter un `<StarField />` pur CSS.
- [ ] Step 3.2 : Commit `feat(station): StarField background component`

### Task 4 — Composant Station + PlanetOrb

**Files:**
- Create: `src/components/explorateurs/station/PlanetOrb.tsx`
- Create: `src/components/explorateurs/station/Station.tsx`
- Create: `src/components/explorateurs/station/planets-data.ts`

**Goal:** `<Station childFirstName="..." />` affiche la station centrale + 6 `<PlanetOrb>` disposés en cercle autour, chacun avec son emoji, son nom, sa couleur. Chaque planète tourne lentement en orbite (CSS `@keyframes`). Clic = placeholder pour Plan 3.

- [ ] Step 4.1 : Créer `planets-data.ts` avec la liste des 6 planètes (slug, nom, emoji, couleur, domaine, dysTargeted).
- [ ] Step 4.2 : Créer `PlanetOrb.tsx` (composant pure visuel avec hover).
- [ ] Step 4.3 : Créer `Station.tsx` qui dispose les 6 orbs en cercle via CSS transform (positions `rotate(n*60deg) translateY(-R) rotate(-n*60deg)`).
- [ ] Step 4.4 : Commit `feat(station): Station hub with 6 planets in orbit`

### Task 5 — Moteur TTS (Web Speech API provider)

**Files:**
- Create: `src/engine/tts/webspeech.ts`
- Create: `src/engine/tts/__tests__/webspeech.test.ts`
- Modify: `src/engine/tts/provider.ts` (garder comme interface)

**Goal:** Une implémentation `TTSProvider` basée sur Web Speech API côté navigateur. Elle prend un texte et une voix, et renvoie une promesse qui se résout quand la parole est terminée.

- [ ] Step 5.1 : Écrire un test qui vérifie que `WebSpeechProvider.synthesize('bonjour', 'nova')` ne throw pas quand `window.speechSynthesis` est mocké.
- [ ] Step 5.2 : Implémenter `WebSpeechProvider` qui wrappe `speechSynthesis.speak()` dans une Promise.
- [ ] Step 5.3 : Ajouter sélection de voix française (filtre sur `lang.startsWith('fr')`).
- [ ] Step 5.4 : Commit `feat(tts): Web Speech API provider with French voice selection`

### Task 6 — Composant LumoSpeaker (client)

**Files:**
- Create: `src/components/explorateurs/lumo/LumoSpeaker.tsx`
- Create: `src/components/explorateurs/lumo/useLumoVoice.ts` (hook)

**Goal:** Composant client `<LumoSpeaker text="Bonjour Léa" autoPlay onDone={...} />` qui :
1. Au mount (ou sur trigger), appelle le TTS
2. Pendant la parole, passe le `LumoSphere` en mood `speaking`
3. À la fin, callback `onDone` et revient à `idle`

Le hook `useLumoVoice()` encapsule la logique TTS.

- [ ] Step 6.1 : Créer le hook `useLumoVoice` qui gère état (`idle` | `speaking`) et appelle WebSpeechProvider.
- [ ] Step 6.2 : Créer `<LumoSpeaker>` qui compose `<LumoSphere>` + `useLumoVoice`.
- [ ] Step 6.3 : Commit `feat(lumo): LumoSpeaker + useLumoVoice hook`

### Task 7 — Intégration dans `/explorateurs/[childId]`

**Files:**
- Modify: `src/app/explorateurs/[childId]/page.tsx` (devient server component avec fetch Prisma)
- Create: `src/app/explorateurs/[childId]/_components/ExplorateurHubClient.tsx` (client wrapper pour animations)

**Goal:** La page `/explorateurs/[childId]` fetche l'enfant en DB (nom, parcours), vérifie qu'il appartient au parent connecté, puis rend le hub :
- `<StarField />`
- `<Station childFirstName={child.firstName} />`
- `<LumoSpeaker text="Bienvenue à bord, {firstName}. Choisis une planète pour commencer." />` en bas à droite

- [ ] Step 7.1 : Modifier `page.tsx` en server component qui fetche `child` via Prisma.
- [ ] Step 7.2 : Si child pas trouvé → `redirect('/parent')`.
- [ ] Step 7.3 : Créer `ExplorateurHubClient.tsx` qui assemble tous les composants (marqué `"use client"`).
- [ ] Step 7.4 : Commit `feat(explorateurs): wire hub Station + LUMO to child data`

### Task 8 — Vérification finale

- [ ] Step 8.1 : `npm run typecheck` passe
- [ ] Step 8.2 : `npm run test:run` passe
- [ ] Step 8.3 : `npm run build` passe
- [ ] Step 8.4 : Test manuel : créer un parent, créer un enfant de 7 ans, voir le hub
- [ ] Step 8.5 : Update `tests/e2e/smoke.spec.ts` pour vérifier que `/explorateurs/[id]` affiche les 6 noms de planètes
- [ ] Step 8.6 : Commit `chore: end of Plan 2 — Hub + LUMO complete ✓`

---

## Critères de sortie

- [ ] Le parent peut créer un enfant depuis `/parent`
- [ ] `/onboarding` dispatche vers `/explorateurs/[id]` pour un enfant 6-10 ans
- [ ] La page affiche un fond étoilé, la station centrale, 6 planètes en orbite et LUMO en bas à droite
- [ ] LUMO dit bonjour à l'enfant par son prénom (voix navigateur, pas de clé API requise)
- [ ] Les planètes ont un hover visible mais pas d'action (Plan 3)
- [ ] Tous les tests passent

---

## Non-goals (Plan 3+)

- ❌ Cinematic d'arrivée complète (intro avec audio test, choix avatar) → Plan 3
- ❌ Clics sur planètes amenant à des activités → Plan 3
- ❌ OpenAI TTS avec cache → activable en production quand clé dispo
- ❌ Mini-jeux → Plan 3
- ❌ Observation ambiante → Plan 3
