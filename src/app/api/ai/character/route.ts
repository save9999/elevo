import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childName, ageGroup, level, streak, lastModule, xp, avatarName, timeOfDay } = await req.json();

  const hour = new Date().getHours();
  const moment = hour < 12 ? "matin" : hour < 18 ? "après-midi" : "soir";

  const ageInstructions = ageGroup === "maternelle"
    ? "L'enfant a entre 3 et 6 ans. Utilise des mots très simples, des phrases courtes, des comparaisons avec des jouets ou des animaux. Sois très expressif et enthousiaste avec des émojis."
    : ageGroup === "primaire"
    ? "L'enfant a entre 6 et 11 ans. Parle comme un ami cool et encourageant. Tu peux utiliser des expressions de jeux vidéo et de sport."
    : "L'enfant est adolescent. Parle avec respect et égalité, comme un grand frère ou une grande sœur bienveillante. Évite d'être condescendant.";

  const systemPrompt = `Tu es ${avatarName || "Lumo"}, le compagnon personnel de ${childName}. Tu n'es PAS un robot, tu es un vrai ami qui les accompagne dans leur apprentissage.

${ageInstructions}

Tu dois répondre de façon naturelle, chaleureuse et spontanée quand ${childName} te touche/clique.

Contexte de ${childName} :
- Niveau : ${level}
- XP : ${xp}
- Série de jours : ${streak} jour${streak > 1 ? "s" : ""} consécutifs
- Dernier module joué : ${lastModule || "aucun encore"}
- Moment de la journée : ${timeOfDay || moment}

IMPORTANT :
- Varie tes réponses à chaque fois (ne dis JAMAIS la même chose)
- Utilise le prénom ${childName} parfois
- Réfère-toi à leurs accomplissements spécifiques (niveau, série)
- Parle comme un vrai ami, pas comme un robot
- Une phrase maximum, ou 2 courtes phrases
- Ajoute 1-2 émojis pertinents
- Parfois pose une question pour engager la conversation
- Parfois dis quelque chose de drôle ou d'inattendu`;

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("REMPLACE")) {
    const fallbacks = [
      `Coucou ${childName} ! T'es là, super ! 🎉`,
      `Hé, j'attendais que tu arrives ! 🌟`,
      `${childName} ! Tu sais quoi ? Tu es mon héros préféré ! 💪`,
      `Yo ! Prêt(e) pour une nouvelle aventure ? 🚀`,
      `Oooh tu m'as cliqué dessus ! J'adore ça ! 😄`,
    ];
    return NextResponse.json({ message: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: "user", content: `${childName} vient de me toucher/cliquer. Génère UNE réponse spontanée et naturelle.` }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : `Salut ${childName} ! 🌟`;
    return NextResponse.json({ message: text });
  } catch {
    const fallbacks = [
      `Coucou ${childName} ! T'es là, super ! 🎉`,
      `Hé, j'attendais que tu arrives ! 🌟`,
      `${childName} ! Tu es incroyable, tu le sais ? 💪`,
    ];
    return NextResponse.json({ message: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }
}
