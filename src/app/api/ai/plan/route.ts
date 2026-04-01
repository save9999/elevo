import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId } = await req.json();
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { profile: true, assessments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!child) return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });

  const age = new Date().getFullYear() - new Date(child.birthDate).getFullYear();
  const profile = child.profile;

  const prompt = `Tu es un expert en éducation personnalisée pour enfants.
Crée un plan d'apprentissage personnalisé en JSON pour:
- Prénom: ${child.name}
- Âge: ${age} ans
- Groupe: ${child.ageGroup}
- Scores: lecture=${profile?.scoreReading}, écriture=${profile?.scoreWriting}, maths=${profile?.scoreMath}, mémoire=${profile?.scoreMemory}, attention=${profile?.scoreAttention}
- Défis détectés: ${profile?.troubles || "[]"}
- Forces: ${profile?.strengths || "[]"}

Génère un JSON avec:
{
  "weeklyGoal": "objectif de la semaine en une phrase",
  "dailyMinutes": 20,
  "priorityModules": [
    {"id": "module-id", "name": "Nom du module", "emoji": "🎯", "reason": "pourquoi", "sessions": 3}
  ],
  "dailySchedule": [
    {"day": "Lundi", "activities": [{"name": "activité", "module": "module-id", "duration": 10, "emoji": "📚"}]}
  ],
  "motivationalMessage": "message d'encouragement pour l'enfant",
  "parentTips": ["conseil pour les parents"]
}

Modules disponibles: reading, writing, math, memory, attention, emotional, social, physical, creativity, orientation
Réponds UNIQUEMENT avec le JSON.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  let plan;
  try {
    plan = JSON.parse(text);
  } catch {
    plan = {};
  }

  if (child.profile) {
    await prisma.childProfile.update({
      where: { childId },
      data: { personalPlan: JSON.stringify(plan) },
    });
  }

  return NextResponse.json(plan);
}
