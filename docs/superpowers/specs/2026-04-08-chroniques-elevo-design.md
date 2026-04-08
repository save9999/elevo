# Les Chroniques d'Elevo — Design Spec

## Vision

Transformer Elevo d'une app éducative classique (QCM + modules) en une aventure narrative immersive où l'enfant est le héros, Lumo est son sidekick, et chaque exercice est intégré dans une histoire générée dynamiquement par Claude AI. Full gamification inspirée de Duolingo/Khan Academy Kids.

## Public cible

Tous les groupes d'âge (maternelle, primaire, collège-lycée), avec adaptation du ton narratif, du style visuel et de la complexité des exercices par tranche.

---

## 1. Système narratif

### Structure

- **Monde d'Elevo** : univers fantasy divisé en régions
- **Chapitres** : chaque chapitre = un lieu (forêt, mines, château, océan...) avec un thème pédagogique dominant
- **Étapes** : 4-6 étapes par chapitre, chacune avec un contexte narratif et 1-3 exercices intégrés
- **Boss** : chaque chapitre se termine par un boss (quiz final mixte)
- Chapitres débloqués séquentiellement, étapes dans un chapitre jouables dans l'ordre

### Personnages

- **L'enfant** : héros principal, avatar personnalisable
- **Lumo** : sidekick permanent, donne des indices, réagit émotionnellement
- **PNJ de chapitre** : générés par Claude AI (forgeron, sorcière, roi...), liés à un type d'exercice
- **Antagoniste** : un "méchant" par chapitre justifiant le boss final

### Génération par Claude AI

- Claude génère le chapitre entier : narration, PNJ, dialogues, exercices contextualisés, boss
- Les exercices ne sont jamais "nus" — toujours enrobés dans l'histoire ("Pour ouvrir la porte, résous cette énigme...")
- Le contenu généré est caché pour éviter la re-génération (coût API)

### Adaptation par âge

| Aspect | Maternelle (3-5) | Primaire (6-10) | Collège-lycée (11-18) |
|--------|-------------------|------------------|-----------------------|
| Ton | Conte pour enfants, animaux parlants | Aventure héroïque, fantasy | Intrigue complexe, choix moraux |
| Exercices | Visuels, matching, drag & drop | QCM enrichis, puzzles | Problèmes ouverts, rédaction |
| Interactions | Gros boutons, tactile | Clic + saisies simples | Saisie texte, choix complexes |
| Carte | Ronde, colorée, animaux | Fantasy classique, détaillée | Sombre, mystérieuse, mature |

---

## 2. Gamification & boucle d'engagement

### Système de ressources

| Ressource | Obtention | Utilisation |
|-----------|-----------|-------------|
| Étoiles | Réussir des exercices (1-3 selon score) | Boutique cosmétique |
| XP | Chaque exercice complété | Monter de niveau (500 XP/niveau, existant) |
| Cristaux | Boss vaincus, streaks, événements rares | Items rares (boutique premium) |
| Fragments d'histoire | Compléter des chapitres | Débloquer le chapitre suivant |

### Quêtes

- **3 quêtes quotidiennes** : générées par Claude AI, intégrées à la narration, récompense étoiles + bonus XP
- **1 quête hebdomadaire** : plus ambitieuse (5+ exercices), récompense cristaux + cosmétique exclusif

### Boutique cosmétique

- Skins avatar (armures, capes, chapeaux, ailes)
- Skins Lumo (couleurs, accessoires, formes)
- Décorations profil (cadres, fonds, titres)
- Effets visuels (traînée d'étoiles, aura, animations)

### Pas de système de vies/énergie

Un enfant ne doit jamais être bloqué de jouer. Se tromper fait partie de l'apprentissage.

### Streaks améliorés

- 3 jours : flamme bronze
- 7 jours : flamme argent + cristaux
- 14 jours : flamme or
- 30 jours : flamme arc-en-ciel + skin exclusif
- 1 streak freeze gratuit par semaine

### Badges étendus

- Maîtrise : "10 exercices de maths parfaits"
- Exploration : "Visiter 5 chapitres différents"
- Sociaux : "Partager un succès avec un parent"
- Secrets : Easter eggs dans les histoires
- Saisonniers : Halloween, Noël, rentrée

---

## 3. Refonte visuelle & UX

### Hub principal : carte du monde

- Remplace la grille de 9 modules par une carte illustrée du monde d'Elevo
- Chaque chapitre = un lieu sur la carte
- Chapitres complétés illuminés, suivants en silhouette/brumeux
- Avatar de l'enfant visible sur la carte au chapitre en cours
- Lumo flotte à côté

### Barre de statut persistante

```
[Avatar] Niveau 7 ████░░ 340/500 XP  |  🔥 12  |  ⭐ 245  |  💎 8  |  🔔 3 quêtes
```

### Navigation

- Carte (hub) — toujours accessible
- Quêtes — quotidiennes + hebdo
- Sac à dos — inventaire, badges, fragments
- Boutique — dépenser étoiles/cristaux
- Profil — stats, compétences, historique

### Écran d'exercice narratif

1. Panneau narratif (haut) : illustration + texte de l'histoire
2. Zone d'exercice (centre) : exercice intégré dans le contexte
3. Lumo (coin) : indices si galère, réactions aux réponses
4. Feedback animé : bonne réponse = animation contextuelle + confetti. Mauvaise = encouragement + explication

---

## 4. Architecture technique

### Nouveaux modèles Prisma

```prisma
model Chapter {
  id          String   @id @default(cuid())
  title       String
  description String
  theme       String
  ageGroup    String
  difficulty  Int      @default(1)
  order       Int
  mapPosition Json
  bossData    Json?
  steps       ChapterStep[]
  progress    ChildProgress[]
  createdAt   DateTime @default(now())
}

model ChapterStep {
  id               String   @id @default(cuid())
  chapterId        String
  chapter          Chapter  @relation(fields: [chapterId], references: [id])
  order            Int
  narrativeContext  String   @db.Text
  exerciseType     String
  exerciseData     Json?
  rewards          Json
  progress         ChildProgress[]
}

model ChildProgress {
  id             String   @id @default(cuid())
  childId        String
  child          Child    @relation(fields: [childId], references: [id])
  chapterId      String
  chapter        Chapter  @relation(fields: [chapterId], references: [id])
  stepId         String?
  step           ChapterStep? @relation(fields: [stepId], references: [id])
  status         String   @default("locked")
  score          Int?
  starsEarned    Int?
  narrativeState Json?
  completedAt    DateTime?

  @@unique([childId, chapterId, stepId])
}

model DailyQuest {
  id            String   @id @default(cuid())
  childId       String
  child         Child    @relation(fields: [childId], references: [id])
  date          DateTime @db.Date
  title         String
  description   String
  narrativeHook String?
  exerciseType  String
  targetCount   Int      @default(1)
  progress      Int      @default(0)
  completed     Boolean  @default(false)
  reward        Json
  createdAt     DateTime @default(now())

  @@unique([childId, date, title])
}

model ShopItem {
  id          String   @id @default(cuid())
  name        String
  type        String
  cost        Int
  currency    String   @default("stars")
  ageGroup    String?
  rarity      String   @default("common")
  imageUrl    String?
  previewData Json?
  inventory   ChildInventory[]
}

model ChildInventory {
  id         String   @id @default(cuid())
  childId    String
  child      Child    @relation(fields: [childId], references: [id])
  itemId     String
  item       ShopItem @relation(fields: [itemId], references: [id])
  equippedAt DateTime?
  acquiredAt DateTime @default(now())

  @@unique([childId, itemId])
}

model ChildCurrency {
  id            String @id @default(cuid())
  childId       String @unique
  child         Child  @relation(fields: [childId], references: [id])
  stars         Int    @default(0)
  crystals      Int    @default(0)
  streakFreezes Int    @default(1)
}
```

### Nouvelles routes API

| Route | Rôle |
|-------|------|
| `POST /api/ai/story` | Génère un chapitre complet (narration + exercices) |
| `GET/POST /api/quests` | CRUD quêtes quotidiennes/hebdo |
| `GET /api/shop` | Liste des items disponibles |
| `POST /api/shop/buy` | Achat d'un item |
| `POST /api/shop/equip` | Équiper/déséquiper un item |
| `GET/POST /api/progress` | Progression chapitres + déblocage |

### Routes API modifiées

| Route | Changement |
|-------|-----------|
| `/api/ai/exercise` | Reçoit `narrativeContext` → exercice intégré à l'histoire |
| `/api/ai/character` | Lumo réagit au contexte du chapitre en cours |

### Pages Next.js

| Page | Action |
|------|--------|
| `/child/[id]/page.tsx` | Refonte → carte du monde |
| `/child/[id]/chapter/[chapterId]/page.tsx` | Nouveau → vue chapitre avec étapes |
| `/child/[id]/chapter/[chapterId]/step/[stepId]/page.tsx` | Nouveau → exercice narratif |
| `/child/[id]/quests/page.tsx` | Nouveau → quêtes quotidiennes/hebdo |
| `/child/[id]/shop/page.tsx` | Nouveau → boutique cosmétique |
| `/child/[id]/inventory/page.tsx` | Nouveau → sac à dos |
| `/child/[id]/profile/page.tsx` | Modifié → badges étendus, titre équipé |

### Stratégie de migration

- Les modules existants (math, reading, etc.) restent mais sont enveloppés dans le système narratif
- Le parent dashboard ne change pas (affiche toujours les stats)
- Les données existantes (XP, level, achievements) sont conservées et migrées
- Nouvelles tables ajoutées sans casser l'existant
- Ajout de `stars`, `crystals`, `streakFreezes` au modèle Child ou via ChildCurrency

---

## 5. Premiers chapitres (contenu de démarrage)

Pour le lancement, on pré-génère 3 chapitres de base par groupe d'âge (9 total) pour avoir du contenu immédiat. Les chapitres suivants seront générés dynamiquement par Claude AI quand l'enfant progresse.

### Chapitres de lancement

**Maternelle :**
1. "La Clairière des Animaux" (lecture + émotions)
2. "Le Jardin des Chiffres" (maths)
3. "L'Atelier des Couleurs" (créativité + mémoire)

**Primaire :**
1. "La Forêt des Premiers Mots" (lecture)
2. "Les Mines de Cristal" (maths + logique)
3. "Le Château des Émotions" (émotionnel + social)

**Collège-lycée :**
1. "Les Archives Perdues" (lecture + rédaction)
2. "La Tour de l'Alchimiste" (maths + sciences)
3. "Le Tribunal des Ombres" (émotionnel + choix moraux)

---

## 6. Hors scope (pour plus tard)

- Classements / ligues compétitives
- Événements saisonniers limités dans le temps
- Mode multijoueur / coopératif
- Notifications push / rappels
- Intégration récompenses parentales (parents offrent des cristaux)
- Mode hors-ligne
