import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      { order: 1, title: "Le Réveil de la Forêt", narrativeContext: "Tu te réveilles dans une clairière enchantée. Les animaux t'accueillent avec joie ! Un petit renard te demande de l'aider à lire le panneau magique.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Les Fruits du Grand Arbre", narrativeContext: "Le Grand Arbre a besoin d'aide pour compter ses fruits magiques. Chaque fruit a un nombre écrit dessus.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "L'Oiseau Triste", narrativeContext: "Un petit oiseau bleu est tout triste sur une branche. Il a perdu ses amis. Comment peux-tu l'aider à se sentir mieux ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Loup qui Avait Peur", narrativeContext: "Le loup n'est pas méchant — il a peur du tonnerre ! Aide-le à se souvenir des choses qui le rassurent.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
    ],
    bossData: { name: "L'Ombre de la Clairière", description: "Une ombre mystérieuse recouvre la clairière !", exerciseTypes: ["reading", "math", "emotional"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Jardin des Chiffres", description: "Un jardin où les fleurs poussent quand tu comptes bien", theme: "garden", ageGroup: "maternelle", difficulty: 2, order: 2,
    mapPosition: { x: 45, y: 40 }, mapRegion: "garden",
    steps: [
      { order: 1, title: "Les Graines Magiques", narrativeContext: "Le jardinier te donne des graines, mais chaque graine a un chiffre ! Plante-les dans le bon ordre.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Conte de la Rose", narrativeContext: "La plus belle rose du jardin connaît une histoire merveilleuse. Écoute-la bien et réponds à ses questions.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Couleurs des Émotions", narrativeContext: "Chaque fleur a une couleur qui représente une émotion. Aide les fleurs à trouver leur couleur.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Labyrinthe Fleuri", narrativeContext: "Pour atteindre la Fleur d'Or, traverse le labyrinthe en résolvant les problèmes.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "La Mauvaise Herbe Géante", description: "Une énorme mauvaise herbe envahit le jardin !", exerciseTypes: ["math", "reading"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "L'Atelier des Couleurs", description: "Un atelier magique où créativité et mémoire ouvrent toutes les portes", theme: "atelier", ageGroup: "maternelle", difficulty: 3, order: 3,
    mapPosition: { x: 70, y: 55 }, mapRegion: "village",
    steps: [
      { order: 1, title: "Le Tableau Vivant", narrativeContext: "Le peintre magique a besoin que tu mémorises les couleurs de son tableau avant qu'elles ne s'effacent !", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "L'Histoire du Pinceau Perdu", narrativeContext: "Le pinceau magique a disparu ! Lis les indices laissés par les tableaux pour le retrouver.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Amis de l'Atelier", narrativeContext: "Les personnages des tableaux prennent vie ! Ils ont besoin de ton aide pour résoudre un conflit.", exerciseType: "social", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Chef-d'Oeuvre Final", narrativeContext: "Crée le plus beau tableau en combinant tout ce que tu as appris.", exerciseType: "creativity", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Voleur de Couleurs", description: "Quelqu'un a volé toutes les couleurs de l'atelier !", exerciseTypes: ["memory", "creativity", "reading"], questionCount: 5, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "La Forêt des Premiers Mots", description: "Une forêt ancestrale où chaque arbre raconte une histoire", theme: "forest", ageGroup: "primaire", difficulty: 1, order: 1,
    mapPosition: { x: 15, y: 65 }, mapRegion: "forest",
    steps: [
      { order: 1, title: "Le Grimoire du Forestier", narrativeContext: "Le vieux forestier te confie un grimoire couvert de mousse. Lis le passage et prouve-lui que tu es digne.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Pont des Calculs", narrativeContext: "Le pont enjambant la Rivière d'Argent est brisé ! Résous les calculs pour reconstruire le passage.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Gardien Triste", narrativeContext: "Le Gardien de la Forêt est assis seul. Il semble triste et perdu. Que fais-tu pour l'aider ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "La Carte aux Souvenirs", narrativeContext: "Une carte magique ne se révèle que si tu retiens les symboles qui clignotent.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 5, title: "L'Assemblée des Animaux", narrativeContext: "Les animaux se disputent sur qui gardera la clé du portail. Aide-les à trouver un accord.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "L'Ombre du Silence", description: "Une ombre immense recouvre la forêt et fait taire tous les sons.", exerciseTypes: ["reading", "math", "emotional"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Les Mines de Cristal", description: "Des mines profondes où la logique est la seule lumière", theme: "mines", ageGroup: "primaire", difficulty: 2, order: 2,
    mapPosition: { x: 40, y: 35 }, mapRegion: "mountains",
    steps: [
      { order: 1, title: "L'Entrée Codée", narrativeContext: "La porte des mines est verrouillée par un code mathématique.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Mineur Bavard", narrativeContext: "Un vieux mineur raconte l'histoire des mines. Écoute bien son récit.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Les Cristaux Jumeaux", narrativeContext: "Des cristaux identiques brillent sur les murs. Mémorise les vrais pour avancer.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "La Salle des Équations", narrativeContext: "Une immense salle remplie d'équations lumineuses. Chaque solution ouvre un passage.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Choix du Tunnel", narrativeContext: "Trois tunnels s'ouvrent devant toi. Seule la logique peut t'aider à choisir.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Golem de Pierre", description: "Un golem de pierre garde le Cristal Suprême !", exerciseTypes: ["math", "memory"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Château des Émotions", description: "Un château enchanté où chaque pièce reflète un sentiment", theme: "castle", ageGroup: "primaire", difficulty: 3, order: 3,
    mapPosition: { x: 65, y: 50 }, mapRegion: "castle",
    steps: [
      { order: 1, title: "La Salle de la Joie", narrativeContext: "La première salle brille de mille couleurs ! Lis l'inscription dorée pour entrer.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Couloir de la Colère", narrativeContext: "Un chevalier furieux bloque le passage. Comment calmer sa colère sans combattre ?", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "La Bibliothèque Secrète", narrativeContext: "Résous les énigmes logiques pour ouvrir les livres scellés.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Bal des Ombres", narrativeContext: "Des ombres dansent. Chacune représente une émotion. Identifie-les.", exerciseType: "emotional", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Conseil Royal", narrativeContext: "Deux seigneurs se disputent. Écoute leurs arguments et aide le roi.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Miroir des Illusions", description: "Un miroir géant reflète tes peurs. Affronte chaque illusion avec sagesse !", exerciseTypes: ["emotional", "reading", "social"], questionCount: 6, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Les Archives Perdues", description: "Des archives souterraines contenant les savoirs oubliés", theme: "archives", ageGroup: "college-lycee", difficulty: 1, order: 1,
    mapPosition: { x: 20, y: 60 }, mapRegion: "ruins",
    steps: [
      { order: 1, title: "Le Manuscrit Crypté", narrativeContext: "Un manuscrit ancien en langage codé. Déchiffre le texte et comprends son message.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "L'Équation du Temps", narrativeContext: "Une horloge brisée ne peut être réparée que par celui qui maîtrise les équations temporelles.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Journal de l'Archiviste", narrativeContext: "Le journal intime d'un archiviste disparu révèle un dilemme moral non résolu.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Les Formules Oubliées", narrativeContext: "Des formules effacées par le temps. Reconstitue-les pour ouvrir la chambre forte.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Débat des Philosophes", narrativeContext: "Les statues des philosophes s'animent et débattent. Analyse leurs arguments.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Gardien du Savoir", description: "Le Gardien éternel des Archives te met à l'épreuve.", exerciseTypes: ["reading", "math", "emotional"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "La Tour de l'Alchimiste", description: "Une tour mystérieuse où science et magie ne font qu'un", theme: "tower", ageGroup: "college-lycee", difficulty: 2, order: 2,
    mapPosition: { x: 50, y: 30 }, mapRegion: "tower",
    steps: [
      { order: 1, title: "Le Laboratoire Abandonné", narrativeContext: "Des fioles et des équations couvrent les murs. Termine le travail de l'alchimiste.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Le Grimoire Interdit", narrativeContext: "Un grimoire contient des textes complexes sur la transmutation. Analyse les passages.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "L'Épreuve de Mémoire", narrativeContext: "La recette de la Pierre Philosophale est cachée dans une séquence de symboles.", exerciseType: "memory", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Dilemme Éthique", narrativeContext: "L'alchimiste utilisait ses connaissances pour des expériences douteuses. Que fais-tu ?", exerciseType: "emotional", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "L'Ascension Finale", narrativeContext: "Le dernier étage est rempli d'équations complexes. Chaque solution te rapproche du sommet.", exerciseType: "math", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "L'Homonculus", description: "La création ratée de l'alchimiste prend vie et te pose des énigmes !", exerciseTypes: ["math", "reading", "emotional"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
  {
    title: "Le Tribunal des Ombres", description: "Un lieu où vérité et justice sont mises à l'épreuve", theme: "tribunal", ageGroup: "college-lycee", difficulty: 3, order: 3,
    mapPosition: { x: 75, y: 50 }, mapRegion: "city",
    steps: [
      { order: 1, title: "L'Accusation", narrativeContext: "On t'accuse à tort. Lis le dossier d'accusation pour préparer ta défense.", exerciseType: "reading", rewards: { stars: 10, xp: 30 } },
      { order: 2, title: "Les Preuves Numériques", narrativeContext: "Les preuves contiennent des données chiffrées. Analyse les statistiques.", exerciseType: "math", rewards: { stars: 10, xp: 30 } },
      { order: 3, title: "Le Témoin Émotif", narrativeContext: "Un témoin est bouleversé. Aide-le à gérer ses émotions pour témoigner.", exerciseType: "emotional", rewards: { stars: 10, xp: 30 } },
      { order: 4, title: "Le Plaidoyer", narrativeContext: "Construis un argument logique et convaincant à partir des éléments récoltés.", exerciseType: "reading", rewards: { stars: 15, xp: 40 } },
      { order: 5, title: "Le Verdict", narrativeContext: "Un nouveau témoin apparaît. Analyse ses propos et décide s'il dit la vérité.", exerciseType: "social", rewards: { stars: 15, xp: 40 } },
    ],
    bossData: { name: "Le Juge Suprême", description: "Morale, logique et empathie seront nécessaires pour obtenir justice.", exerciseTypes: ["reading", "math", "emotional", "social"], questionCount: 7, rewards: { crystals: 3, xp: 100, stars: 30 } },
  },
];

async function main() {
  console.log("Seeding shop items...");
  for (const item of SHOP_ITEMS) {
    await prisma.shopItem.upsert({
      where: { id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: item,
      create: { id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), ...item },
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
