# Les Chroniques d'Elevo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Elevo from a static educational app into an immersive narrative adventure with full gamification (world map hub, AI-generated story chapters, cosmetic shop, daily quests, enhanced badges/streaks).

**Architecture:** New Prisma models for chapters, progress, quests, shop, inventory, and currency. New `/api/ai/story` route generates full chapters via Claude. Existing exercise generation wraps in narrative context. Child hub becomes an interactive world map. All new pages under `/child/[id]/`.

**Tech Stack:** Next.js 14 App Router, Prisma 5 + PostgreSQL (Neon), Anthropic SDK (Claude Sonnet), Tailwind CSS, React 18, TypeScript.

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Add 6 new models (Chapter, ChapterStep, ChildProgress, DailyQuest, ShopItem, ChildInventory, ChildCurrency) |
| `src/lib/gamification.ts` | Shared constants: XP per level, star thresholds, streak tiers, badge definitions |
| `src/app/api/ai/story/route.ts` | Generate full chapter (narrative + exercises) via Claude AI |
| `src/app/api/quests/route.ts` | GET daily quests, POST generate new quests |
| `src/app/api/progress/route.ts` | GET/POST chapter progress, unlock logic |
| `src/app/api/shop/route.ts` | GET items, POST buy, POST equip |
| `src/app/child/[id]/chapter/[chapterId]/page.tsx` | Chapter view with steps list and narrative |
| `src/app/child/[id]/chapter/[chapterId]/step/[stepId]/page.tsx` | Narrative exercise screen |
| `src/app/child/[id]/quests/page.tsx` | Daily/weekly quests page |
| `src/app/child/[id]/shop/page.tsx` | Cosmetic shop |
| `src/app/child/[id]/inventory/page.tsx` | Backpack/inventory |
| `src/components/WorldMap.tsx` | Interactive world map component |
| `src/components/NarrativeExercise.tsx` | Exercise wrapped in story context |
| `src/components/QuestCard.tsx` | Quest display card |
| `src/components/ShopItemCard.tsx` | Shop item card |
| `src/components/StarRating.tsx` | 1-3 star display component |
| `src/components/StatusBar.tsx` | Persistent header bar (level, XP, streaks, currencies) |
| `prisma/seed.ts` | Seed shop items + starter chapters |

### Modified Files

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add new models + relations on Child |
| `src/app/child/[id]/page.tsx` | Replace module grid with WorldMap component |
| `src/app/api/ai/exercise/route.ts` | Accept optional `narrativeContext` parameter |
| `src/app/child/[id]/profile/page.tsx` | Add extended badges, equipped title, inventory preview |
| `src/app/child/[id]/layout.tsx` | Add StatusBar + bottom navigation |
| `src/app/globals.css` | Add map, quest, shop animations |
| `tailwind.config.ts` | Add new animation keyframes |
| `package.json` | Add seed script |

---

## Phase 1: Database Foundation

### Task 1: Gamification Constants

**Files:**
- Create: `src/lib/gamification.ts`

- [ ] **Step 1: Create gamification constants file**

```typescript
// src/lib/gamification.ts

export const XP_PER_LEVEL = 500;

export const STAR_THRESHOLDS = {
  3: 90, // 90%+ score = 3 stars
  2: 70, // 70%+ = 2 stars
  1: 0,  // any completion = 1 star
} as const;

export function getStarsForScore(score: number): number {
  if (score >= STAR_THRESHOLDS[3]) return 3;
  if (score >= STAR_THRESHOLDS[2]) return 2;
  return 1;
}

export const STREAK_TIERS = [
  { days: 3, label: "Bronze", color: "#CD7F32", emoji: "🔥" },
  { days: 7, label: "Argent", color: "#C0C0C0", emoji: "🔥", crystalReward: 5 },
  { days: 14, label: "Or", color: "#FFD700", emoji: "🔥" },
  { days: 30, label: "Arc-en-ciel", color: "rainbow", emoji: "🌈", skinReward: "rainbow_flame" },
] as const;

export function getStreakTier(streak: number) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].days) return STREAK_TIERS[i];
  }
  return null;
}

export const EXERCISE_REWARDS = {
  stars: { 1: 5, 2: 10, 3: 20 },
  xp: { base: 30, perfect: 50 },
} as const;

export const BOSS_REWARDS = {
  crystals: 3,
  xp: 100,
  stars: 30,
} as const;

export const CURRENCIES = {
  stars: { emoji: "⭐", label: "Étoiles" },
  crystals: { emoji: "💎", label: "Cristaux" },
} as const;

export const ITEM_RARITIES = {
  common: { label: "Commun", color: "#9CA3AF" },
  rare: { label: "Rare", color: "#3B82F6" },
  epic: { label: "Épique", color: "#8B5CF6" },
  legendary: { label: "Légendaire", color: "#F59E0B" },
} as const;

export const BADGE_CATEGORIES = {
  mastery: { label: "Maîtrise", emoji: "🏆" },
  exploration: { label: "Exploration", emoji: "🗺️" },
  social: { label: "Social", emoji: "🤝" },
  secret: { label: "Secret", emoji: "🔮" },
  seasonal: { label: "Saisonnier", emoji: "🎃" },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/gamification.ts
git commit -m "feat: add gamification constants and helpers"
```

---

### Task 2: Prisma Schema — New Models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new models to schema**

Add these models to the end of `prisma/schema.prisma`, and add the new relations on the existing `Child` model:

On the `Child` model, add these relation fields after the existing `assessments` field:

```prisma
  progress     ChildProgress[]
  quests       DailyQuest[]
  inventory    ChildInventory[]
  currency     ChildCurrency?
```

Then add these new models at the end of the file:

```prisma
model Chapter {
  id          String        @id @default(cuid())
  title       String
  description String
  theme       String
  ageGroup    String
  difficulty  Int           @default(1)
  order       Int
  mapPosition Json          @default("{\"x\":0,\"y\":0}")
  mapRegion   String        @default("forest")
  bossData    Json?
  steps       ChapterStep[]
  progress    ChildProgress[]
  createdAt   DateTime      @default(now())

  @@unique([ageGroup, order])
}

model ChapterStep {
  id               String          @id @default(cuid())
  chapterId        String
  chapter          Chapter         @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  order            Int
  title            String          @default("")
  narrativeContext String          @db.Text
  exerciseType     String
  exerciseData     Json?
  rewards          Json            @default("{\"stars\":10,\"xp\":30}")
  progress         ChildProgress[]

  @@unique([chapterId, order])
}

model ChildProgress {
  id             String       @id @default(cuid())
  childId        String
  child          Child        @relation(fields: [childId], references: [id], onDelete: Cascade)
  chapterId      String
  chapter        Chapter      @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  stepId         String?
  step           ChapterStep? @relation(fields: [stepId], references: [id], onDelete: Cascade)
  status         String       @default("locked")
  score          Int?
  starsEarned    Int?
  narrativeState Json?
  completedAt    DateTime?
  createdAt      DateTime     @default(now())

  @@unique([childId, chapterId, stepId])
}

model DailyQuest {
  id            String   @id @default(cuid())
  childId       String
  child         Child    @relation(fields: [childId], references: [id], onDelete: Cascade)
  date          DateTime @db.Date
  title         String
  description   String
  narrativeHook String?  @db.Text
  exerciseType  String
  targetCount   Int      @default(1)
  progress      Int      @default(0)
  completed     Boolean  @default(false)
  reward        Json     @default("{\"stars\":10,\"xp\":20}")
  createdAt     DateTime @default(now())

  @@unique([childId, date, title])
}

model ShopItem {
  id          String           @id @default(cuid())
  name        String
  type        String
  description String           @default("")
  cost        Int
  currency    String           @default("stars")
  ageGroup    String?
  rarity      String           @default("common")
  imageData   String?          @db.Text
  previewData Json?
  inventory   ChildInventory[]
  createdAt   DateTime         @default(now())
}

model ChildInventory {
  id         String    @id @default(cuid())
  childId    String
  child      Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  itemId     String
  item       ShopItem  @relation(fields: [itemId], references: [id], onDelete: Cascade)
  equippedAt DateTime?
  acquiredAt DateTime  @default(now())

  @@unique([childId, itemId])
}

model ChildCurrency {
  id            String @id @default(cuid())
  childId       String @unique
  child         Child  @relation(fields: [childId], references: [id], onDelete: Cascade)
  stars         Int    @default(0)
  crystals      Int    @default(0)
  streakFreezes Int    @default(1)
}
```

- [ ] **Step 2: Push schema to database**

Run: `cd /Users/superbot/elevo && npx prisma db push`
Expected: Schema pushed successfully, Prisma Client generated.

- [ ] **Step 3: Verify Prisma Client types**

Run: `cd /Users/superbot/elevo && npx prisma generate`
Expected: Prisma Client generated successfully.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Chapter, Progress, Quest, Shop, Inventory, Currency models"
```

---

### Task 3: Seed Script — Shop Items & Starter Chapters

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add seed script)

- [ ] **Step 1: Create seed script**

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHOP_ITEMS = [
  // Avatar skins - common
  { name: "Cape du Voyageur", type: "avatar_skin", description: "Une cape bleue qui flotte au vent", cost: 50, currency: "stars", rarity: "common" },
  { name: "Chapeau d'Explorateur", type: "avatar_skin", description: "Un chapeau d'aventurier courageux", cost: 30, currency: "stars", rarity: "common" },
  { name: "Bottes Magiques", type: "avatar_skin", description: "Des bottes qui brillent dans le noir", cost: 40, currency: "stars", rarity: "common" },
  // Avatar skins - rare
  { name: "Armure de Cristal", type: "avatar_skin", description: "Une armure scintillante forgée par les nains", cost: 100, currency: "stars", rarity: "rare" },
  { name: "Ailes de Lumière", type: "avatar_skin", description: "Des ailes dorées qui apparaissent dans ton dos", cost: 8, currency: "crystals", rarity: "rare" },
  // Avatar skins - epic
  { name: "Couronne du Sage", type: "avatar_skin", description: "La couronne portée par les plus grands héros", cost: 20, currency: "crystals", rarity: "epic" },
  // Lumo skins
  { name: "Lumo Flamme", type: "lumo_skin", description: "Lumo brille comme une flamme orange", cost: 60, currency: "stars", rarity: "common" },
  { name: "Lumo Glacé", type: "lumo_skin", description: "Lumo scintille de givre bleu", cost: 80, currency: "stars", rarity: "rare" },
  { name: "Lumo Arc-en-ciel", type: "lumo_skin", description: "Lumo change de couleur sans cesse", cost: 15, currency: "crystals", rarity: "epic" },
  // Profile frames
  { name: "Cadre Étoilé", type: "frame", description: "Un cadre avec des étoiles filantes", cost: 25, currency: "stars", rarity: "common" },
  { name: "Cadre Dragon", type: "frame", description: "Un cadre gardé par un dragon doré", cost: 10, currency: "crystals", rarity: "rare" },
  // Titles
  { name: "Apprenti Aventurier", type: "title", description: "Titre affiché sur ton profil", cost: 15, currency: "stars", rarity: "common" },
  { name: "Maître des Mots", type: "title", description: "Pour ceux qui dominent la lecture", cost: 40, currency: "stars", rarity: "common" },
  { name: "Dragon Lecteur", type: "title", description: "Titre légendaire pour les grands lecteurs", cost: 25, currency: "crystals", rarity: "legendary" },
  { name: "Génie des Nombres", type: "title", description: "Pour les mathématiciens en herbe", cost: 40, currency: "stars", rarity: "common" },
  // Effects
  { name: "Traînée d'Étoiles", type: "effect", description: "Des étoiles suivent ton avatar", cost: 12, currency: "crystals", rarity: "epic" },
  { name: "Aura Mystique", type: "effect", description: "Une lueur violette entoure ton avatar", cost: 18, currency: "crystals", rarity: "legendary" },
];

const STARTER_CHAPTERS = [
  // Maternelle
  {
    title: "La Clairière des Animaux",
    description: "Un endroit magique où les animaux parlent et apprennent ensemble",
    theme: "nature",
    ageGroup: "maternelle",
    difficulty: 1,
    order: 1,
    mapPosition: { x: 20, y: 60 },
    mapRegion: "forest",
    steps: [
      { order: 1, title: "Le Réveil de la Forêt", narrativeContext: "Tu te réveilles dans une clairière enchantée. Les animaux t'accueillent avec joie ! Un petit renard te demande de l'aider à lire le panneau magique.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Les Fruits du Grand Arbre", narrativeContext: "Le Grand Arbre a besoin d'aide pour compter ses fruits magiques. Chaque fruit a un nombre écrit dessus.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "L'Oiseau Triste", narrativeContext: "Un petit oiseau bleu est tout triste sur une branche. Il a perdu ses amis. Comment peux-tu l'aider à se sentir mieux ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Loup qui Avait Peur", narrativeContext: "Le loup n'est pas méchant — il a peur du tonnerre ! Aide-le à se souvenir des choses qui le rassurent.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
    ],
    bossData: { name: "L'Ombre de la Clairière", description: "Une ombre mystérieuse recouvre la clairière ! Réponds à ses énigmes pour ramener la lumière.", exerciseTypes: ["reading", "math", "emotional"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Jardin des Chiffres",
    description: "Un jardin où les fleurs poussent quand tu comptes bien",
    theme: "garden",
    ageGroup: "maternelle",
    difficulty: 2,
    order: 2,
    mapPosition: { x: 45, y: 40 },
    mapRegion: "garden",
    steps: [
      { order: 1, title: "Les Graines Magiques", narrativeContext: "Le jardinier te donne des graines, mais chaque graine a un chiffre ! Plante-les dans le bon ordre.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Conte de la Rose", narrativeContext: "La plus belle rose du jardin connaît une histoire merveilleuse. Écoute-la bien et réponds à ses questions.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Couleurs des Émotions", narrativeContext: "Chaque fleur a une couleur qui représente une émotion. Le rouge c'est la colère, le jaune la joie... Aide les fleurs à trouver leur couleur.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Labyrinthe Fleuri", narrativeContext: "Pour atteindre la Fleur d'Or, traverse le labyrinthe en résolvant les problèmes de chaque croisement.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "La Mauvaise Herbe Géante", description: "Une énorme mauvaise herbe envahit le jardin ! Résous ses devinettes pour la faire rétrécir.", exerciseTypes: ["math", "reading"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "L'Atelier des Couleurs",
    description: "Un atelier magique où créativité et mémoire ouvrent toutes les portes",
    theme: "atelier",
    ageGroup: "maternelle",
    difficulty: 3,
    order: 3,
    mapPosition: { x: 70, y: 55 },
    mapRegion: "village",
    steps: [
      { order: 1, title: "Le Tableau Vivant", narrativeContext: "Le peintre magique a besoin que tu mémorises les couleurs de son tableau avant qu'elles ne s'effacent !", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "L'Histoire du Pinceau Perdu", narrativeContext: "Le pinceau magique a disparu ! Lis les indices laissés par les tableaux pour le retrouver.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Amis de l'Atelier", narrativeContext: "Les personnages des tableaux prennent vie ! Ils ont besoin de ton aide pour résoudre un conflit entre eux.", exerciseType: "social", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Chef-d'Oeuvre Final", narrativeContext: "Crée le plus beau tableau en combinant tout ce que tu as appris. Chaque bonne réponse ajoute une couleur !", exerciseType: "creativity", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Voleur de Couleurs", description: "Quelqu'un a volé toutes les couleurs de l'atelier ! Prouve ta mémoire et ta créativité pour les récupérer.", exerciseTypes: ["memory", "creativity", "reading"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  // Primaire
  {
    title: "La Forêt des Premiers Mots",
    description: "Une forêt ancestrale où chaque arbre raconte une histoire",
    theme: "forest",
    ageGroup: "primaire",
    difficulty: 1,
    order: 1,
    mapPosition: { x: 15, y: 65 },
    mapRegion: "forest",
    steps: [
      { order: 1, title: "Le Grimoire du Forestier", narrativeContext: "Le vieux forestier te confie un grimoire couvert de mousse. 'Seul un lecteur courageux peut déchiffrer ces pages', dit-il. Lis le passage et prouve-lui que tu es digne.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Pont des Calculs", narrativeContext: "Le pont enjambant la Rivière d'Argent est brisé ! Chaque planche manquante porte un calcul. Résous-les pour reconstruire le passage.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Gardien Triste", narrativeContext: "Le Gardien de la Forêt est assis seul à côté d'un feu mourant. Il semble triste et perdu. Que fais-tu pour l'aider ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "La Carte aux Souvenirs", narrativeContext: "Une carte magique apparaît, mais elle ne se révèle que si tu retiens les symboles qui clignotent. Concentre-toi bien !", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 5, title: "L'Assemblée des Animaux", narrativeContext: "Les animaux de la forêt se disputent sur qui gardera la clé du portail. Aide-les à trouver un accord juste.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "L'Ombre du Silence", description: "Une ombre immense recouvre la forêt et fait taire tous les sons. Pour la vaincre, prouve ta maîtrise des mots, des chiffres et des émotions !", exerciseTypes: ["reading", "math", "emotional"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Les Mines de Cristal",
    description: "Des mines profondes où la logique est la seule lumière",
    theme: "mines",
    ageGroup: "primaire",
    difficulty: 2,
    order: 2,
    mapPosition: { x: 40, y: 35 },
    mapRegion: "mountains",
    steps: [
      { order: 1, title: "L'Entrée Codée", narrativeContext: "La porte des mines est verrouillée par un code mathématique. Les chiffres gravés dans la pierre sont ta seule piste.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Mineur Bavard", narrativeContext: "Un vieux mineur raconte l'histoire des mines. Écoute bien son récit — il cache un indice vital pour la suite.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Cristaux Jumeaux", narrativeContext: "Des cristaux identiques brillent sur les murs. Mais attention — certains sont des faux ! Mémorise les vrais pour avancer.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "La Salle des Équations", narrativeContext: "Une immense salle remplie d'équations lumineuses. Chaque solution éteint un piège et ouvre un nouveau passage.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Choix du Tunnel", narrativeContext: "Trois tunnels s'ouvrent devant toi. Le mineur dit que seule la logique peut t'aider à choisir le bon chemin.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Golem de Pierre", description: "Un golem de pierre garde le Cristal Suprême ! Chaque bonne réponse fissure son armure.", exerciseTypes: ["math", "memory"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Château des Émotions",
    description: "Un château enchanté où chaque pièce reflète un sentiment",
    theme: "castle",
    ageGroup: "primaire",
    difficulty: 3,
    order: 3,
    mapPosition: { x: 65, y: 50 },
    mapRegion: "castle",
    steps: [
      { order: 1, title: "La Salle de la Joie", narrativeContext: "La première salle brille de mille couleurs ! Mais le gardien te demande de lire l'inscription dorée pour entrer.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Couloir de la Colère", narrativeContext: "Les murs rouges grondent. Un chevalier furieux bloque le passage. Comment calmer sa colère sans combattre ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "La Bibliothèque Secrète", narrativeContext: "Une bibliothèque cachée contient les secrets du château. Résous les énigmes logiques pour ouvrir les livres scellés.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Bal des Ombres", narrativeContext: "Des ombres dansent dans la grande salle. Chacune représente une émotion. Identifie-les pour qu'elles retrouvent la paix.", exerciseType: "emotional", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Conseil Royal", narrativeContext: "Le roi te convoque. Deux seigneurs se disputent. Écoute leurs arguments et aide le roi à prendre une décision juste.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Miroir des Illusions", description: "Un miroir géant reflète tes peurs et tes doutes. Affronte chaque illusion avec sagesse pour briser l'enchantement !", exerciseTypes: ["emotional", "reading", "social"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  // Collège-lycée
  {
    title: "Les Archives Perdues",
    description: "Des archives souterraines contenant les savoirs oubliés du monde",
    theme: "archives",
    ageGroup: "college-lycee",
    difficulty: 1,
    order: 1,
    mapPosition: { x: 20, y: 60 },
    mapRegion: "ruins",
    steps: [
      { order: 1, title: "Le Manuscrit Crypté", narrativeContext: "Un manuscrit ancien écrit dans un langage codé. Les archivistes comptent sur toi pour déchiffrer le texte et comprendre son message.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "L'Équation du Temps", narrativeContext: "Une horloge brisée dans les archives ne peut être réparée que par celui qui maîtrise les équations temporelles gravées sur ses rouages.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Journal de l'Archiviste", narrativeContext: "Tu trouves le journal intime d'un archiviste disparu. Ses entrées révèlent un dilemme moral qu'il n'a jamais résolu. Que ferais-tu à sa place ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Les Formules Oubliées", narrativeContext: "Des formules mathématiques effacées par le temps. Reconstitue-les à partir des fragments visibles pour ouvrir la chambre forte.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Débat des Philosophes", narrativeContext: "Les statues des anciens philosophes s'animent et débattent. Chacun défend une position. Analyse leurs arguments et forme ton propre avis.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Gardien du Savoir", description: "Le Gardien éternel des Archives te met à l'épreuve. Seul un esprit complet peut accéder aux connaissances ultimes.", exerciseTypes: ["reading", "math", "emotional"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "La Tour de l'Alchimiste",
    description: "Une tour mystérieuse où science et magie ne font qu'un",
    theme: "tower",
    ageGroup: "college-lycee",
    difficulty: 2,
    order: 2,
    mapPosition: { x: 50, y: 30 },
    mapRegion: "tower",
    steps: [
      { order: 1, title: "Le Laboratoire Abandonné", narrativeContext: "Des fioles et des équations couvrent les murs. L'alchimiste a laissé des problèmes non résolus. Termine son travail.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Grimoire Interdit", narrativeContext: "Un grimoire contient des textes complexes sur la transmutation. Analyse et interprète les passages clés.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "L'Épreuve de Mémoire", narrativeContext: "L'alchimiste a caché la recette de la Pierre Philosophale dans une séquence de symboles. Mémorise-les parfaitement.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Dilemme Éthique", narrativeContext: "Tu découvres que l'alchimiste utilisait ses connaissances pour des expériences douteuses. Que fais-tu de cette information ?", exerciseType: "emotional", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "L'Ascension Finale", narrativeContext: "Le dernier étage de la tour est rempli d'équations de plus en plus complexes. Chaque solution te rapproche du sommet.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "L'Homonculus", description: "La création ratée de l'alchimiste prend vie ! Elle te pose des énigmes existentielles et mathématiques.", exerciseTypes: ["math", "reading", "emotional"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Tribunal des Ombres",
    description: "Un lieu où vérité et justice sont mises à l'épreuve",
    theme: "tribunal",
    ageGroup: "college-lycee",
    difficulty: 3,
    order: 3,
    mapPosition: { x: 75, y: 50 },
    mapRegion: "city",
    steps: [
      { order: 1, title: "L'Accusation", narrativeContext: "On t'accuse à tort d'un crime dans ce monde. Lis le dossier d'accusation attentivement pour préparer ta défense.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Les Preuves Numériques", narrativeContext: "Les preuves contiennent des données chiffrées. Analyse les statistiques pour démontrer ton innocence.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Témoin Émotif", narrativeContext: "Un témoin est bouleversé et ne peut pas témoigner. Aide-le à gérer ses émotions pour qu'il puisse parler clairement.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Plaidoyer", narrativeContext: "C'est ton tour de parler au tribunal. Construis un argument logique et convaincant à partir des éléments récoltés.", exerciseType: "reading", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Verdict", narrativeContext: "Le jury délibère. Mais un dernier rebondissement change tout — un nouveau témoin apparaît. Analyse ses propos et décide s'il dit la vérité.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Juge Suprême", description: "Le Juge Suprême te soumet à l'épreuve ultime : morale, logique et empathie seront nécessaires pour obtenir justice.", exerciseTypes: ["reading", "math", "emotional", "social"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
];

async function main() {
  console.log("Seeding shop items...");
  for (const item of SHOP_ITEMS) {
    await prisma.shopItem.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, "-") },
      update: item,
      create: { id: item.name.toLowerCase().replace(/\s+/g, "-"), ...item },
    });
  }
  console.log(`${SHOP_ITEMS.length} shop items seeded.`);

  console.log("Seeding starter chapters...");
  for (const chapter of STARTER_CHAPTERS) {
    const { steps, ...chapterData } = chapter;
    const created = await prisma.chapter.upsert({
      where: { ageGroup_order: { ageGroup: chapter.ageGroup, order: chapter.order } },
      update: chapterData,
      create: chapterData,
    });
    for (const step of steps) {
      await prisma.chapterStep.upsert({
        where: { chapterId_order: { chapterId: created.id, order: step.order } },
        update: { ...step, chapterId: created.id },
        create: { ...step, chapterId: created.id },
      });
    }
  }
  console.log(`${STARTER_CHAPTERS.length} chapters seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed script to package.json**

In `package.json`, add to the `scripts` section:

```json
"db:seed": "npx tsx prisma/seed.ts"
```

Also add `prisma` section at root level:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Install tsx for running TypeScript seed**

Run: `cd /Users/superbot/elevo && npm install --save-dev tsx`

- [ ] **Step 4: Run the seed**

Run: `cd /Users/superbot/elevo && npx tsx prisma/seed.ts`
Expected: "17 shop items seeded." and "9 chapters seeded."

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: add seed script with shop items and 9 starter chapters"
```

---

## Phase 2: Core APIs

### Task 4: Story Generation API

**Files:**
- Create: `src/app/api/ai/story/route.ts`

- [ ] **Step 1: Create story generation endpoint**

```typescript
// src/app/api/ai/story/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, chapterId, stepId } = await req.json();

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { profile: true },
  });
  if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

  const step = await prisma.chapterStep.findUnique({
    where: { id: stepId },
    include: { chapter: true },
  });
  if (!step) return NextResponse.json({ error: "Étape introuvée" }, { status: 404 });

  const systemPrompt = `Tu es un maître conteur et pédagogue français. Tu crées des exercices éducatifs INTÉGRÉS dans une histoire narrative.

CONTEXTE NARRATIF DU CHAPITRE : "${step.chapter.title}" — ${step.chapter.description}
CONTEXTE DE L'ÉTAPE : "${step.title}" — ${step.narrativeContext}

L'enfant s'appelle ${child.name}, a le niveau "${child.ageGroup}", est au niveau ${child.level}.
Lumo est son compagnon fidèle (petit personnage lumineux).

RÈGLES :
- L'exercice DOIT être intégré dans la narration (pas de QCM brut)
- Mentionne ${child.name} et Lumo dans le récit
- Adapte le vocabulaire et la complexité au niveau "${child.ageGroup}"
- Réponds UNIQUEMENT avec du JSON valide, sans markdown

IMPORTANT : Réponds UNIQUEMENT avec du JSON valide.`;

  const exercisePrompts: Record<string, string> = {
    reading: `Génère une scène narrative avec un texte à lire (5-10 phrases pour maternelle, 10-15 pour primaire, 15-20 pour college-lycee) suivi de 3 questions de compréhension.
Format JSON :
{
  "narrative": "Texte narratif décrivant la scène avec ${child.name} et Lumo",
  "story": "Le texte à lire intégré dans l'histoire",
  "questions": [
    {"q": "Question sur le texte ?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Explication courte"}
  ],
  "lumoComment": "Un commentaire encourageant de Lumo"
}`,
    math: `Génère 5 problèmes mathématiques intégrés dans la scène narrative.
Format JSON :
{
  "narrative": "Texte narratif décrivant la situation où les maths sont nécessaires",
  "problems": [
    {"q": "Problème en contexte narratif", "answer": "42", "hint": "Indice de Lumo", "explanation": "Explication"}
  ],
  "lumoComment": "Commentaire encourageant de Lumo"
}`,
    emotional: `Génère 3 scénarios émotionnels intégrés dans la narration.
Format JSON :
{
  "narrative": "Texte narratif décrivant la situation émotionnelle",
  "scenarios": [
    {"situation": "Description du scénario", "q": "Que ferais-tu ?", "options": ["A", "B", "C", "D"], "best": 0, "explanation": "Pourquoi c'est le meilleur choix", "advice": "Conseil de Lumo"}
  ],
  "lumoComment": "Commentaire bienveillant de Lumo"
}`,
    memory: `Génère un exercice de mémoire intégré dans la narration (séquence à retenir, objets à mémoriser, etc).
Format JSON :
{
  "narrative": "Texte narratif contextualisant l'exercice de mémoire",
  "items": ["item1", "item2", "item3", "item4", "item5", "item6"],
  "questions": [
    {"q": "Quel était le 3ème élément ?", "options": ["A", "B", "C", "D"], "correct": 0}
  ],
  "lumoComment": "Commentaire de Lumo"
}`,
    social: `Génère un scénario social avec un dilemme relationnel intégré dans la narration.
Format JSON :
{
  "narrative": "Texte narratif décrivant la situation sociale",
  "scenarios": [
    {"situation": "Le conflit ou la situation", "q": "Comment résoudre ça ?", "options": ["A", "B", "C", "D"], "best": 0, "explanation": "Explication", "advice": "Conseil de Lumo"}
  ],
  "lumoComment": "Commentaire de Lumo"
}`,
    creativity: `Génère un exercice de créativité intégré dans la narration.
Format JSON :
{
  "narrative": "Texte narratif décrivant la situation créative",
  "challenge": "Description du défi créatif",
  "questions": [
    {"q": "Question sur la créativité", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Explication"}
  ],
  "lumoComment": "Commentaire de Lumo"
}`,
  };

  const exercisePrompt = exercisePrompts[step.exerciseType] || exercisePrompts.reading;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: exercisePrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Erreur de génération" }, { status: 500 });

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ data, exerciseType: step.exerciseType, step: { id: step.id, title: step.title, order: step.order }, chapter: { id: step.chapter.id, title: step.chapter.title } });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json({ error: "Erreur de génération d'histoire" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/ai/story/route.ts
git commit -m "feat: add /api/ai/story endpoint for narrative exercise generation"
```

---

### Task 5: Progress API

**Files:**
- Create: `src/app/api/progress/route.ts`

- [ ] **Step 1: Create progress endpoint**

```typescript
// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStarsForScore, EXERCISE_REWARDS, BOSS_REWARDS } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId requis" }, { status: 400 });

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

  const chapters = await prisma.chapter.findMany({
    where: { ageGroup: child.ageGroup },
    orderBy: { order: "asc" },
    include: {
      steps: { orderBy: { order: "asc" } },
      progress: { where: { childId } },
    },
  });

  const chaptersWithStatus = chapters.map((chapter, idx) => {
    const chapterProgress = chapter.progress.find((p) => !p.stepId);
    const stepsWithStatus = chapter.steps.map((step) => {
      const stepProgress = chapter.progress.find((p) => p.stepId === step.id);
      return { ...step, status: stepProgress?.status || "locked", score: stepProgress?.score, starsEarned: stepProgress?.starsEarned };
    });

    let chapterStatus = "locked";
    if (chapterProgress?.status === "completed") {
      chapterStatus = "completed";
    } else if (idx === 0 || chapters[idx - 1]?.progress.some((p) => !p.stepId && p.status === "completed")) {
      chapterStatus = "available";
    }

    return { ...chapter, status: chapterStatus, steps: stepsWithStatus, progress: undefined };
  });

  const currency = await prisma.childCurrency.findUnique({ where: { childId } });

  return NextResponse.json({ chapters: chaptersWithStatus, currency: currency || { stars: 0, crystals: 0, streakFreezes: 1 } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, chapterId, stepId, score, isBoss } = await req.json();

  const stars = getStarsForScore(score);
  const xpEarned = isBoss ? BOSS_REWARDS.xp : (score >= 90 ? EXERCISE_REWARDS.xp.perfect : EXERCISE_REWARDS.xp.base);
  const starsEarned = isBoss ? BOSS_REWARDS.stars : EXERCISE_REWARDS.stars[stars as 1 | 2 | 3];
  const crystalsEarned = isBoss ? BOSS_REWARDS.crystals : 0;

  // Upsert step progress
  await prisma.childProgress.upsert({
    where: { childId_chapterId_stepId: { childId, chapterId, stepId: stepId || "" } },
    update: { status: "completed", score, starsEarned: stars, completedAt: new Date() },
    create: { childId, chapterId, stepId, status: "completed", score, starsEarned: stars, completedAt: new Date() },
  });

  // Check if all steps in chapter are completed
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { steps: true } });
  const allStepProgress = await prisma.childProgress.findMany({ where: { childId, chapterId, status: "completed", stepId: { not: null } } });

  let chapterCompleted = false;
  if (chapter && allStepProgress.length >= chapter.steps.length && isBoss) {
    await prisma.childProgress.upsert({
      where: { childId_chapterId_stepId: { childId, chapterId, stepId: "" } },
      update: { status: "completed", completedAt: new Date() },
      create: { childId, chapterId, stepId: null, status: "completed", completedAt: new Date() },
    });
    chapterCompleted = true;
  }

  // Update child XP
  await prisma.child.update({
    where: { id: childId },
    data: { xp: { increment: xpEarned }, lastActivity: new Date() },
  });

  // Update currency
  await prisma.childCurrency.upsert({
    where: { childId },
    update: { stars: { increment: starsEarned }, crystals: { increment: crystalsEarned } },
    create: { childId, stars: starsEarned, crystals: crystalsEarned },
  });

  // Recalculate level
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (child) {
    const newLevel = Math.floor(child.xp / 500) + 1;
    if (newLevel > child.level) {
      await prisma.child.update({ where: { id: childId }, data: { level: newLevel } });
      await prisma.achievement.create({
        data: { childId, title: `Niveau ${newLevel}`, emoji: "⭐", desc: `Tu as atteint le niveau ${newLevel} !` },
      });
    }
  }

  return NextResponse.json({ xpEarned, starsEarned, crystalsEarned, stars, chapterCompleted });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/progress/route.ts
git commit -m "feat: add /api/progress endpoint for chapter progression and rewards"
```

---

### Task 6: Quests API

**Files:**
- Create: `src/app/api/quests/route.ts`

- [ ] **Step 1: Create quests endpoint**

```typescript
// src/app/api/quests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const QUEST_TEMPLATES = [
  { title: "Lumo a trouvé un coffre", description: "Résous {count} énigmes de {type} pour ouvrir le coffre", exerciseType: "math", targetCount: 2, reward: { stars: 15, xp: 30 } },
  { title: "Un villageois a perdu ses mots", description: "Aide-le en lisant {count} histoire(s)", exerciseType: "reading", targetCount: 1, reward: { stars: 10, xp: 20 } },
  { title: "Le pont est fragile", description: "Renforce-le en résolvant {count} problèmes de maths", exerciseType: "math", targetCount: 3, reward: { stars: 20, xp: 40 } },
  { title: "L'oiseau messager", description: "Aide l'oiseau à livrer son message en complétant {count} exercice(s) de mémoire", exerciseType: "memory", targetCount: 2, reward: { stars: 15, xp: 30 } },
  { title: "Le gardien triste", description: "Réconforte le gardien en complétant {count} exercice(s) émotionnel(s)", exerciseType: "emotional", targetCount: 1, reward: { stars: 10, xp: 25 } },
  { title: "Le défi de Lumo", description: "Lumo te défie ! Complète {count} exercices de n'importe quel type", exerciseType: "any", targetCount: 3, reward: { stars: 25, xp: 50 } },
];

function generateDailyQuests(childId: string, date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const shuffled = [...QUEST_TEMPLATES].sort((a, b) => {
    const hashA = (dayOfYear * 31 + QUEST_TEMPLATES.indexOf(a) * 7 + childId.charCodeAt(0)) % 100;
    const hashB = (dayOfYear * 31 + QUEST_TEMPLATES.indexOf(b) * 7 + childId.charCodeAt(0)) % 100;
    return hashA - hashB;
  });

  return shuffled.slice(0, 3).map((t) => ({
    childId,
    date,
    title: t.title,
    description: t.description.replace("{count}", String(t.targetCount)).replace("{type}", t.exerciseType),
    exerciseType: t.exerciseType,
    targetCount: t.targetCount,
    reward: t.reward,
  }));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId requis" }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let quests = await prisma.dailyQuest.findMany({ where: { childId, date: today } });

  if (quests.length === 0) {
    const questsData = generateDailyQuests(childId, today);
    await prisma.dailyQuest.createMany({ data: questsData, skipDuplicates: true });
    quests = await prisma.dailyQuest.findMany({ where: { childId, date: today } });
  }

  return NextResponse.json({ quests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { questId, increment } = await req.json();

  const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } });
  if (!quest) return NextResponse.json({ error: "Quête introuvée" }, { status: 404 });
  if (quest.completed) return NextResponse.json({ quest, alreadyCompleted: true });

  const newProgress = Math.min(quest.progress + (increment || 1), quest.targetCount);
  const completed = newProgress >= quest.targetCount;

  const updated = await prisma.dailyQuest.update({
    where: { id: questId },
    data: { progress: newProgress, completed },
  });

  if (completed) {
    const reward = quest.reward as { stars?: number; xp?: number };
    await prisma.childCurrency.upsert({
      where: { childId: quest.childId },
      update: { stars: { increment: reward.stars || 0 } },
      create: { childId: quest.childId, stars: reward.stars || 0, crystals: 0 },
    });
    if (reward.xp) {
      await prisma.child.update({ where: { id: quest.childId }, data: { xp: { increment: reward.xp } } });
    }
  }

  return NextResponse.json({ quest: updated, justCompleted: completed });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/quests/route.ts
git commit -m "feat: add /api/quests endpoint for daily quest generation and tracking"
```

---

### Task 7: Shop API

**Files:**
- Create: `src/app/api/shop/route.ts`

- [ ] **Step 1: Create shop endpoint**

```typescript
// src/app/api/shop/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  const type = req.nextUrl.searchParams.get("type");

  const items = await prisma.shopItem.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ rarity: "asc" }, { cost: "asc" }],
  });

  let owned: string[] = [];
  if (childId) {
    const inventory = await prisma.childInventory.findMany({ where: { childId }, select: { itemId: true } });
    owned = inventory.map((i) => i.itemId);
  }

  return NextResponse.json({ items, owned });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, itemId, action } = await req.json();

  if (action === "buy") {
    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item introuvé" }, { status: 404 });

    const existing = await prisma.childInventory.findUnique({ where: { childId_itemId: { childId, itemId } } });
    if (existing) return NextResponse.json({ error: "Déjà possédé" }, { status: 400 });

    const currency = await prisma.childCurrency.findUnique({ where: { childId } });
    if (!currency) return NextResponse.json({ error: "Pas de portefeuille" }, { status: 400 });

    const balance = item.currency === "crystals" ? currency.crystals : currency.stars;
    if (balance < item.cost) return NextResponse.json({ error: "Pas assez de fonds" }, { status: 400 });

    await prisma.$transaction([
      prisma.childCurrency.update({
        where: { childId },
        data: item.currency === "crystals" ? { crystals: { decrement: item.cost } } : { stars: { decrement: item.cost } },
      }),
      prisma.childInventory.create({ data: { childId, itemId } }),
    ]);

    return NextResponse.json({ success: true, item: item.name });
  }

  if (action === "equip") {
    const inv = await prisma.childInventory.findUnique({ where: { childId_itemId: { childId, itemId } } });
    if (!inv) return NextResponse.json({ error: "Item non possédé" }, { status: 400 });

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item introuvé" }, { status: 404 });

    // Unequip other items of same type
    await prisma.childInventory.updateMany({
      where: { childId, item: { type: item.type }, equippedAt: { not: null } },
      data: { equippedAt: null },
    });

    // Equip this item
    await prisma.childInventory.update({
      where: { childId_itemId: { childId, itemId } },
      data: { equippedAt: new Date() },
    });

    return NextResponse.json({ success: true, equipped: item.name });
  }

  if (action === "unequip") {
    await prisma.childInventory.update({
      where: { childId_itemId: { childId, itemId } },
      data: { equippedAt: null },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/shop/route.ts
git commit -m "feat: add /api/shop endpoint for buying and equipping cosmetics"
```

---

## Phase 3: UI Components

### Task 8: StatusBar Component

**Files:**
- Create: `src/components/StatusBar.tsx`

- [ ] **Step 1: Create StatusBar component**

```tsx
// src/components/StatusBar.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getStreakTier } from "@/lib/gamification";

interface StatusBarProps {
  childId: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  ageGroup: string;
}

export default function StatusBar({ childId, name, avatar, level, xp, streak, ageGroup }: StatusBarProps) {
  const [currency, setCurrency] = useState({ stars: 0, crystals: 0 });
  const [questCount, setQuestCount] = useState(0);
  const xpInLevel = xp % 500;
  const streakTier = getStreakTier(streak);

  useEffect(() => {
    fetch(`/api/shop?childId=${childId}`).then((r) => r.json()).then(() => {});
    fetch(`/api/progress?childId=${childId}`).then((r) => r.json()).then((d) => {
      if (d.currency) setCurrency(d.currency);
    });
    fetch(`/api/quests?childId=${childId}`).then((r) => r.json()).then((d) => {
      if (d.quests) setQuestCount(d.quests.filter((q: { completed: boolean }) => !q.completed).length);
    });
  }, [childId]);

  const gradients: Record<string, string> = {
    maternelle: "from-amber-500 to-orange-500",
    primaire: "from-emerald-500 to-teal-500",
    "college-lycee": "from-violet-500 to-purple-600",
  };

  return (
    <div className={`sticky top-0 z-50 bg-gradient-to-r ${gradients[ageGroup] || gradients.primaire} text-white px-4 py-2 shadow-lg`}>
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {/* Avatar + Level */}
        <Link href={`/child/${childId}/profile`} className="flex items-center gap-2">
          <span className="text-2xl">{avatar}</span>
          <div>
            <div className="text-xs font-bold">Niv. {level}</div>
            <div className="w-16 h-1.5 bg-white/30 rounded-full">
              <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
            </div>
          </div>
        </Link>

        {/* Streak */}
        <div className="flex items-center gap-1 text-sm font-bold" style={streakTier ? { color: streakTier.color === "rainbow" ? "#FFD700" : streakTier.color } : undefined}>
          <span>{streakTier?.emoji || "🔥"}</span>
          <span>{streak}</span>
        </div>

        {/* Currencies */}
        <div className="flex items-center gap-3 text-sm font-bold">
          <span>⭐ {currency.stars}</span>
          <span>💎 {currency.crystals}</span>
        </div>

        {/* Quests */}
        <Link href={`/child/${childId}/quests`} className="relative">
          <span className="text-xl">🔔</span>
          {questCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {questCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusBar.tsx
git commit -m "feat: add StatusBar component with level, currencies, streak, quests"
```

---

### Task 9: StarRating Component

**Files:**
- Create: `src/components/StarRating.tsx`

- [ ] **Step 1: Create StarRating component**

```tsx
// src/components/StarRating.tsx
"use client";

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function StarRating({ stars, maxStars = 3, size = "md", animated = false }: StarRatingProps) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={`${sizes[size]} ${i < stars ? "opacity-100" : "opacity-30"} ${animated && i < stars ? "animate-star-pop" : ""}`}
          style={animated && i < stars ? { animationDelay: `${i * 0.15}s` } : undefined}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StarRating.tsx
git commit -m "feat: add StarRating component"
```

---

### Task 10: WorldMap Component

**Files:**
- Create: `src/components/WorldMap.tsx`

- [ ] **Step 1: Create WorldMap component**

```tsx
// src/components/WorldMap.tsx
"use client";
import { useRouter } from "next/navigation";

interface Chapter {
  id: string;
  title: string;
  description: string;
  theme: string;
  order: number;
  mapPosition: { x: number; y: number };
  mapRegion: string;
  status: "locked" | "available" | "completed";
  steps: { id: string; status: string }[];
}

interface WorldMapProps {
  childId: string;
  chapters: Chapter[];
  ageGroup: string;
}

const REGION_COLORS: Record<string, { bg: string; icon: string }> = {
  forest: { bg: "from-green-400 to-emerald-600", icon: "🌲" },
  garden: { bg: "from-pink-400 to-rose-500", icon: "🌸" },
  village: { bg: "from-amber-400 to-orange-500", icon: "🏘️" },
  mountains: { bg: "from-gray-400 to-slate-600", icon: "⛰️" },
  castle: { bg: "from-purple-400 to-indigo-600", icon: "🏰" },
  ruins: { bg: "from-stone-400 to-stone-600", icon: "🏛️" },
  tower: { bg: "from-indigo-400 to-blue-600", icon: "🗼" },
  city: { bg: "from-slate-400 to-gray-600", icon: "🌆" },
};

const STATUS_STYLES = {
  locked: "opacity-40 grayscale cursor-not-allowed",
  available: "opacity-100 animate-pulse-glow cursor-pointer ring-2 ring-yellow-400",
  completed: "opacity-100 cursor-pointer ring-2 ring-green-400",
};

export default function WorldMap({ childId, chapters, ageGroup }: WorldMapProps) {
  const router = useRouter();

  const mapBg: Record<string, string> = {
    maternelle: "bg-gradient-to-b from-sky-200 via-green-100 to-amber-100",
    primaire: "bg-gradient-to-b from-indigo-200 via-emerald-100 to-amber-100",
    "college-lycee": "bg-gradient-to-b from-slate-800 via-indigo-900 to-purple-900",
  };

  return (
    <div className={`relative w-full min-h-[70vh] rounded-3xl overflow-hidden ${mapBg[ageGroup] || mapBg.primaire}`}>
      {/* Map title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h2 className={`text-xl font-black ${ageGroup === "college-lycee" ? "text-white" : "text-gray-800"}`}>
          🗺️ Monde d&apos;Elevo
        </h2>
      </div>

      {/* Path lines connecting chapters */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {chapters.slice(0, -1).map((ch, i) => {
          const next = chapters[i + 1];
          return (
            <line
              key={ch.id}
              x1={`${ch.mapPosition.x}`}
              y1={`${ch.mapPosition.y}`}
              x2={`${next.mapPosition.x}`}
              y2={`${next.mapPosition.y}`}
              stroke={ch.status === "completed" ? "#10B981" : "#9CA3AF"}
              strokeWidth="0.5"
              strokeDasharray={ch.status === "completed" ? "0" : "2,2"}
              opacity={ch.status === "locked" ? 0.3 : 0.6}
            />
          );
        })}
      </svg>

      {/* Chapter nodes */}
      {chapters.map((chapter) => {
        const region = REGION_COLORS[chapter.mapRegion] || REGION_COLORS.forest;
        const completedSteps = chapter.steps.filter((s) => s.status === "completed").length;
        const totalSteps = chapter.steps.length;

        return (
          <button
            key={chapter.id}
            onClick={() => chapter.status !== "locked" && router.push(`/child/${childId}/chapter/${chapter.id}`)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${STATUS_STYLES[chapter.status]}`}
            style={{ left: `${chapter.mapPosition.x}%`, top: `${chapter.mapPosition.y}%` }}
            disabled={chapter.status === "locked"}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${region.bg} flex flex-col items-center justify-center shadow-lg`}>
              <span className="text-2xl">{region.icon}</span>
              {chapter.status === "completed" && <span className="text-xs">✅</span>}
              {chapter.status === "available" && <span className="text-xs">⚔️</span>}
              {chapter.status === "locked" && <span className="text-xs">🔒</span>}
            </div>
            <div className={`text-center mt-1 max-w-[100px] ${ageGroup === "college-lycee" ? "text-white" : "text-gray-800"}`}>
              <p className="text-xs font-bold leading-tight truncate">{chapter.title}</p>
              {chapter.status !== "locked" && (
                <p className="text-[10px] opacity-70">{completedSteps}/{totalSteps}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WorldMap.tsx
git commit -m "feat: add WorldMap component with chapter nodes and path lines"
```

---

### Task 11: QuestCard Component

**Files:**
- Create: `src/components/QuestCard.tsx`

- [ ] **Step 1: Create QuestCard component**

```tsx
// src/components/QuestCard.tsx
"use client";

interface Quest {
  id: string;
  title: string;
  description: string;
  exerciseType: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  reward: { stars?: number; xp?: number };
}

interface QuestCardProps {
  quest: Quest;
}

const TYPE_EMOJIS: Record<string, string> = {
  reading: "📖", math: "🔢", emotional: "💜", memory: "🧠",
  social: "🤝", creativity: "🎨", physical: "🏃", any: "⚡",
};

export default function QuestCard({ quest }: QuestCardProps) {
  const progress = Math.min((quest.progress / quest.targetCount) * 100, 100);

  return (
    <div className={`rounded-2xl p-4 shadow-md transition-all ${quest.completed ? "bg-green-50 border-2 border-green-300" : "bg-white border border-gray-100"}`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{TYPE_EMOJIS[quest.exerciseType] || "📜"}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm">{quest.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>

          {/* Progress bar */}
          <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${quest.completed ? "bg-green-400" : "bg-elevo-purple"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] text-gray-400">{quest.progress}/{quest.targetCount}</span>
            <div className="flex gap-2 text-xs">
              {quest.reward.stars && <span>⭐ +{quest.reward.stars}</span>}
              {quest.reward.xp && <span className="text-elevo-purple">+{quest.reward.xp} XP</span>}
            </div>
          </div>
        </div>
        {quest.completed && <span className="text-2xl">✅</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/QuestCard.tsx
git commit -m "feat: add QuestCard component"
```

---

### Task 12: ShopItemCard Component

**Files:**
- Create: `src/components/ShopItemCard.tsx`

- [ ] **Step 1: Create ShopItemCard component**

```tsx
// src/components/ShopItemCard.tsx
"use client";
import { ITEM_RARITIES, CURRENCIES } from "@/lib/gamification";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  description: string;
  cost: number;
  currency: string;
  rarity: string;
}

interface ShopItemCardProps {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  onBuy: (itemId: string) => void;
}

export default function ShopItemCard({ item, owned, canAfford, onBuy }: ShopItemCardProps) {
  const rarity = ITEM_RARITIES[item.rarity as keyof typeof ITEM_RARITIES] || ITEM_RARITIES.common;
  const currencyInfo = CURRENCIES[item.currency as keyof typeof CURRENCIES] || CURRENCIES.stars;

  return (
    <div className="rounded-2xl border-2 p-3 transition-all hover:scale-105" style={{ borderColor: rarity.color + "40" }}>
      {/* Rarity badge */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: rarity.color + "20", color: rarity.color }}>
          {rarity.label}
        </span>
        {owned && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Possédé</span>}
      </div>

      {/* Item icon placeholder */}
      <div className="w-full h-20 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
        <span className="text-4xl">{item.type === "avatar_skin" ? "👤" : item.type === "lumo_skin" ? "✨" : item.type === "frame" ? "🖼️" : item.type === "title" ? "🏷️" : "💫"}</span>
      </div>

      <h3 className="font-bold text-sm text-gray-800 truncate">{item.name}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>

      {/* Price / Buy */}
      {owned ? (
        <div className="mt-2 text-center text-xs text-green-600 font-bold">✅ Dans ton sac</div>
      ) : (
        <button
          onClick={() => onBuy(item.id)}
          disabled={!canAfford}
          className={`mt-2 w-full py-1.5 rounded-xl text-sm font-bold transition-all ${
            canAfford
              ? "bg-elevo-purple text-white hover:bg-elevo-violet active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currencyInfo.emoji} {item.cost}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ShopItemCard.tsx
git commit -m "feat: add ShopItemCard component with rarity and purchase UI"
```

---

## Phase 4: Pages

### Task 13: Chapter Page

**Files:**
- Create: `src/app/child/[id]/chapter/[chapterId]/page.tsx`

- [ ] **Step 1: Create chapter page**

```tsx
// src/app/child/[id]/chapter/[chapterId]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LumoCharacter from "@/components/LumoCharacter";
import StarRating from "@/components/StarRating";

interface Chapter {
  id: string;
  title: string;
  description: string;
  theme: string;
  bossData: { name: string; description: string } | null;
  steps: {
    id: string;
    order: number;
    title: string;
    narrativeContext: string;
    exerciseType: string;
    status: string;
    starsEarned?: number;
  }[];
  status: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
  ageGroup: string;
  level: number;
}

const TYPE_EMOJIS: Record<string, string> = {
  reading: "📖", math: "🔢", emotional: "💜", memory: "🧠",
  social: "🤝", creativity: "🎨", physical: "🏃",
};

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/progress?childId=${childId}`).then((r) => r.json()),
      fetch(`/api/children/${childId}`).then((r) => r.json()),
    ]).then(([progressData, childData]) => {
      const ch = progressData.chapters?.find((c: Chapter) => c.id === chapterId);
      if (ch) setChapter(ch);
      if (childData) setChild(childData);
      setLoading(false);
    });
  }, [childId, chapterId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-bounce text-4xl">⚔️</div>
    </div>
  );

  if (!chapter || !child) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Chapitre introuvable</p>
      <Link href={`/child/${childId}`} className="text-elevo-purple font-bold">← Retour à la carte</Link>
    </div>
  );

  const completedSteps = chapter.steps.filter((s) => s.status === "completed").length;
  const allStepsCompleted = completedSteps === chapter.steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-elevo-purple to-elevo-violet text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">{chapter.title}</h1>
        <p className="text-white/80 text-sm mt-1">{chapter.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-2 bg-white/20 rounded-full">
            <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${(completedSteps / chapter.steps.length) * 100}%` }} />
          </div>
          <span className="text-sm font-bold">{completedSteps}/{chapter.steps.length}</span>
        </div>
      </div>

      {/* Lumo greeting */}
      <div className="flex items-center gap-3 px-4 mt-4">
        <div className="w-12 h-12">
          <LumoCharacter ageGroup={child.ageGroup} mood="happy" size="sm" />
        </div>
        <div className="bg-white rounded-2xl rounded-bl-none p-3 shadow-sm flex-1">
          <p className="text-sm text-gray-700">
            {completedSteps === 0
              ? `Bienvenue dans ${chapter.title}, ${child.name} ! L'aventure commence ici.`
              : allStepsCompleted
                ? `Incroyable ${child.name} ! Tu as terminé toutes les étapes. Prêt pour le boss ? 💪`
                : `Continue ton aventure, ${child.name} ! Plus que ${chapter.steps.length - completedSteps} étape(s).`}
          </p>
        </div>
      </div>

      {/* Steps list */}
      <div className="px-4 mt-6 space-y-3">
        {chapter.steps.map((step, idx) => {
          const isAvailable = step.status === "completed" || idx === 0 || chapter.steps[idx - 1]?.status === "completed";
          const isLocked = !isAvailable && step.status !== "completed";

          return (
            <button
              key={step.id}
              onClick={() => isAvailable && router.push(`/child/${childId}/chapter/${chapterId}/step/${step.id}`)}
              disabled={isLocked}
              className={`w-full text-left rounded-2xl p-4 transition-all flex items-center gap-4 ${
                step.status === "completed"
                  ? "bg-green-50 border-2 border-green-200"
                  : isAvailable
                    ? "bg-white border-2 border-elevo-purple/30 shadow-md hover:shadow-lg active:scale-[0.98]"
                    : "bg-gray-50 border border-gray-200 opacity-50"
              }`}
            >
              {/* Step number */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                step.status === "completed" ? "bg-green-400 text-white" : isAvailable ? "bg-elevo-purple text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {step.status === "completed" ? "✓" : step.order}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span>{TYPE_EMOJIS[step.exerciseType] || "📜"}</span>
                  <h3 className="font-bold text-sm text-gray-800 truncate">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.narrativeContext}</p>
                {step.status === "completed" && step.starsEarned && (
                  <div className="mt-1"><StarRating stars={step.starsEarned} size="sm" /></div>
                )}
              </div>

              {isLocked && <span className="text-xl">🔒</span>}
              {isAvailable && step.status !== "completed" && <span className="text-xl">⚔️</span>}
            </button>
          );
        })}

        {/* Boss button */}
        {chapter.bossData && (
          <button
            onClick={() => allStepsCompleted && router.push(`/child/${childId}/chapter/${chapterId}/step/boss`)}
            disabled={!allStepsCompleted}
            className={`w-full text-left rounded-2xl p-4 transition-all flex items-center gap-4 ${
              allStepsCompleted
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl active:scale-[0.98] animate-pulse-glow"
                : "bg-gray-100 border border-gray-200 opacity-50"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${allStepsCompleted ? "bg-white/20" : "bg-gray-200"}`}>
              👹
            </div>
            <div className="flex-1">
              <h3 className="font-black text-sm">{(chapter.bossData as { name: string }).name}</h3>
              <p className="text-xs opacity-80">{(chapter.bossData as { description: string }).description}</p>
            </div>
            {!allStepsCompleted && <span className="text-xl">🔒</span>}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/child/[id]/chapter/[chapterId]/page.tsx
git commit -m "feat: add chapter page with steps list and boss button"
```

---

### Task 14: Narrative Exercise Page (Step Page)

**Files:**
- Create: `src/app/child/[id]/chapter/[chapterId]/step/[stepId]/page.tsx`

- [ ] **Step 1: Create narrative exercise page**

```tsx
// src/app/child/[id]/chapter/[chapterId]/step/[stepId]/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import LumoCharacter from "@/components/LumoCharacter";
import StarRating from "@/components/StarRating";

interface ExerciseData {
  narrative?: string;
  story?: string;
  questions?: { q: string; options: string[]; correct: number; explanation?: string }[];
  problems?: { q: string; answer: string; hint?: string; explanation?: string }[];
  scenarios?: { situation: string; q: string; options: string[]; best: number; explanation?: string; advice?: string }[];
  lumoComment?: string;
}

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const chapterId = params.chapterId as string;
  const stepId = params.stepId as string;

  const [data, setData] = useState<ExerciseData | null>(null);
  const [exerciseType, setExerciseType] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"narrative" | "exercise" | "done">("narrative");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [rewards, setRewards] = useState<{ xpEarned: number; starsEarned: number; stars: number } | null>(null);
  const [lumoMood, setLumoMood] = useState<"happy" | "excited" | "proud" | "idle">("happy");

  useEffect(() => {
    fetch("/api/ai/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, chapterId, stepId }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setData(result.data);
          setExerciseType(result.exerciseType);
          setStepTitle(result.step?.title || "");
          const qCount = result.data.questions?.length || result.data.problems?.length || result.data.scenarios?.length || 0;
          setAnswers(new Array(qCount).fill(null));
        }
        setLoading(false);
      });
  }, [childId, chapterId, stepId]);

  const getQuestions = useCallback(() => {
    if (!data) return [];
    if (data.questions) return data.questions.map((q) => ({ ...q, type: "qcm" as const }));
    if (data.scenarios) return data.scenarios.map((s) => ({ q: s.q, options: s.options, correct: s.best, explanation: s.explanation, type: "qcm" as const }));
    if (data.problems) return data.problems.map((p) => ({ q: p.q, answer: p.answer, hint: p.hint, explanation: p.explanation, type: "input" as const }));
    return [];
  }, [data]);

  const handleAnswer = (answer: number | string) => {
    const updated = [...answers];
    updated[currentQ] = answer;
    setAnswers(updated);
    setShowFeedback(true);

    const questions = getQuestions();
    const q = questions[currentQ];
    const isCorrect = q.type === "input"
      ? String(answer).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
      : answer === q.correct;

    setLumoMood(isCorrect ? "excited" : "idle");

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setLumoMood("happy");
      } else {
        finishExercise(updated);
      }
    }, 2000);
  };

  const finishExercise = async (finalAnswers: (number | string | null)[]) => {
    const questions = getQuestions();
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.type === "input") {
        if (String(finalAnswers[i]).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) correct++;
      } else {
        if (finalAnswers[i] === q.correct) correct++;
      }
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setLumoMood("proud");
    setPhase("done");

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, chapterId, stepId, score: finalScore, isBoss: false }),
    });
    const rewardData = await res.json();
    setRewards(rewardData);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-indigo-50 to-white">
      <div className="w-20 h-20"><LumoCharacter ageGroup="primaire" mood="excited" /></div>
      <p className="text-gray-500 animate-pulse">Lumo prépare ton aventure...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Erreur de chargement</p>
      <button onClick={() => router.back()} className="text-elevo-purple font-bold">← Retour</button>
    </div>
  );

  // NARRATIVE PHASE
  if (phase === "narrative") return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-black text-gray-800 mb-4">📜 {stepTitle}</h2>
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{data.narrative || data.story}</p>
        </div>
        {data.story && data.narrative && (
          <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{data.story}</p>
          </div>
        )}
        <div className="flex items-end gap-3 mb-6">
          <div className="w-12 h-12"><LumoCharacter ageGroup="primaire" mood="happy" size="sm" /></div>
          <div className="bg-elevo-purple/10 rounded-2xl rounded-bl-none p-3 flex-1">
            <p className="text-sm text-elevo-purple">{data.lumoComment || "C'est parti ! Tu es prêt ?"}</p>
          </div>
        </div>
        <button
          onClick={() => setPhase("exercise")}
          className="w-full py-4 rounded-2xl bg-elevo-purple text-white font-black text-lg shadow-lg active:scale-95 transition-all"
        >
          Commencer l&apos;épreuve ⚔️
        </button>
      </div>
    </div>
  );

  // EXERCISE PHASE
  if (phase === "exercise") {
    const questions = getQuestions();
    const q = questions[currentQ];
    if (!q) return null;

    const currentAnswer = answers[currentQ];
    const isCorrect = q.type === "input"
      ? String(currentAnswer).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
      : currentAnswer === q.correct;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => router.back()} className="text-gray-400">✕</button>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-elevo-purple rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 font-bold">{currentQ + 1}/{questions.length}</span>
          </div>

          {/* Lumo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16"><LumoCharacter ageGroup="primaire" mood={lumoMood} /></div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-3xl p-6 shadow-md mb-4">
            <p className="text-gray-800 font-bold text-center">{q.q}</p>
          </div>

          {/* Options (QCM) */}
          {q.type === "qcm" && q.options && (
            <div className="space-y-3">
              {q.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => !showFeedback && handleAnswer(i)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-2xl font-bold transition-all ${
                    showFeedback && i === q.correct
                      ? "bg-green-100 border-2 border-green-400 text-green-800"
                      : showFeedback && currentAnswer === i && !isCorrect
                        ? "bg-red-100 border-2 border-red-400 text-red-800"
                        : "bg-white border-2 border-gray-100 hover:border-elevo-purple/50 active:scale-[0.98]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Input (math) */}
          {q.type === "input" && !showFeedback && (
            <form onSubmit={(e) => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem("answer") as HTMLInputElement; if (input.value) handleAnswer(input.value); }}>
              <input name="answer" type="text" autoFocus placeholder="Ta réponse..." className="w-full p-4 rounded-2xl border-2 border-gray-200 text-center text-lg font-bold focus:border-elevo-purple focus:outline-none" />
              <button type="submit" className="w-full mt-3 py-3 rounded-2xl bg-elevo-purple text-white font-bold">Valider</button>
              {q.hint && <p className="text-center text-xs text-gray-400 mt-2">💡 {q.hint}</p>}
            </form>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-4 p-4 rounded-2xl ${isCorrect ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <p className="font-bold text-sm">{isCorrect ? "✅ Bravo !" : "💪 Pas tout à fait..."}</p>
              {q.explanation && <p className="text-xs text-gray-600 mt-1">{q.explanation}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DONE PHASE
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 mb-4"><LumoCharacter ageGroup="primaire" mood="proud" /></div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Épreuve terminée !</h2>
      <p className="text-gray-500 mb-4">Score : {score}%</p>
      {rewards && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <StarRating stars={rewards.stars} size="lg" animated />
          <div className="flex gap-4 text-lg font-bold">
            <span className="text-elevo-purple">+{rewards.xpEarned} XP</span>
            <span>⭐ +{rewards.starsEarned}</span>
          </div>
        </div>
      )}
      <button
        onClick={() => router.push(`/child/${childId}/chapter/${chapterId}`)}
        className="py-4 px-8 rounded-2xl bg-elevo-purple text-white font-black text-lg shadow-lg active:scale-95 transition-all"
      >
        Continuer l&apos;aventure →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/child/[id]/chapter/[chapterId]/step/[stepId]/page.tsx"
git commit -m "feat: add narrative exercise page with story intro, exercise, and rewards"
```

---

### Task 15: Quests Page

**Files:**
- Create: `src/app/child/[id]/quests/page.tsx`

- [ ] **Step 1: Create quests page**

```tsx
// src/app/child/[id]/quests/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QuestCard from "@/components/QuestCard";

interface Quest {
  id: string;
  title: string;
  description: string;
  exerciseType: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  reward: { stars?: number; xp?: number };
}

export default function QuestsPage() {
  const params = useParams();
  const childId = params.id as string;
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quests?childId=${childId}`)
      .then((r) => r.json())
      .then((d) => { setQuests(d.quests || []); setLoading(false); });
  }, [childId]);

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">🔔 Quêtes du Jour</h1>
        <p className="text-white/80 text-sm mt-1">{completedCount}/{quests.length} complétées</p>
        <div className="mt-3 h-2 bg-white/20 rounded-full">
          <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: quests.length ? `${(completedCount / quests.length) * 100}%` : "0%" }} />
        </div>
      </div>

      <div className="px-4 mt-6 space-y-3 max-w-md mx-auto">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-400 animate-pulse">Chargement des quêtes...</p>
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">🌙</p>
            <p className="text-gray-500">Pas de quêtes pour le moment. Reviens demain !</p>
          </div>
        ) : (
          quests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
        )}

        {completedCount === quests.length && quests.length > 0 && (
          <div className="text-center py-6 bg-green-50 rounded-2xl border-2 border-green-200">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-black text-green-700">Toutes les quêtes du jour sont complétées !</p>
            <p className="text-sm text-green-600 mt-1">Reviens demain pour de nouvelles aventures</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/child/[id]/quests/page.tsx"
git commit -m "feat: add daily quests page"
```

---

### Task 16: Shop Page

**Files:**
- Create: `src/app/child/[id]/shop/page.tsx`

- [ ] **Step 1: Create shop page**

```tsx
// src/app/child/[id]/shop/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ShopItemCard from "@/components/ShopItemCard";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  description: string;
  cost: number;
  currency: string;
  rarity: string;
}

const TABS = [
  { id: "all", label: "Tout", emoji: "🛍️" },
  { id: "avatar_skin", label: "Avatar", emoji: "👤" },
  { id: "lumo_skin", label: "Lumo", emoji: "✨" },
  { id: "frame", label: "Cadres", emoji: "🖼️" },
  { id: "title", label: "Titres", emoji: "🏷️" },
  { id: "effect", label: "Effets", emoji: "💫" },
];

export default function ShopPage() {
  const params = useParams();
  const childId = params.id as string;
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [currency, setCurrency] = useState({ stars: 0, crystals: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      fetch(`/api/shop?childId=${childId}`).then((r) => r.json()),
      fetch(`/api/progress?childId=${childId}`).then((r) => r.json()),
    ]).then(([shopData, progressData]) => {
      setItems(shopData.items || []);
      setOwned(shopData.owned || []);
      if (progressData.currency) setCurrency(progressData.currency);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [childId]);

  const handleBuy = async (itemId: string) => {
    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, itemId, action: "buy" }),
    });
    if (res.ok) loadData();
    else {
      const err = await res.json();
      alert(err.error || "Erreur d'achat");
    }
  };

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      <div className="bg-gradient-to-r from-elevo-purple to-elevo-violet text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">🛍️ Boutique</h1>
        <div className="flex gap-4 mt-3 text-lg font-bold">
          <span>⭐ {currency.stars}</span>
          <span>💎 {currency.crystals}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === tab.id ? "bg-elevo-purple text-white" : "bg-white text-gray-600 border"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="px-4 mt-4 max-w-md mx-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-10 animate-pulse">Chargement...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                owned={owned.includes(item.id)}
                canAfford={item.currency === "crystals" ? currency.crystals >= item.cost : currency.stars >= item.cost}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/child/[id]/shop/page.tsx"
git commit -m "feat: add cosmetic shop page with tabs, currency display, and purchase"
```

---

### Task 17: Inventory Page

**Files:**
- Create: `src/app/child/[id]/inventory/page.tsx`

- [ ] **Step 1: Create inventory page**

```tsx
// src/app/child/[id]/inventory/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ITEM_RARITIES } from "@/lib/gamification";

interface InventoryItem {
  id: string;
  itemId: string;
  equippedAt: string | null;
  acquiredAt: string;
  item: { id: string; name: string; type: string; description: string; rarity: string };
}

export default function InventoryPage() {
  const params = useParams();
  const childId = params.id as string;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = () => {
    fetch(`/api/shop?childId=${childId}&inventory=true`)
      .then((r) => r.json())
      .then((d) => { setInventory(d.inventory || []); setLoading(false); });
  };

  useEffect(() => { loadInventory(); }, [childId]);

  const handleEquip = async (itemId: string, isEquipped: boolean) => {
    await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, itemId, action: isEquipped ? "unequip" : "equip" }),
    });
    loadInventory();
  };

  const equipped = inventory.filter((i) => i.equippedAt);
  const unequipped = inventory.filter((i) => !i.equippedAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">🎒 Sac à Dos</h1>
        <p className="text-white/80 text-sm mt-1">{inventory.length} objet(s)</p>
      </div>

      <div className="px-4 mt-6 max-w-md mx-auto space-y-6">
        {/* Equipped */}
        {equipped.length > 0 && (
          <div>
            <h2 className="font-black text-gray-800 mb-3">⚔️ Équipé</h2>
            <div className="space-y-2">
              {equipped.map((inv) => {
                const rarity = ITEM_RARITIES[inv.item.rarity as keyof typeof ITEM_RARITIES] || ITEM_RARITIES.common;
                return (
                  <div key={inv.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border-2" style={{ borderColor: rarity.color }}>
                    <span className="text-2xl">{inv.item.type === "avatar_skin" ? "👤" : inv.item.type === "lumo_skin" ? "✨" : inv.item.type === "frame" ? "🖼️" : inv.item.type === "title" ? "🏷️" : "💫"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{inv.item.name}</p>
                      <p className="text-xs" style={{ color: rarity.color }}>{rarity.label}</p>
                    </div>
                    <button onClick={() => handleEquip(inv.itemId, true)} className="text-xs text-red-500 font-bold">Retirer</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unequipped */}
        <div>
          <h2 className="font-black text-gray-800 mb-3">📦 Inventaire</h2>
          {loading ? (
            <p className="text-gray-400 animate-pulse">Chargement...</p>
          ) : unequipped.length === 0 && equipped.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🎒</p>
              <p className="text-gray-500">Ton sac est vide ! Visite la boutique.</p>
              <Link href={`/child/${childId}/shop`} className="text-elevo-purple font-bold text-sm mt-2 inline-block">Aller à la boutique →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {unequipped.map((inv) => {
                const rarity = ITEM_RARITIES[inv.item.rarity as keyof typeof ITEM_RARITIES] || ITEM_RARITIES.common;
                return (
                  <div key={inv.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100">
                    <span className="text-2xl">{inv.item.type === "avatar_skin" ? "👤" : inv.item.type === "lumo_skin" ? "✨" : inv.item.type === "frame" ? "🖼️" : inv.item.type === "title" ? "🏷️" : "💫"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{inv.item.name}</p>
                      <p className="text-xs" style={{ color: rarity.color }}>{rarity.label}</p>
                    </div>
                    <button onClick={() => handleEquip(inv.itemId, false)} className="text-xs bg-elevo-purple text-white px-3 py-1 rounded-full font-bold">Équiper</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/child/[id]/inventory/page.tsx"
git commit -m "feat: add inventory/backpack page with equip/unequip functionality"
```

---

## Phase 5: Hub Refonte

### Task 18: Refonte du Hub Enfant (Carte du Monde)

**Files:**
- Modify: `src/app/child/[id]/page.tsx`

- [ ] **Step 1: Read the current file**

Run: Read `src/app/child/[id]/page.tsx` to get the full current content.

- [ ] **Step 2: Replace module grid section with WorldMap**

Add imports at the top of the file:

```tsx
import WorldMap from "@/components/WorldMap";
import StatusBar from "@/components/StatusBar";
```

Replace the module grid section (the `<div className="grid grid-cols-2 ...">` with module cards) with:

```tsx
<WorldMap childId={child.id} chapters={chapters} ageGroup={child.ageGroup} />
```

Add state for chapters:

```tsx
const [chapters, setChapters] = useState([]);
```

Add a useEffect to fetch chapters:

```tsx
useEffect(() => {
  if (child) {
    fetch(`/api/progress?childId=${child.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.chapters) setChapters(d.chapters); });
  }
}, [child]);
```

Add the StatusBar at the top of the page (before the main content):

```tsx
{child && (
  <StatusBar
    childId={child.id}
    name={child.name}
    avatar={child.avatar}
    level={child.level}
    xp={child.xp}
    streak={child.streak}
    ageGroup={child.ageGroup}
  />
)}
```

Add bottom navigation bar at the end:

```tsx
{child && (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
    <div className="flex justify-around max-w-md mx-auto">
      <Link href={`/child/${child.id}`} className="flex flex-col items-center text-elevo-purple">
        <span className="text-xl">🗺️</span><span className="text-[10px] font-bold">Carte</span>
      </Link>
      <Link href={`/child/${child.id}/quests`} className="flex flex-col items-center text-gray-400">
        <span className="text-xl">🔔</span><span className="text-[10px] font-bold">Quêtes</span>
      </Link>
      <Link href={`/child/${child.id}/shop`} className="flex flex-col items-center text-gray-400">
        <span className="text-xl">🛍️</span><span className="text-[10px] font-bold">Boutique</span>
      </Link>
      <Link href={`/child/${child.id}/inventory`} className="flex flex-col items-center text-gray-400">
        <span className="text-xl">🎒</span><span className="text-[10px] font-bold">Sac</span>
      </Link>
      <Link href={`/child/${child.id}/profile`} className="flex flex-col items-center text-gray-400">
        <span className="text-xl">👤</span><span className="text-[10px] font-bold">Profil</span>
      </Link>
    </div>
  </nav>
)}
```

- [ ] **Step 3: Verify the page compiles**

Run: `cd /Users/superbot/elevo && npx next build 2>&1 | head -30`
Expected: Build starts without errors on the child page.

- [ ] **Step 4: Commit**

```bash
git add "src/app/child/[id]/page.tsx"
git commit -m "feat: replace module grid with world map hub and bottom navigation"
```

---

## Phase 6: Animations & Polish

### Task 19: Add New Animations

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add star-pop animation to globals.css**

Add after existing keyframes in `globals.css`:

```css
@keyframes star-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-star-pop {
  animation: star-pop 0.4s ease-out forwards;
}

@keyframes map-node-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }
  50% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.8); }
}

@keyframes reward-pop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.animate-reward-pop {
  animation: reward-pop 0.5s ease-out forwards;
}
```

- [ ] **Step 2: Add animation to tailwind config**

In `tailwind.config.ts`, add to the `animation` section:

```typescript
"map-pulse": "map-node-pulse 2s ease-in-out infinite",
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat: add star-pop, map-pulse, and reward-pop animations"
```

---

## Phase 7: Children API Endpoint

### Task 20: Child Data API

**Files:**
- Create: `src/app/api/children/[id]/route.ts`

- [ ] **Step 1: Create child data endpoint**

This endpoint is needed by the chapter page to fetch child data.

```typescript
// src/app/api/children/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const child = await prisma.child.findUnique({
    where: { id: params.id },
    include: { profile: true, achievements: { orderBy: { unlockedAt: "desc" }, take: 10 } },
  });

  if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

  return NextResponse.json(child);
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/children/[id]/route.ts"
git commit -m "feat: add /api/children/[id] endpoint for child data"
```

---

## Phase 8: Build & Deploy

### Task 21: Build Verification

- [ ] **Step 1: Run Prisma generate**

Run: `cd /Users/superbot/elevo && npx prisma generate`
Expected: Prisma Client generated.

- [ ] **Step 2: Run the build**

Run: `cd /Users/superbot/elevo && npm run build 2>&1 | tail -40`
Expected: Build succeeds. Note any warnings to fix.

- [ ] **Step 3: Fix any build errors**

If TypeScript errors appear, fix them in the affected files. Common issues:
- Missing type imports
- Prisma Client types not matching schema
- Next.js page props typing

- [ ] **Step 4: Run seed in production database**

Run: `cd /Users/superbot/elevo && npx tsx prisma/seed.ts`
Expected: Shop items and chapters seeded.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors"
```

### Task 22: Deploy

- [ ] **Step 1: Push to GitHub**

Run: `cd /Users/superbot/elevo && git push origin main`
Expected: Pushed to remote.

- [ ] **Step 2: Verify Vercel deployment**

Run: `cd /Users/superbot/elevo && vercel --prod 2>&1 | tail -10`
Or wait for Vercel auto-deploy from GitHub push.

- [ ] **Step 3: Verify the deployed app**

Open `https://elevo-five.vercel.app` and check:
- Child hub shows world map
- Chapters are visible and clickable
- Clicking a chapter shows steps
- Clicking a step generates narrative exercise
- Shop page loads with items
- Quests page shows daily quests

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Database | Tasks 1-3 | New models, seed data, gamification constants |
| 2: APIs | Tasks 4-7 | Story generation, progress, quests, shop endpoints |
| 3: Components | Tasks 8-12 | StatusBar, StarRating, WorldMap, QuestCard, ShopItemCard |
| 4: Pages | Tasks 13-17 | Chapter, exercise, quests, shop, inventory pages |
| 5: Hub | Task 18 | World map replaces module grid |
| 6: Polish | Task 19 | New animations |
| 7: Support | Task 20 | Child data API |
| 8: Deploy | Tasks 21-22 | Build verification and Vercel deployment |
