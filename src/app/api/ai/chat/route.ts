import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { messages, childProfile, systemContext } = await req.json();

  const systemPrompt = `Tu es Elevo, un assistant IA bienveillant et expert en éducation pour enfants de 3 à 18 ans.
Tu parles toujours en français, avec un ton adapté à l'âge de l'enfant.
Tu es encourageant, positif et patient.

${childProfile ? `Profil de l'enfant:
- Nom: ${childProfile.name}
- Âge: ${childProfile.age} ans
- Groupe d'âge: ${childProfile.ageGroup}
- Niveau: ${childProfile.level}
- Forces: ${childProfile.strengths || "à découvrir"}
- Points à travailler: ${childProfile.troubles || "aucun détecté"}` : ""}

${systemContext || ""}

Règles importantes:
- Adapte ton vocabulaire à l'âge de l'enfant
- Utilise des emojis pour rendre le texte plus engageant
- Félicite les efforts, pas seulement les résultats
- Si un enfant semble en difficulté, suggère doucement de demander l'aide d'un adulte
- Ne donne jamais d'informations médicales précises`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ message: text });
}
