import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { module, ageGroup, level, sessionCount, childName } = await req.json();

  const systemPrompt = `Tu es un expert en pédagogie française spécialisé dans la création d'exercices éducatifs pour enfants.
Tu dois générer un exercice UNIQUE et adapté, jamais vu par l'enfant avant.

IMPORTANT : Réponds UNIQUEMENT avec du JSON valide, sans markdown ni explication.`;

  const prompts: Record<string, string> = {
    reading: `Génère UNE histoire courte et engageante pour un enfant de niveau "${ageGroup}" (session n°${sessionCount}) avec 3 questions QCM.

Thèmes possibles selon le niveau:
- maternelle: animaux, famille, nature, jouets, saisons
- primaire: aventure, science, histoire, géographie, sport
- college-lycee: société, philosophie, sciences, littérature, actualité

Format JSON exact:
{
  "text": "L'histoire ici (2-4 phrases, émojis bienvenus)",
  "questions": [
    {"q": "question ?", "options": ["A", "B", "C", "D"], "correct": 0},
    {"q": "question ?", "options": ["A", "B", "C", "D"], "correct": 2},
    {"q": "question ?", "options": ["A", "B", "C", "D"], "correct": 1}
  ]
}`,

    math: `Génère 5 problèmes de maths VARIÉS pour un enfant de niveau "${ageGroup}", niveau de difficulté adapté au niveau ${level} (session n°${sessionCount}).

- maternelle: additions/soustractions simples avec émojis, comparaisons, comptage
- primaire: multiplications, divisions, fractions, pourcentages, géométrie
- college-lycee: algèbre, géométrie, trigonométrie, probabilités

Format JSON exact:
{
  "problems": [
    {"q": "énoncé ?", "answer": "réponse"},
    {"q": "énoncé ?", "answer": "réponse"},
    {"q": "énoncé ?", "answer": "réponse"},
    {"q": "énoncé ?", "answer": "réponse"},
    {"q": "énoncé ?", "answer": "réponse"}
  ]
}`,

    emotional: `Génère 3 situations émotionnelles NOUVELLES adaptées à "${ageGroup}" (session n°${sessionCount}).

Format JSON exact:
{
  "scenarios": [
    {
      "situation": "description de la situation",
      "emotion": "🎭",
      "question": "Comment tu te sens / que fais-tu ?",
      "options": ["option A", "option B", "option C", "option D"],
      "best": 1,
      "advice": "conseil bienveillant"
    }
  ]
}`,
  };

  const prompt = prompts[module];
  if (!prompt) {
    return NextResponse.json({ error: "Module non supporté" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("REMPLACE")) {
    return NextResponse.json({ error: "API non configurée" }, { status: 503 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: `${prompt}\n\nNom de l'enfant: ${childName}. Génère quelque chose d'unique et adapté.` }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ data, generated: true });
  } catch (err) {
    console.error("Exercise generation error:", err);
    return NextResponse.json({ error: "Génération échouée" }, { status: 500 });
  }
}
