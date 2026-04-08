import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SHOP_ITEMS = [
  { name: "Cape du Voyageur", type: "avatar_skin", description: "Une cape bleue qui flotte au vent", cost: 50, currency: "stars", rarity: "common" },
  { name: "Chapeau d'Explorateur", type: "avatar_skin", description: "Un chapeau d'aventurier courageux", cost: 30, currency: "stars", rarity: "common" },
  { name: "Bottes Magiques", type: "avatar_skin", description: "Des bottes qui brillent dans le noir", cost: 40, currency: "stars", rarity: "common" },
  { name: "Armure de Cristal", type: "avatar_skin", description: "Une armure scintillante forgée par les nains", cost: 100, currency: "stars", rarity: "rare" },
  { name: "Ailes de Lumière", type: "avatar_skin", description: "Des ailes dorées qui apparaissent dans ton dos", cost: 8, currency: "crystals", rarity: "rare" },
  { name: "Couronne du Sage", type: "avatar_skin", description: "La couronne portée par les plus grands héros", cost: 20, currency: "crystals", rarity: "epic" },
  { name: "Lumo Flamme", type: "lumo_skin", description: "Lumo brille comme une flamme orange", cost: 60, currency: "stars", rarity: "common" },
  { name: "Lumo Glacé", type: "lumo_skin", description: "Lumo scintille de givre bleu", cost: 80, currency: "stars", rarity: "rare" },
  { name: "Lumo Arc-en-ciel", type: "lumo_skin", description: "Lumo change de couleur sans cesse", cost: 15, currency: "crystals", rarity: "epic" },
  { name: "Cadre Étoilé", type: "frame", description: "Un cadre avec des étoiles filantes", cost: 25, currency: "stars", rarity: "common" },
  { name: "Cadre Dragon", type: "frame", description: "Un cadre gardé par un dragon doré", cost: 10, currency: "crystals", rarity: "rare" },
  { name: "Apprenti Aventurier", type: "title", description: "Titre affiché sur ton profil", cost: 15, currency: "stars", rarity: "common" },
  { name: "Maître des Mots", type: "title", description: "Pour ceux qui dominent la lecture", cost: 40, currency: "stars", rarity: "common" },
  { name: "Dragon Lecteur", type: "title", description: "Titre légendaire pour les grands lecteurs", cost: 25, currency: "crystals", rarity: "legendary" },
  { name: "Génie des Nombres", type: "title", description: "Pour les mathématiciens en herbe", cost: 40, currency: "stars", rarity: "common" },
  { name: "Traînée d'Étoiles", type: "effect", description: "Des étoiles suivent ton avatar", cost: 12, currency: "crystals", rarity: "epic" },
  { name: "Aura Mystique", type: "effect", description: "Une lueur violette entoure ton avatar", cost: 18, currency: "crystals", rarity: "legendary" },
];

const STARTER_CHAPTERS = [
  {
    title: "La Clairière des Animaux", description: "Un endroit magique où les animaux parlent et apprennent ensemble", theme: "nature", ageGroup: "maternelle", difficulty: 1, order: 1,
    mapPosition: { x: 20, y: 60 }, mapRegion: "forest",
    steps: [
      { order: 1, title: "Le Réveil de la Forêt", narrativeContext: "Tu te réveilles dans une clairière enchantée. Les animaux t'accueillent avec joie !", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Les Fruits du Grand Arbre", narrativeContext: "Le Grand Arbre a besoin d'aide pour compter ses fruits magiques.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "L'Oiseau Triste", narrativeContext: "Un petit oiseau bleu est tout triste. Comment peux-tu l'aider ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Loup qui Avait Peur", narrativeContext: "Le loup a peur du tonnerre ! Aide-le à se souvenir des choses qui le rassurent.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
    ],
    bossData: { name: "L'Ombre de la Clairière", description: "Une ombre mystérieuse recouvre la clairière !", exerciseTypes: ["reading", "math", "emotional"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Jardin des Chiffres", description: "Un jardin où les fleurs poussent quand tu comptes bien", theme: "garden", ageGroup: "maternelle", difficulty: 2, order: 2,
    mapPosition: { x: 45, y: 40 }, mapRegion: "garden",
    steps: [
      { order: 1, title: "Les Graines Magiques", narrativeContext: "Le jardinier te donne des graines avec des chiffres !", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Conte de la Rose", narrativeContext: "La rose connaît une histoire merveilleuse.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Couleurs des Émotions", narrativeContext: "Chaque fleur a une couleur qui représente une émotion.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Labyrinthe Fleuri", narrativeContext: "Traverse le labyrinthe en résolvant les problèmes.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "La Mauvaise Herbe Géante", description: "Une énorme mauvaise herbe envahit le jardin !", exerciseTypes: ["math", "reading"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "L'Atelier des Couleurs", description: "Un atelier magique où créativité et mémoire ouvrent toutes les portes", theme: "atelier", ageGroup: "maternelle", difficulty: 3, order: 3,
    mapPosition: { x: 70, y: 55 }, mapRegion: "village",
    steps: [
      { order: 1, title: "Le Tableau Vivant", narrativeContext: "Mémorise les couleurs du tableau avant qu'elles ne s'effacent !", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "L'Histoire du Pinceau Perdu", narrativeContext: "Lis les indices pour retrouver le pinceau magique.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Amis de l'Atelier", narrativeContext: "Les personnages des tableaux ont besoin de ton aide.", exerciseType: "social", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Chef-d'Oeuvre Final", narrativeContext: "Crée le plus beau tableau !", exerciseType: "creativity", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Voleur de Couleurs", description: "Quelqu'un a volé toutes les couleurs !", exerciseTypes: ["memory", "creativity", "reading"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "La Forêt des Premiers Mots", description: "Une forêt ancestrale où chaque arbre raconte une histoire", theme: "forest", ageGroup: "primaire", difficulty: 1, order: 1,
    mapPosition: { x: 15, y: 65 }, mapRegion: "forest",
    steps: [
      { order: 1, title: "Le Grimoire du Forestier", narrativeContext: "Le forestier te confie un grimoire couvert de mousse.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Pont des Calculs", narrativeContext: "Le pont est brisé ! Résous les calculs pour le reconstruire.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Gardien Triste", narrativeContext: "Le Gardien est triste et perdu. Que fais-tu ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "La Carte aux Souvenirs", narrativeContext: "Retiens les symboles qui clignotent sur la carte magique.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 5, title: "L'Assemblée des Animaux", narrativeContext: "Les animaux se disputent. Aide-les à trouver un accord.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "L'Ombre du Silence", description: "Une ombre fait taire tous les sons !", exerciseTypes: ["reading", "math", "emotional"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Les Mines de Cristal", description: "Des mines profondes où la logique est la seule lumière", theme: "mines", ageGroup: "primaire", difficulty: 2, order: 2,
    mapPosition: { x: 40, y: 35 }, mapRegion: "mountains",
    steps: [
      { order: 1, title: "L'Entrée Codée", narrativeContext: "La porte est verrouillée par un code mathématique.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Mineur Bavard", narrativeContext: "Écoute bien le récit du mineur.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Cristaux Jumeaux", narrativeContext: "Mémorise les vrais cristaux pour avancer.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "La Salle des Équations", narrativeContext: "Chaque solution ouvre un nouveau passage.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Choix du Tunnel", narrativeContext: "Seule la logique peut t'aider à choisir.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Golem de Pierre", description: "Un golem garde le Cristal Suprême !", exerciseTypes: ["math", "memory"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Château des Émotions", description: "Un château où chaque pièce reflète un sentiment", theme: "castle", ageGroup: "primaire", difficulty: 3, order: 3,
    mapPosition: { x: 65, y: 50 }, mapRegion: "castle",
    steps: [
      { order: 1, title: "La Salle de la Joie", narrativeContext: "Lis l'inscription dorée pour entrer.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Couloir de la Colère", narrativeContext: "Comment calmer le chevalier furieux ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "La Bibliothèque Secrète", narrativeContext: "Résous les énigmes pour ouvrir les livres.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Bal des Ombres", narrativeContext: "Identifie les émotions des ombres.", exerciseType: "emotional", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Conseil Royal", narrativeContext: "Aide le roi à prendre une décision juste.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Miroir des Illusions", description: "Affronte tes peurs dans le miroir !", exerciseTypes: ["emotional", "reading", "social"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Les Archives Perdues", description: "Des archives contenant les savoirs oubliés", theme: "archives", ageGroup: "college-lycee", difficulty: 1, order: 1,
    mapPosition: { x: 20, y: 60 }, mapRegion: "ruins",
    steps: [
      { order: 1, title: "Le Manuscrit Crypté", narrativeContext: "Déchiffre le manuscrit ancien.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "L'Équation du Temps", narrativeContext: "Répare l'horloge brisée avec les équations.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Journal de l'Archiviste", narrativeContext: "Un dilemme moral non résolu.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Les Formules Oubliées", narrativeContext: "Reconstitue les formules effacées.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Débat des Philosophes", narrativeContext: "Analyse les arguments des philosophes.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Gardien du Savoir", description: "L'épreuve ultime des Archives.", exerciseTypes: ["reading", "math", "emotional"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "La Tour de l'Alchimiste", description: "Une tour où science et magie ne font qu'un", theme: "tower", ageGroup: "college-lycee", difficulty: 2, order: 2,
    mapPosition: { x: 50, y: 30 }, mapRegion: "tower",
    steps: [
      { order: 1, title: "Le Laboratoire Abandonné", narrativeContext: "Termine le travail de l'alchimiste.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Grimoire Interdit", narrativeContext: "Analyse les textes sur la transmutation.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "L'Épreuve de Mémoire", narrativeContext: "Mémorise la séquence de symboles.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Dilemme Éthique", narrativeContext: "Des expériences douteuses. Que fais-tu ?", exerciseType: "emotional", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "L'Ascension Finale", narrativeContext: "Résous les équations pour atteindre le sommet.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "L'Homonculus", description: "La création de l'alchimiste prend vie !", exerciseTypes: ["math", "reading", "emotional"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Tribunal des Ombres", description: "Où vérité et justice sont mises à l'épreuve", theme: "tribunal", ageGroup: "college-lycee", difficulty: 3, order: 3,
    mapPosition: { x: 75, y: 50 }, mapRegion: "city",
    steps: [
      { order: 1, title: "L'Accusation", narrativeContext: "Lis le dossier d'accusation.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Les Preuves Numériques", narrativeContext: "Analyse les statistiques.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Témoin Émotif", narrativeContext: "Aide le témoin bouleversé.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Plaidoyer", narrativeContext: "Construis un argument convaincant.", exerciseType: "reading", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Verdict", narrativeContext: "Un nouveau témoin apparaît.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Juge Suprême", description: "L'épreuve ultime de justice.", exerciseTypes: ["reading", "math", "emotional", "social"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
];

export async function POST() {
  try {
    let shopCount = 0;
    for (const item of SHOP_ITEMS) {
      const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.shopItem.upsert({
        where: { id },
        update: item,
        create: { id, ...item },
      });
      shopCount++;
    }

    let chapterCount = 0;
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
      chapterCount++;
    }

    return NextResponse.json({ success: true, shopItems: shopCount, chapters: chapterCount });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
