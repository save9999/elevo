// Contenu pré-écrit pour chaque type d'exercice, par groupe d'âge
// Utilisé quand l'API Claude n'est pas disponible

interface FallbackReading {
  narrative: string;
  story: string;
  questions: { q: string; options: string[]; correct: number; explanation: string }[];
  lumoComment: string;
}

interface FallbackMath {
  narrative: string;
  problems: { q: string; answer: string; hint: string; explanation: string }[];
  lumoComment: string;
}

interface FallbackEmotional {
  narrative: string;
  scenarios: { situation: string; q: string; options: string[]; best: number; explanation: string; advice: string }[];
  lumoComment: string;
}

interface FallbackMemory {
  narrative: string;
  items: string[];
  questions: { q: string; options: string[]; correct: number }[];
  lumoComment: string;
}

interface FallbackSocial {
  narrative: string;
  scenarios: { situation: string; q: string; options: string[]; best: number; explanation: string; advice: string }[];
  lumoComment: string;
}

type FallbackData = FallbackReading | FallbackMath | FallbackEmotional | FallbackMemory | FallbackSocial;

// ─── READING ───────────────────────────────────

const READING_MATERNELLE: FallbackReading[] = [
  {
    narrative: "NAME et Lumo découvrent un grand livre posé sur une souche d'arbre. Lumo s'illumine de joie : « Regarde ! C'est le Livre des Animaux Magiques ! »",
    story: "Il était une fois, dans une forêt enchantée, un petit lapin blanc nommé Flocon. Flocon adorait se promener entre les grands arbres. Un jour, il trouva une carotte dorée qui brillait comme une étoile. « Oh ! » dit Flocon, « c'est la carotte magique ! » Il la mangea et soudain, il pouvait parler avec tous les animaux de la forêt. L'oiseau bleu lui dit : « Bienvenue parmi nous, Flocon ! » Le renard roux ajouta : « Maintenant tu es notre ami pour toujours. »",
    questions: [
      { q: "Comment s'appelle le lapin ?", options: ["Neige", "Flocon", "Caramel", "Nuage"], correct: 1, explanation: "Le lapin s'appelle Flocon !" },
      { q: "Qu'a trouvé Flocon ?", options: ["Une fleur", "Un chapeau", "Une carotte dorée", "Un caillou"], correct: 2, explanation: "Flocon a trouvé une carotte dorée magique." },
      { q: "Que peut faire Flocon après avoir mangé la carotte ?", options: ["Voler", "Parler avec les animaux", "Devenir invisible", "Courir très vite"], correct: 1, explanation: "La carotte magique lui permet de parler avec tous les animaux." }
    ],
    lumoComment: "Quelle belle histoire ! Tu lis super bien ! 🌟"
  },
  {
    narrative: "Lumo pointe une inscription gravée sur un rocher moussu. « NAME, il y a un message secret ici ! Aide-moi à le lire ! »",
    story: "Dans un jardin extraordinaire, les fleurs savaient chanter. La rose chantait le matin, la tulipe chantait le soir. Un papillon nommé Léo écoutait leurs chansons tous les jours. Un matin, les fleurs étaient tristes — elles avaient perdu leur voix ! Léo décida de les aider. Il vola jusqu'à la Montagne des Échos et rapporta un cristal magique. Quand il posa le cristal au centre du jardin, toutes les fleurs se remirent à chanter, plus fort qu'avant !",
    questions: [
      { q: "Qui écoute les fleurs chanter ?", options: ["Un oiseau", "Un papillon nommé Léo", "Une abeille", "Un escargot"], correct: 1, explanation: "C'est Léo le papillon qui écoute les fleurs." },
      { q: "Pourquoi les fleurs sont tristes ?", options: ["Il pleut", "Elles ont perdu leur voix", "Léo est parti", "Le jardin est sec"], correct: 1, explanation: "Les fleurs ont perdu leur voix et ne peuvent plus chanter." },
      { q: "Que rapporte Léo de la montagne ?", options: ["De l'eau", "Un cristal magique", "Une graine", "Du miel"], correct: 1, explanation: "Léo rapporte un cristal magique qui redonne la voix aux fleurs." }
    ],
    lumoComment: "Bravo ! Tu comprends très bien les histoires ! 🦋"
  }
];

const READING_PRIMAIRE: FallbackReading[] = [
  {
    narrative: "NAME et Lumo pénètrent dans une bibliothèque souterraine. Les livres flottent dans les airs et Lumo murmure : « Celui-ci brille... il veut être lu ! »",
    story: "Le vieux forestier Aldric vivait seul dans sa cabane depuis trente ans. Chaque matin, il parcourait les sentiers et notait dans son grimoire les changements de la forêt : les traces d'un cerf près du ruisseau, le nid d'un pic-vert dans le chêne creux, les champignons après la pluie.\n\nUn jour d'automne, il découvrit quelque chose d'inquiétant : les arbres du côté nord perdaient leurs feuilles bien trop tôt, et l'eau du ruisseau avait changé de couleur. Aldric comprit qu'un barrage de castors en amont avait dévié le cours d'eau. Il fallait agir vite pour sauver les arbres assoiffés.\n\nAldric marcha pendant deux heures jusqu'au barrage. Plutôt que de le détruire, il creusa un canal secondaire qui permettait à l'eau de couler vers les deux côtés. Les castors gardèrent leur barrage, et les arbres du nord furent sauvés.",
    questions: [
      { q: "Depuis combien de temps Aldric vit-il dans la forêt ?", options: ["Dix ans", "Vingt ans", "Trente ans", "Cinquante ans"], correct: 2, explanation: "Le texte dit qu'Aldric vivait seul dans sa cabane depuis trente ans." },
      { q: "Quel problème Aldric a-t-il découvert ?", options: ["Un incendie de forêt", "Les arbres du nord perdaient leurs feuilles trop tôt", "Les champignons étaient toxiques", "Les sentiers étaient bloqués"], correct: 1, explanation: "Les arbres du côté nord perdaient leurs feuilles trop tôt à cause du manque d'eau." },
      { q: "Comment Aldric a-t-il résolu le problème ?", options: ["Il a détruit le barrage des castors", "Il a planté de nouveaux arbres", "Il a creusé un canal secondaire", "Il a demandé de l'aide au village"], correct: 2, explanation: "Il a creusé un canal pour que l'eau coule des deux côtés, sans détruire le barrage." }
    ],
    lumoComment: "Excellente lecture ! Aldric est malin, tu ne trouves pas ? 📚"
  }
];

const READING_COLLEGIEN: FallbackReading[] = [
  {
    narrative: "NAME et Lumo découvrent un manuscrit ancien dans les archives. Les pages jaunies craquent sous leurs doigts. « Ce texte date de plusieurs siècles, » murmure Lumo.",
    story: "Le paradoxe de Thésée interroge les philosophes depuis l'Antiquité. Selon la légende, le navire de Thésée était conservé par les Athéniens. Au fil du temps, chaque planche pourrie était remplacée par une planche neuve. La question est la suivante : une fois toutes les planches remplacées, est-ce toujours le même navire ?\n\nCertains philosophes, comme Héraclite, diraient que oui — l'identité d'un objet réside dans sa forme et sa fonction, pas dans sa matière. D'autres, plus matérialistes, argumenteraient que non — si aucune partie originale ne subsiste, c'est un nouvel objet.\n\nCe paradoxe s'applique aussi aux êtres vivants : nos cellules se renouvellent constamment. En sept ans, la quasi-totalité de nos cellules a été remplacée. Sommes-nous alors la même personne qu'il y a sept ans ? La réponse dépend de ce qu'on considère comme fondamental dans l'identité : la continuité physique ou la continuité de la conscience et de la mémoire.",
    questions: [
      { q: "Quel est le paradoxe de Thésée ?", options: ["Un navire qui voyage dans le temps", "Un navire dont toutes les planches sont remplacées — est-ce le même ?", "Un navire qui se construit tout seul", "Un navire qui ne vieillit jamais"], correct: 1, explanation: "Le paradoxe questionne si un objet dont toutes les parties ont été remplacées reste le même." },
      { q: "Quelle position défendrait Héraclite ?", options: ["Ce n'est plus le même navire", "L'identité réside dans la forme et la fonction, pas la matière", "Les objets n'ont pas d'identité", "Seule la matière originale compte"], correct: 1, explanation: "Héraclite considère que l'identité est dans la forme et la fonction." },
      { q: "Pourquoi le texte mentionne-t-il le renouvellement cellulaire ?", options: ["Pour parler de biologie", "Pour montrer que le paradoxe s'applique aussi aux êtres humains", "Pour prouver que nous vieillissons", "Pour comparer les humains aux navires en termes de taille"], correct: 1, explanation: "Le renouvellement cellulaire étend le paradoxe à l'identité personnelle humaine." }
    ],
    lumoComment: "Question fascinante ! La philosophie, c'est l'art de penser plus profondément. 🧠"
  }
];

// ─── MATH ──────────────────────────────────────

const MATH_MATERNELLE: FallbackMath[] = [
  {
    narrative: "NAME et Lumo arrivent devant le Grand Arbre aux fruits magiques. Lumo s'exclame : « Pour cueillir les fruits, il faut résoudre les énigmes des branches ! »",
    problems: [
      { q: "Le Grand Arbre a 3 pommes rouges et 2 pommes vertes. Combien de pommes en tout ?", answer: "5", hint: "Compte les rouges, puis ajoute les vertes !", explanation: "3 + 2 = 5 pommes en tout." },
      { q: "Lumo a trouvé 4 étoiles. Il en donne 1 à NAME. Combien d'étoiles lui reste-t-il ?", answer: "3", hint: "Il en avait 4 et en a donné 1...", explanation: "4 - 1 = 3 étoiles." },
      { q: "Il y a 2 oiseaux sur une branche. 2 autres arrivent. Combien d'oiseaux maintenant ?", answer: "4", hint: "2 oiseaux + 2 oiseaux qui arrivent...", explanation: "2 + 2 = 4 oiseaux sur la branche." },
      { q: "NAME a 6 billes. Il en perd 2. Combien de billes a-t-il ?", answer: "4", hint: "Tu en avais 6, et tu en perds 2...", explanation: "6 - 2 = 4 billes." },
      { q: "La fée a 1 baguette dans chaque main. Combien de baguettes ?", answer: "2", hint: "Elle a 2 mains, et 1 baguette dans chaque...", explanation: "1 + 1 = 2 baguettes magiques !" }
    ],
    lumoComment: "Tu es un vrai champion des chiffres ! 🔢✨"
  }
];

const MATH_PRIMAIRE: FallbackMath[] = [
  {
    narrative: "Le pont enjambant la Rivière d'Argent est brisé ! NAME et Lumo doivent résoudre les calculs gravés sur chaque planche pour le reconstruire.",
    problems: [
      { q: "La première planche porte l'inscription : 47 + 35 = ?", answer: "82", hint: "Additionne les unités d'abord : 7 + 5 = 12, retiens 1...", explanation: "47 + 35 = 82. La planche se remet en place !" },
      { q: "Deuxième planche : Un marchand avait 156 pièces d'or. Il en dépense 78. Combien lui reste-t-il ?", answer: "78", hint: "156 moins 78... commence par les unités.", explanation: "156 - 78 = 78 pièces d'or." },
      { q: "Troisième planche : 6 × 7 = ?", answer: "42", hint: "6 fois 7... pense à la table de 6 !", explanation: "6 × 7 = 42. Bravo !" },
      { q: "Quatrième planche : Si 4 chevaliers ont chacun 8 épées, combien d'épées en tout ?", answer: "32", hint: "4 chevaliers × 8 épées chacun...", explanation: "4 × 8 = 32 épées au total." },
      { q: "Dernière planche : 96 ÷ 8 = ?", answer: "12", hint: "Combien de fois 8 entre dans 96 ?", explanation: "96 ÷ 8 = 12. Le pont est reconstruit !" }
    ],
    lumoComment: "Le pont est réparé grâce à toi ! Tu es un génie des maths ! 🌉"
  }
];

const MATH_COLLEGIEN: FallbackMath[] = [
  {
    narrative: "NAME et Lumo sont face à une porte scellée par des équations. Chaque bonne réponse fait briller un des cinq sceaux qui la verrouillent.",
    problems: [
      { q: "Premier sceau : Résous l'équation 3x + 7 = 22", answer: "5", hint: "Isole x : 3x = 22 - 7, puis divise...", explanation: "3x = 15, donc x = 5." },
      { q: "Deuxième sceau : Un rectangle a un périmètre de 54 cm. Sa longueur est le double de sa largeur. Quelle est sa largeur ?", answer: "9", hint: "Si la largeur = l, alors la longueur = 2l. Le périmètre = 2(l + 2l) = 54", explanation: "6l = 54, donc l = 9 cm. La longueur = 18 cm." },
      { q: "Troisième sceau : Quel est 15% de 240 ?", answer: "36", hint: "15% = 15/100. Multiplie 240 par 0,15...", explanation: "240 × 0,15 = 36." },
      { q: "Quatrième sceau : (-4) × (-6) + 3 = ?", answer: "27", hint: "Un négatif fois un négatif donne un positif...", explanation: "(-4) × (-6) = 24, et 24 + 3 = 27." },
      { q: "Dernier sceau : La racine carrée de 144 ?", answer: "12", hint: "Quel nombre multiplié par lui-même donne 144 ?", explanation: "12 × 12 = 144, donc √144 = 12." }
    ],
    lumoComment: "Tous les sceaux brillent ! Tu as un esprit mathématique remarquable ! 🔓"
  }
];

// ─── EMOTIONAL ─────────────────────────────────

const EMOTIONAL_ALL: FallbackEmotional[] = [
  {
    narrative: "NAME et Lumo rencontrent un personnage assis seul au bord du chemin. Il a l'air bouleversé. Lumo chuchote : « Il a besoin d'aide... que ferais-tu ? »",
    scenarios: [
      { situation: "Un ami te dit qu'il se sent seul et que personne ne veut jouer avec lui à la récréation.", q: "Que fais-tu ?", options: ["Tu lui dis que c'est pas grave", "Tu l'invites à jouer avec toi et tes amis", "Tu ne dis rien", "Tu lui dis de chercher d'autres amis"], best: 1, explanation: "L'inviter à jouer montre de l'empathie et résout concrètement son problème.", advice: "Lumo dit : Quand quelqu'un se sent seul, un simple geste d'amitié peut tout changer ! 💜" },
      { situation: "Tu as très envie d'un jouet, mais tes parents disent non. Tu te sens frustré et en colère.", q: "Que fais-tu ?", options: ["Tu cries et tu pleures", "Tu boudes dans ta chambre toute la journée", "Tu respires calmement et tu demandes pourquoi", "Tu prends le jouet quand même"], best: 2, explanation: "Respirer et demander une explication montre de la maturité émotionnelle.", advice: "Lumo dit : La colère, c'est normal ! Mais respirer d'abord aide à mieux réfléchir. 🌬️" },
      { situation: "Tu as cassé sans le vouloir le dessin de ton camarade. Il est triste et en colère.", q: "Que fais-tu ?", options: ["Tu fais semblant de rien", "Tu dis que c'est pas ta faute", "Tu t'excuses sincèrement et tu proposes de l'aider à en refaire un", "Tu rigoles"], best: 2, explanation: "S'excuser et proposer de réparer montre du courage et de la responsabilité.", advice: "Lumo dit : Tout le monde fait des erreurs. Ce qui compte, c'est comment on les répare ! 🎨" }
    ],
    lumoComment: "Tu as un grand cœur ! Les émotions, c'est ta force ! 💪"
  }
];

// ─── MEMORY ────────────────────────────────────

const MEMORY_ALL: FallbackMemory[] = [
  {
    narrative: "NAME et Lumo entrent dans une salle remplie d'objets magiques. Lumo s'exclame : « Regarde bien ces objets ! La porte ne s'ouvrira que si tu te souviens de leur ordre ! »\n\nSur la table, tu vois dans l'ordre : une CLEF dorée, un CRISTAL bleu, une PLUME rouge, un MIROIR ancien, un SABLIER vert, et une ÉTOILE argentée.\n\nMémorise bien cet ordre !",
    items: ["Clef dorée", "Cristal bleu", "Plume rouge", "Miroir ancien", "Sablier vert", "Étoile argentée"],
    questions: [
      { q: "Quel était le premier objet sur la table ?", options: ["Cristal bleu", "Clef dorée", "Plume rouge", "Étoile argentée"], correct: 1 },
      { q: "Quel objet venait juste après le Cristal bleu ?", options: ["Miroir ancien", "Sablier vert", "Plume rouge", "Clef dorée"], correct: 2 },
      { q: "Quel était le dernier objet ?", options: ["Sablier vert", "Miroir ancien", "Plume rouge", "Étoile argentée"], correct: 3 }
    ],
    lumoComment: "Quelle mémoire incroyable ! Tu es un vrai détective ! 🔍"
  }
];

// ─── SOCIAL ────────────────────────────────────

const SOCIAL_ALL: FallbackSocial[] = [
  {
    narrative: "NAME et Lumo arrivent dans un village où deux groupes se disputent. Lumo observe : « Ils n'arrivent pas à se mettre d'accord... Peut-être que tu peux les aider ? »",
    scenarios: [
      { situation: "Deux amis veulent être capitaine de la même équipe de sport. Ils se disputent et ne veulent plus se parler.", q: "Comment les aider à résoudre ce conflit ?", options: ["Leur dire de tirer au sort", "Leur proposer d'être co-capitaines ou capitaines à tour de rôle", "Leur dire que ni l'un ni l'autre ne sera capitaine", "Ne rien faire, ils se débrouilleront"], best: 1, explanation: "Le compromis (co-capitaines ou alternance) respecte les deux personnes et renforce leur amitié.", advice: "Lumo dit : Un bon médiateur cherche des solutions où tout le monde gagne ! 🤝" },
      { situation: "Un nouveau arrive dans ta classe. Personne ne lui parle et il mange seul.", q: "Que fais-tu ?", options: ["Tu attends que les autres lui parlent d'abord", "Tu vas le voir, tu te présentes et tu l'invites à manger avec toi", "Tu le regardes de loin", "Tu demandes au prof de s'en occuper"], best: 1, explanation: "Prendre l'initiative d'accueillir quelqu'un montre du courage et de la bienveillance.", advice: "Lumo dit : Être le premier à tendre la main, c'est une super-pouvoir social ! 🌟" },
      { situation: "Ton ami a copié sur toi pendant un contrôle. Tu es énervé mais il dit que c'est parce qu'il avait trop peur d'échouer.", q: "Que fais-tu ?", options: ["Tu le dénonces au professeur", "Tu ne lui parles plus jamais", "Tu lui expliques calmement que copier n'est pas la solution et tu proposes de l'aider à réviser", "Tu le laisses faire la prochaine fois"], best: 2, explanation: "Expliquer et proposer de l'aide résout le problème de fond (la peur d'échouer) tout en gardant l'amitié.", advice: "Lumo dit : Un vrai ami aide à progresser, pas à tricher ! 📖" }
    ],
    lumoComment: "Tu es un excellent médiateur ! Le monde a besoin de gens comme toi ! 🌍"
  }
];

// ─── CREATIVITY ────────────────────────────────

const CREATIVITY_ALL = [
  {
    narrative: "NAME et Lumo découvrent un atelier où les couleurs prennent vie. Lumo saute de joie : « C'est l'Atelier de l'Imagination ! Montre ce que tu sais créer ! »",
    challenge: "Imagine que tu dois décorer la Grande Salle du château pour la fête du village.",
    questions: [
      { q: "Quel thème choisirais-tu pour la décoration ?", options: ["La forêt enchantée avec des feuilles et des lumières", "L'espace avec des étoiles et des planètes", "L'océan avec des vagues et des poissons", "Le cirque avec des couleurs vives et des acrobates"], correct: 0, explanation: "Tous les thèmes sont créatifs ! La forêt enchantée s'intègre parfaitement à l'univers d'Elevo." },
      { q: "Si tu pouvais inventer un nouvel instrument de musique, il serait fait en...", options: ["Cristaux qui chantent quand on les touche", "Nuages qui font des sons de pluie", "Fleurs qui jouent des mélodies", "Pierres qui vibrent comme des tambours"], correct: 2, explanation: "Des fleurs musicales, quelle idée merveilleuse et poétique !" },
      { q: "Tu dois créer un nouveau plat pour le banquet royal. Quelle est ta création ?", options: ["Un gâteau arc-en-ciel qui change de goût à chaque bouchée", "Une soupe d'étoiles filantes", "Des biscuits qui racontent une histoire", "Un jus de fruit invisible mais délicieux"], correct: 0, explanation: "Un gâteau qui change de goût ? C'est magique et gourmand à la fois !" }
    ],
    lumoComment: "Ton imagination est incroyable ! Tu es un véritable artiste ! 🎨✨"
  }
];

// ─── SÉLECTION PRINCIPALE ──────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function personalize(data: FallbackData, childName: string): FallbackData {
  const json = JSON.stringify(data);
  return JSON.parse(json.replace(/NAME/g, childName));
}

export function getFallbackExercise(exerciseType: string, ageGroup: string, childName: string): { data: FallbackData } {
  let data: FallbackData;

  switch (exerciseType) {
    case "reading":
      if (ageGroup === "maternelle") data = pickRandom(READING_MATERNELLE);
      else if (ageGroup === "college-lycee") data = pickRandom(READING_COLLEGIEN);
      else data = pickRandom(READING_PRIMAIRE);
      break;
    case "math":
      if (ageGroup === "maternelle") data = pickRandom(MATH_MATERNELLE);
      else if (ageGroup === "college-lycee") data = pickRandom(MATH_COLLEGIEN);
      else data = pickRandom(MATH_PRIMAIRE);
      break;
    case "emotional":
      data = pickRandom(EMOTIONAL_ALL);
      break;
    case "memory":
      data = pickRandom(MEMORY_ALL);
      break;
    case "social":
      data = pickRandom(SOCIAL_ALL);
      break;
    case "creativity":
      data = pickRandom(CREATIVITY_ALL);
      break;
    default:
      if (ageGroup === "maternelle") data = pickRandom(READING_MATERNELLE);
      else if (ageGroup === "college-lycee") data = pickRandom(READING_COLLEGIEN);
      else data = pickRandom(READING_PRIMAIRE);
  }

  return { data: personalize(data, childName) };
}
