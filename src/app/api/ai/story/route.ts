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
    memory: `Génère un exercice de mémoire intégré dans la narration.
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
