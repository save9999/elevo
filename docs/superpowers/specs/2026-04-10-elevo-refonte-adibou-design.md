# Spec de design — Refonte Elevo, style Adibou, avec diagnostic dys & orthophonie

**Date** : 2026-04-10
**Statut** : ✏️ en revue
**Auteur** : Elevo + brainstorming Claude
**Scope** : refonte totale de l'application Elevo, premier livrable = parcours Explorateurs 6-10 ans

---

## 1. Contexte et motivation

L'application Elevo actuelle (Next.js 14 + Prisma + Claude API) est fonctionnelle mais son design (`LumoHouse.tsx`, `RoomScene.tsx`, `WorldMap.tsx`) ne correspond pas à la vision : une expérience éducative pleinement interactive inspirée d'Adibou, étendue avec un vrai moteur de **diagnostic des troubles dys** et une **bibliothèque d'exercices d'orthophonie**.

Ce spec décrit une **refonte totale** de l'app avec :
- **Table rase du code** existant sauf : auth (NextAuth), layout global, middleware, schéma Prisma à repenser
- **4 parcours d'âge** partageant un back unifié (Petits 4-6, Explorateurs 6-10, Aventuriers 10-14, Lycéens 14-18)
- **Un seul parcours détaillé et livré en MVP** : Explorateurs 6-10, qui est la fenêtre optimale pour le dépistage des troubles dys
- **Un moteur métier partagé** (`src/engine/`) indépendant de React et réutilisable par tous les parcours

**Ce spec ne couvre PAS** (ces éléments feront l'objet de specs ultérieurs) :
- Les parcours Petits, Aventuriers, Lycéens (architecture prête mais contenu non détaillé)
- Le modèle tarifaire détaillé (freemium, pricing orthophoniste)
- L'app mobile / React Native
- L'intégration avec des systèmes tiers (Doctolib, Maiia, etc.)

---

## 2. Décisions clés validées pendant le brainstorming

| # | Décision | Retenu |
|---|---|---|
| 1 | Périmètre de refonte | **Table rase complète** — on ne garde que auth, layout, middleware, Prisma (schéma à repenser) |
| 2 | Tranches d'âge couvertes | **4-18 ans**, répartis en 4 parcours distincts partageant le même back |
| 3 | Premier parcours livré | **Les Explorateurs (6-10 ans)** — cœur du dépistage dys |
| 4 | Statut juridique diagnostic dys | **Hybride grand public + mode pro orthophoniste** (freemium B2C + licences B2B) |
| 5 | Intégration du diagnostic dans le jeu | **Hybride** : observation ambiante pendant le jeu libre + bilans standardisés au Cabinet |
| 6 | Métaphore du hub-monde | **La Station Spatiale Elevo** (hub central + planètes en orbite) |
| 7 | Compagnon-guide | **LUMO, une IA holographique** (sphère lumineuse pulsante, pilotée par Claude + TTS) |
| 8 | Architecture code | **Parcours séparés + moteur partagé** (`src/engine/` zéro-React) |
| 9 | TTS | **OpenAI TTS** (`tts-1`, voix `nova`), avec cache agressif et fallback Web Speech API |
| 10 | Modèles Claude | **Haiku 4.5** pour micro-feedback et chat libre, **Sonnet 4.6** pour alertes et plans pédagogiques, **Opus 4.6** uniquement pour interprétations de bilans en mode pro |

---

## 3. Architecture code

### 3.1 Arborescence cible

```
src/
├── app/
│   ├── page.tsx                     → landing publique (restylée station)
│   ├── login, register              → NextAuth (conservé)
│   ├── onboarding/page.tsx          → route post-login qui dispatche vers le bon parcours
│   ├── parent/                      → dashboard parent (unifié pour tous parcours)
│   ├── pro/                         → interface orthophoniste (mode pro)
│   ├── explorateurs/[childId]/      → ⭐ PARCOURS 6-10 — livrable MVP
│   │   ├── page.tsx                 → la Station (hub)
│   │   ├── planet/[slug]/page.tsx   → vue planète
│   │   ├── planet/[slug]/room/[id]/ → une activité / mini-jeu
│   │   ├── cabinet/page.tsx         → Cabinet de LUMO (liste bilans)
│   │   ├── cabinet/bilan/[id]/      → bilan en cours
│   │   ├── journal/page.tsx         → journal de bord
│   │   └── layout.tsx
│   ├── petits/[childId]/            → stub "bientôt disponible"
│   ├── aventuriers/[childId]/       → stub
│   ├── lyceens/[childId]/           → stub
│   └── api/
│       ├── auth/                    → NextAuth
│       ├── children/                → CRUD enfant
│       ├── ai/{chat,feedback,alert,plan}/
│       ├── tts/                     → synthèse voix (OpenAI, cache)
│       ├── observations/            → collecte ambiante
│       ├── bilans/{start,answer,complete}/
│       ├── exercises/
│       └── pro/                     → endpoints mode pro
│
├── engine/                          ← 🧠 Moteur partagé, zéro React
│   ├── ai/
│   │   ├── client.ts                → wrapper Anthropic SDK
│   │   ├── prompts/                 → prompts versionnés par tâche
│   │   └── context.ts               → construction du contexte enfant
│   ├── tts/
│   │   ├── provider.ts              → interface TTSProvider
│   │   ├── openai.ts                → implémentation OpenAI
│   │   ├── webspeech.ts             → fallback Web Speech API
│   │   └── cache.ts                 → cache de phrases fréquentes
│   ├── diagnostic/
│   │   ├── protocols/{alouette,odedys-lecture,odedys-dictee,subitisation,corsi}.ts
│   │   ├── scoring.ts               → calcul percentile, écart-type
│   │   ├── norms/                   → normes JSON sourcées
│   │   └── alerts.ts                → moteur d'alertes sur patterns
│   ├── observation/
│   │   ├── collector.ts             → API pour les mini-jeux
│   │   └── aggregator.ts            → rollup périodique
│   ├── exercises/
│   │   ├── library.ts               → index de la bibliothèque
│   │   ├── selector.ts              → sélection adaptative
│   │   └── orthophonic/{dyslexie,dysorthographie,dyscalculie,articulation}/
│   └── game-kit/
│       ├── GameSession.ts           → classe de base d'un mini-jeu
│       ├── feedback.ts
│       └── types.ts
│
├── components/
│   ├── explorateurs/
│   │   ├── station/                 → Station.tsx, PlanetOrb.tsx, StarField.tsx
│   │   ├── lumo/                    → LumoSphere.tsx, LumoSpeaker.tsx, LumoMood.tsx
│   │   ├── planets/                 → PlanetAlphabos.tsx, PlanetNumeris.tsx, etc.
│   │   ├── games/                   → mini-jeux consommant game-kit
│   │   ├── cabinet/                 → CabinetRoom.tsx, ProtocolRunner.tsx
│   │   ├── journal/                 → JournalPage.tsx, BadgeCard.tsx
│   │   └── onboarding/              → ArrivalCinematic.tsx, InitialPulse.tsx
│   ├── parent/                      → ParentDashboard, ChildCard, AlertFeed, BilanReport
│   ├── pro/                         → ProDashboard, NormTable, BilanExport
│   └── ui/                          → primitives (Button, Card, Modal, Toast)
│
├── lib/{db,auth,utils}.ts
└── types/                           → types métier partagés
```

### 3.2 Principes d'architecture non-négociables

1. **Le moteur `src/engine/` est zéro-React.** Tests unitaires Vitest, fonctions pures autant que possible. Exposé au reste de l'app uniquement par des fonctions typées.
2. **Un fichier = une responsabilité.** Plafond de 250 lignes par composant. Si ça grossit, on scinde.
3. **Les protocoles dys sont versionnés.** Chaque protocole a un `version` et un `publishedAt`. Un bilan stocke la version utilisée.
4. **Les normes sont des données, pas du code.** Fichiers JSON citant leur source scientifique. Mise à jour = PR de données, pas de code.
5. **TypeScript strict**, pas de `any`, pas de `console.log` en prod, pas de secrets en dur.
6. **Prompts Claude versionnés** dans `engine/ai/prompts/`. Aucun prompt inline dans un composant.

### 3.3 Choix techniques

| Sujet | Retenu | Justification |
|---|---|---|
| Framework | Next.js 14 App Router | Déjà en place, convient parfaitement |
| DB | PostgreSQL Neon + Prisma | Déjà en place |
| Auth | NextAuth v5 beta | Déjà en place |
| TTS | OpenAI `tts-1` voix `nova` (FR) | Qualité FR excellente, ~0,015 $/1k chars, cache agressif possible |
| Fallback TTS | Web Speech API | Gratuit, garantit que le jeu ne bloque jamais |
| Claude | Haiku 4.5 par défaut, Sonnet 4.6 pour tâches sensibles, Opus 4.6 uniquement mode pro | Optimisation coûts tout en préservant la qualité là où ça compte |
| Animations | Tailwind + CSS vars + `framer-motion` ciblé | Évite Lottie et assets lourds |
| Tests | Vitest (moteur) + Playwright (e2e critiques) | Vitest = ESM natif, rapide ; Playwright = déjà éprouvé |
| Hébergement | Vercel (app) + Neon région UE (Frankfurt cible) | RGPD, latence EU — à confirmer contre la région Neon actuelle |
| Cache TTS | disque en dev, R2/S3 en prod | Clé = SHA-256 du texte |

---

## 4. Data model Prisma

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          UserRole @default(PARENT)
  proCode       String?  @unique
  createdAt     DateTime @default(now())
  children      Child[]
  proClients    Child[]  @relation("ProSupervises")
}

enum UserRole { PARENT PRO ADMIN }

model Child {
  id             String    @id @default(cuid())
  parentId       String
  parent         User      @relation(fields: [parentId], references: [id])
  proId          String?
  pro            User?     @relation("ProSupervises", fields: [proId], references: [id])

  firstName      String
  birthdate      DateTime
  parcours       Parcours
  avatar         Json?

  xp             Int       @default(0)
  level          Int       @default(1)
  planetsVisited String[]  @default([])

  dysProfile     Json?     // agrégat calculé, jamais source de vérité

  createdAt      DateTime  @default(now())
  sessions       GameSession[]
  observations   Observation[]
  bilans         Bilan[]
  exerciseLogs   ExerciseLog[]
  alerts         Alert[]
}

enum Parcours { PETITS EXPLORATEURS AVENTURIERS LYCEENS }

model GameSession {
  id           String        @id @default(cuid())
  childId      String
  child        Child         @relation(fields: [childId], references: [id])
  planetSlug   String
  activitySlug String
  startedAt    DateTime      @default(now())
  endedAt      DateTime?
  score        Int?
  metadata     Json?
  observations Observation[]
}

model Observation {
  id        String            @id @default(cuid())
  childId   String
  child     Child             @relation(fields: [childId], references: [id])
  sessionId String?
  session   GameSession?      @relation(fields: [sessionId], references: [id])
  domain    ObservationDomain
  signal    String
  weight    Float
  context   Json?
  createdAt DateTime          @default(now())
}

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

model Bilan {
  id             String       @id @default(cuid())
  childId        String
  child          Child        @relation(fields: [childId], references: [id])
  protocolId     String
  protocolVersion String
  startedAt      DateTime     @default(now())
  completedAt    DateTime?
  rawAnswers     Json
  rawScores      Json?
  normedScores   Json?
  interpretation String?
  mode           BilanMode
  triggeredBy    BilanTrigger
}

enum BilanMode { PARENT PRO }
enum BilanTrigger { PARENT_REQUEST PRO_REQUEST AI_SUGGESTION }

model ExerciseLog {
  id            String    @id @default(cuid())
  childId       String
  child         Child     @relation(fields: [childId], references: [id])
  exerciseId    String
  targetTrouble String
  difficulty    Int
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  success       Boolean?
  metadata      Json?
}

model Alert {
  id             String        @id @default(cuid())
  childId        String
  child          Child         @relation(fields: [childId], references: [id])
  severity       AlertSeverity
  title          String
  body           String
  observationIds String[]
  createdAt      DateTime      @default(now())
  acknowledgedAt DateTime?
  action         String?
}

enum AlertSeverity { INFO ATTENTION IMPORTANT }
```

---

## 5. Parcours Explorateurs — contenu détaillé

### 5.1 Onboarding enfant (arrivée dans la station)

Au premier login, une cinématique de ~45 s :

1. **Test audio** : LUMO joue un son, l'enfant confirme qu'il l'entend
2. **Prénom** : saisie par la voix (si micro autorisé) ou clavier
3. **Calibrage des scanners** : 3 mini-activités ultra-courtes (reconnaître une lettre, compter 4 objets, répéter un mot) → génère les 5 premières `Observation` de référence
4. **Choix combinaison d'astronaute** : 4 couleurs × 4 motifs = 16 options (YAGNI, pas de système complexe)
5. Message final de LUMO : *« Ta combinaison est prête. La Station Elevo est à toi. Tu peux explorer les planètes quand tu veux, je serai toujours avec toi. »*

### 5.2 Le hub Station

Fond noir étoilé + parallaxe léger, station Elevo au centre (anneau avec cœur lumineux), planètes en orbite lente. LUMO visible en bas à droite (orbe réduite). Clic sur une planète → zoom animé (~0.8 s). Clic sur la station centrale → entrée au Cabinet (accès contrôlé, cf. 5.4).

**Règles UX strictes** :
- ❌ Pas de barre d'XP permanente (source de stress)
- ❌ Pas de boutique
- ❌ Pas de notification rouge clignotante
- ✅ Icône discrète « nouveau message de LUMO » si une alerte parent existe
- ✅ Aucune activité n'est verrouillée : libre exploration pour révéler naturellement les profils de force/faiblesse

### 5.3 Les planètes (6 + Cabinet)

| Planète | Domaine EN cycle 2 | Dys couvert | Exemples d'activités |
|---|---|---|---|
| 🔤 **Alphabos** | Français : lecture, phonologie | Dyslexie | Pêche aux lettres (discrimination phonémique), décodage syllabes, lecture pseudo-mots, fluence karaoké |
| 🔢 **Numeris** | Maths : nombres, calcul | Dyscalculie | Subitisation, transcodage chiffre↔mot, calcul mental, droite numérique |
| ✍️ **Scripta** | Français : écriture | Dysorthographie, dysgraphie | Dictée adaptative, copie chronométrée, traçage lettres, orthographe gamifiée |
| 🗣️ **Verbalia** | Français : oral, vocabulaire | Troubles articulatoires, lexicaux, orthophonie | Répétition mots, mot juste, raconte-moi une histoire, image/son |
| 🧠 **Memoria** | Transversal | TDAH, mémoire de travail | Simon, n-back enfant, séquences d'images, attention soutenue |
| 📐 **Geometra** | Maths : géométrie, visuo-spatial | Dyspraxie visuo-spatiale | Reproduction figures, orientation, gauche/droite, rotation mentale |
| 🩺 **Le Cabinet de LUMO** (station centrale) | — | Tous | Bilans standardisés uniquement |

Chaque planète contient 3-5 « salles » (= activités/mini-jeux). Tous les mini-jeux sont instrumentés pour émettre des `Observation` en arrière-plan.

### 5.4 Le Cabinet — règles d'accès

| Qui | Accès | Message enfant |
|---|---|---|
| Enfant seul | **Bloqué** | *« Le Cabinet est un endroit spécial. Tu peux y venir quand un adulte te le propose. »* |
| Parent (depuis dashboard) | Lance un RDV → notif enfant au prochain login | *« Aujourd'hui, on fait un petit bilan avec LUMO, tu veux bien ? »* (opt-in) |
| IA (suggestion via moteur d'alertes) | Crée une `Alert` côté parent, qui décide | L'enfant ne voit jamais la suggestion IA directement |
| Pro (mode orthophoniste) | Accès direct, peut lancer tout protocole | En présence du pro |

### 5.5 Flux d'un bilan (mode parent)

```
Parent → clique "Lancer bilan Alouette"
  ↓
Enfant reçoit notif "LUMO veut te montrer un jeu spécial"
  ↓
Enfant accepte → cinematic courte "entrée Cabinet"
  ↓
LUMO explique en voix off le déroulé du test
  ↓
ProtocolRunner + protocole spécifique (déclaratif)
  ↓
Fin : LUMO dit "merci, j'ai tout noté" (jamais de score à l'enfant)
  ↓
POST /api/bilans/complete
  ↓
engine/diagnostic/scoring → rawScores + normedScores
  ↓
Stockage Bilan + génération interpretation via Claude
  ↓
Parent reçoit notif "Bilan Alouette terminé, voir le rapport"
```

### 5.6 LUMO — états visuels

Composant unique `<LumoSphere mood="..." />` + `<LumoSpeaker text="..." />` (TTS + auto-switch en mood `speaking`).

| État | Rendu | Quand |
|---|---|---|
| `idle` | Pulse lent bleu clair | Défaut, en hub |
| `speaking` | Pulse au rythme de la voix (waveform) | Pendant la TTS |
| `thinking` | Pulse vert lent, rotation anneau | Pendant appel Claude |
| `happy` | Pulse rapide jaune, particules | Félicitation réussite |
| `gentle` | Pulse doux rose pâle | Après un échec, ton encourageant |
| `sleeping` | Sphère réduite éteinte | Fin de session |

---

## 6. Moteur de diagnostic

### 6.1 Protocoles MVP (5)

| Protocole | Cible | Tranche | Mesure | Durée | Juridique |
|---|---|---|---|---|---|
| **Alouette-R adapté** | Dyslexie | CP-CM2 | Vitesse + précision lecture | ~3 min | Texte Lefavrais 1967, vérif juridique requise avant prod (cf. §10) |
| **ODEDYS lecture mots** | Dyslexie | CE1-CM2 | Lecture mots/pseudo-mots chronométrée | ~5 min | Diffusé par Cogni-Sciences/Grenoble, vérif usage commercial |
| **ODEDYS dictée** | Dysorthographie | CE1-CM2 | Orthographe lexicale/grammaticale | ~5 min | Idem |
| **Subitisation + transcodage** | Dyscalculie | CP-CE2 | Estimation + passage chiffre↔mot | ~4 min | Protocoles académiques libres |
| **Reproduction figures + Corsi enfant** | Dyspraxie, mémoire visuo-spatiale | CP-CM2 | Coordination + mémoire spatiale | ~4 min | Domaine public |

### 6.2 Format d'un protocole

```typescript
// src/engine/diagnostic/protocols/alouette.ts
export const alouetteProtocol: Protocol = {
  id: 'alouette-r',
  version: '1.0.0',
  publishedAt: '2026-04-10',
  name: 'Test Alouette-R adapté',
  targetTrouble: 'dyslexie',
  ageRange: { min: 6, max: 11 },
  durationMin: 3,
  durationMax: 5,
  source: 'Lefavrais, 1967, réédité INETOP',
  steps: [/* déclaratif */],
  scoring: (answers) => RawScore,   // pure function
  norms: alouetteNorms,             // JSON sourcé
};
```

Un seul composant `<ProtocolRunner protocol={...} />` peut jouer n'importe quel protocole déclaratif.

### 6.3 Scoring

```typescript
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
  band: 'normal' | 'attention' | 'preoccupant';
  source: string;
}
```

**Règle** : scoring pur et déterministe. Même input → même output. Permet tests unitaires à 100% et recalcul à froid avec nouvelles normes.

### 6.4 Observation ambiante

Chaque mini-jeu émet des signaux typés via :

```typescript
observationCollector.record({
  domain: 'PHONOLOGY',
  signal: 'confusion_b_d',
  weight: 0.7,
  context: { displayedLetter: 'b', chosen: 'd', reactionMs: 1420 }
});
```

**Règle** : les `Observation` ne sont jamais montrées telles quelles à l'enfant ou au parent. Seul le moteur d'alertes peut en dériver une info utilisable.

### 6.5 Moteur d'alertes

**Trigger** : à la fin de chaque session (`POST /api/observations/commit`), en asynchrone.

**Algorithme** :
1. Agrège les `Observation` des 30 derniers jours par domaine
2. Calcule un score pondéré par domaine
3. Compare à des seuils définis dans `engine/diagnostic/alerts.ts`
4. Si franchissement → crée une `Alert` et un contexte pour Claude
5. Claude génère une formulation douce, jamais alarmiste

**Règles inviolables** :
- ❌ Jamais les mots « dyslexique » / « dyscalculique » / « dysorthographique »
- ❌ Jamais de score brut dans le message (« -2 écarts-types »)
- ❌ Jamais plus d'1 alerte toutes les 2 semaines par enfant (anti-fatigue)
- ✅ Toujours une action proposée et une option « plus tard »
- ✅ Toujours un lien « en savoir plus » vers du contenu pédagogique vulgarisé

---

## 7. Bibliothèque d'exercices d'orthophonie

### 7.1 Structure

```
src/engine/exercises/orthophonic/
├── dyslexie/{phonologie-conscience-syllabique, fusion-phonemique, lecture-syllabes-cv, lecture-pseudo-mots, lecture-fluence-karaoke}.ts
├── dysorthographie/{copie-flash, dictee-mots-reguliers, regles-ortho-sonore, homophones-grammaticaux}.ts
├── dyscalculie/{subitisation-flash, transcodage-chiffre-mot, droite-numerique, faits-numeriques}.ts
└── articulation/{repetition-paires-minimales, denomination-imagee}.ts
```

**Volume MVP** : ~20 exercices. Extensibles ensuite par itérations.

### 7.2 Sélecteur adaptatif

```typescript
export function selectNextExercise(child: Child, history: ExerciseLog[]): Exercise {
  // 1. Filtrer exercices pertinents au dysProfile de l'enfant
  // 2. Exclure ceux échoués récemment (cooldown 48h — consolidation mnésique)
  // 3. Exclure ceux réussis 3 fois au max de difficulté (maîtrisés)
  // 4. Pondérer par écart à la progression idéale (logarithmique)
  // 5. Sélection aléatoire pondérée parmi le top-5 pour variété
  // 6. Ajuster la difficulté de ±1 selon 3 dernières tentatives
}
```

**Cible** : zone proximale de développement, ~75 % de réussite attendue (constante nommée `IDEAL_SUCCESS_RATE = 0.75`, source : Wilson et al. 2019). Si > 90 % → monter. Si < 60 % → descendre.

**Règle importante** : cooldown 48 h sur échec. Refaire immédiatement un exercice échoué renforce la mauvaise trace mémorielle. Un cycle de sommeil permet la consolidation. À commenter explicitement dans `selector.ts`.

---

## 8. IA Claude et TTS

### 8.1 Routage modèles

| Tâche | Modèle | Raison |
|---|---|---|
| Micro-feedback mini-jeu | `claude-haiku-4-5` | ~10 appels/session, qualité suffisante |
| Chat libre enfant↔LUMO | `claude-haiku-4-5` | Échanges simples |
| Génération d'alerte parent | `claude-sonnet-4-6` | Ton à calibrer finement |
| Plan pédagogique hebdomadaire | `claude-sonnet-4-6` | Raisonnement multi-observations |
| Interprétation bilan (parent) | `claude-sonnet-4-6` | Contenu sensible |
| Interprétation bilan (pro) | `claude-opus-4-6` | Qualité clinique |

### 8.2 Prompts versionnés

Chaque prompt vit dans `src/engine/ai/prompts/*.ts` avec un numéro de version. Aucun prompt inline dans un composant. Tests de non-régression sur 10 cas d'alerte types.

### 8.3 TTS

**Provider principal** : OpenAI `tts-1`, voix `nova` (féminine douce FR). ~0,015 $/1k caractères.

**Cache** : SHA-256 du texte → disque en dev, R2/S3 en prod. 80 % des phrases de LUMO sont répétitives → cache hit très élevé.

**Fallback** : Web Speech API (gratuit, qualité dégradée mais toujours fonctionnel).

**Estimation coûts** (1 enfant actif, 30 min/jour) :
- TTS : ~0,14 $/mois après cache
- Claude : ~0,30 $/mois (haiku-heavy)
- **Total IA ~0,45 $/mois par enfant** → compatible freemium

---

## 9. Interfaces adultes

### 9.1 Dashboard parent (`/parent`)

**Règle centrale** : le parent ne voit jamais les observations brutes ni les scores normés bruts. Uniquement des **tendances 3 bandes** (normal / attention / préoccupant) et des **interprétations Claude en langage clair**.

**Pages** :
- `/parent` — liste enfants, alertes récentes, actions rapides
- `/parent/child/[id]` — détails enfant (activité, journal d'observation par domaine, historique bilans, profil dys « état »)
- `/parent/child/[id]/alerts` — fil des alertes
- `/parent/child/[id]/bilans/[bilanId]` — rapport de bilan (graphe simple + texte + recommandations)
- `/parent/settings` — RGPD, export, suppression

### 9.2 Mode pro (`/pro`)

**Activation** : case « Je suis un professionnel de santé » à l'inscription, champ ADELI/RPPS, validation manuelle admin au MVP.

**Différences avec le mode parent** :
- ✅ Scores bruts et normés visibles
- ✅ Comparaison longitudinale
- ✅ Écart-type vs norme (avec norme source citée)
- ✅ Export PDF personnalisable (logo cabinet, RPPS)
- ✅ Liste patients filtrable
- ✅ Lancer bilan à distance (démarre au prochain login de l'enfant)

**Verrous même en mode pro** :
- ❌ Aucun diagnostic automatique émis par l'app
- ❌ Bilans passés immuables

---

## 10. Risques identifiés

| Risque | Gravité | Mitigation |
|---|---|---|
| Droits d'usage Alouette / ODEDYS | 🔴 Haute | Vérification juridique avant J4 du MVP. Plan B : protocoles auto-conçus basés sur littérature scientifique publique |
| Qualité TTS FR pour enfants | 🟠 Moyenne | A/B test voix `nova` vs `alloy` en J2, budget ElevenLabs en backup |
| Drift de ton des prompts Claude | 🟠 Moyenne | Prompts versionnés + tests de non-régression sur 10 cas types |
| RGPD données enfants mineurs | 🔴 Haute | Consentement parental obligatoire, DPO à nommer avant prod, Neon Frankfurt (UE), zéro tracking analytics enfant |
| Accessibilité pour enfants dys | 🟠 Moyenne | Police OpenDyslexic en option, contraste AAA, option « réduire animations » dans paramètres |
| Rejet orthophonistes (« encore un outil tech ») | 🟡 Basse | Consultation 3-5 orthophonistes avant J9 mode pro, adaptation à leur workflow réel |

---

## 11. Stratégie de livraison MVP

**Périmètre MVP = parcours Explorateurs uniquement + compte parent + mode pro basique.**

Les 3 autres parcours (Petits, Aventuriers, Lycéens) auront leurs propres specs ultérieurs, réutilisant l'architecture et le moteur mis en place dans ce MVP.

**Jalons (ordre, pas de dates)** :

| Jalon | Contenu | Critère de sortie |
|---|---|---|
| **J1 — Fondations** | Table rase `src/app/`+`src/components/`, nouveau schéma Prisma, scaffold `src/engine/`, NextAuth conservé, route `/onboarding`, infra tests (Vitest + Playwright) | `npm run build` passe, 1 test unitaire `engine/` passe |
| **J2 — Hub Station + LUMO** | `/explorateurs/[id]/page.tsx` hub statique, 6 planètes affichées, `<LumoSphere>` + états, cinematic d'arrivée, TTS basique sans cache | Enfant se connecte, voit le hub, entend LUMO dire son prénom |
| **J3 — Première planète : Alphabos** | 3 mini-jeux Alphabos utilisant `game-kit` + `engine/observation` | Enfant joue à 3 activités, `Observation` s'enregistrent |
| **J4 — Cabinet + 1er protocole (Alouette)** | `<ProtocolRunner>`, protocole Alouette, scoring, stockage `Bilan`, interprétation Claude | Parent lance un bilan, enfant passe, rapport généré |
| **J5 — Dashboard parent basique** | `/parent`, liste enfants, 1 rapport de bilan lisible | Parent voit historique + 1 alerte simulée |
| **J6 — Alertes + 4 protocoles restants** | ODEDYS lecture + dictée, subitisation, Corsi, `alerts.ts` complet | Alertes se déclenchent automatiquement sur patterns |
| **J7 — 5 planètes restantes** | Mini-jeux minimum par planète, tous instrumentés | Expérience libre complète sur 6 planètes |
| **J8 — Orthophonie (20 exercices)** | Bibliothèque + selector + intégration via LUMO | « Exercice du jour » opérationnel |
| **J9 — Mode pro basique** | Activation manuelle, vue patients, export PDF simple | 1 orthophoniste utilise l'app en séance test |
| **J10 — Polish + RGPD + déploiement** | Mentions légales, consentement parental, export/suppression données, e2e Playwright, déploiement Vercel | Prêt pour beta fermée |

---

## 12. Ce qu'on NE fait pas dans ce MVP (YAGNI)

- ❌ Pas de boutique / inventaire / shop
- ❌ Pas de système de quêtes complexes (LumoHouse, quests de l'ancien projet)
- ❌ Pas de multijoueur / échanges entre enfants
- ❌ Pas d'app mobile native
- ❌ Pas de génération de contenu pédagogique par l'IA (tous les exercices sont définis en dur)
- ❌ Pas d'intégration Doctolib / prise de RDV orthophoniste
- ❌ Pas de personnalisation avancée de LUMO (voix, personnalité) — une seule voix pour le MVP
- ❌ Pas de gamification XP/niveaux visible en permanence
- ❌ Pas de parcours Petits / Aventuriers / Lycéens (stubs uniquement)

---

## 13. Questions ouvertes à trancher avant implémentation

1. **Droits Alouette-R** — vérification juridique à effectuer. Si bloqué, passer en plan B dès J4.
2. **Hébergement cache TTS** — R2 (Cloudflare) vs S3 (AWS) ? Décision technique au J2.
3. **Authentification enfant** — compte séparé ou identifiant simple généré par le parent ? Probablement identifiant simple pour éviter email enfant mineur.
4. **Migration des données Elevo existantes** — y a-t-il des comptes / enfants déjà en prod à migrer, ou on repart à zéro ? À confirmer avec l'utilisateur.
5. **DPO** — désignation à faire avant mise en prod.
6. **Région Neon actuelle** — vérifier que la base Neon existante est bien en UE (idéalement Frankfurt). Si elle est ailleurs, migration à planifier au J1.

---

## 14. Annexe — décisions pendant le brainstorming

- **Q1** Scope refonte → B (table rase)
- **Q2** Tranche d'âge → 4-18 en 4 parcours
- **Q3** Premier parcours → A (Explorateurs 6-10)
- **Q4** Statut diagnostic → D (hybride grand public + mode pro)
- **Q5** Intégration diagnostic → C (observation ambiante + Cabinet)
- **Q6** Monde-hub → D (Station Spatiale Elevo)
- **Q7** Compagnon → C (LUMO, IA holographique)
- **Approche technique** → B (parcours séparés + moteur partagé)
