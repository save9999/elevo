import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function defaultPlan(child: { name: string; ageGroup: string; profile: { scoreReading: number; scoreWriting: number; scoreMath: number } | null }) {
  const p = child.profile;
  const weakest = p
    ? Object.entries({ reading: p.scoreReading, writing: p.scoreWriting, math: p.scoreMath })
        .sort(([, a], [, b]) => a - b)
        .slice(0, 2)
        .map(([k]) => k)
    : ["reading", "math"];

  const moduleNames: Record<string, string> = {
    reading: "Lecture & Langage", writing: "Écriture", math: "Maths & Logique",
    memory: "Mémoire & Attention", emotional: "Bien-être émotionnel",
  };
  const moduleEmojis: Record<string, string> = {
    reading: "📖", writing: "✏️", math: "🔢", memory: "🧠", emotional: "💛",
  };

  return {
    weeklyGoal: `Progresser en ${moduleNames[weakest[0]] || "Lecture"} et renforcer les acquis`,
    dailyMinutes: child.ageGroup === "maternelle" ? 15 : child.ageGroup === "primaire" ? 20 : 30,
    priorityModules: weakest.map((id, i) => ({
      id,
      name: moduleNames[id] || id,
      emoji: moduleEmojis[id] || "📚",
      reason: `Score à améliorer`,
      sessions: i === 0 ? 4 : 3,
    })),
    dailySchedule: [
      { day: "Lundi", activities: [{ name: moduleNames[weakest[0]] || "Lecture", module: weakest[0], duration: 10, emoji: moduleEmojis[weakest[0]] || "📚" }] },
      { day: "Mardi", activities: [{ name: moduleNames[weakest[1]] || "Maths", module: weakest[1] || "math", duration: 10, emoji: moduleEmojis[weakest[1]] || "🔢" }] },
      { day: "Mercredi", activities: [{ name: "Mémoire & Attention", module: "memory", duration: 10, emoji: "🧠" }] },
      { day: "Jeudi", activities: [{ name: moduleNames[weakest[0]] || "Lecture", module: weakest[0], duration: 10, emoji: moduleEmojis[weakest[0]] || "📚" }] },
      { day: "Vendredi", activities: [{ name: moduleNames[weakest[1]] || "Maths", module: weakest[1] || "math", duration: 10, emoji: moduleEmojis[weakest[1]] || "🔢" }] },
    ],
    motivationalMessage: `Bravo ${child.name.split(" ")[0]} ! Chaque jour tu progresses ! Continue comme ça ! 🌟`,
    parentTips: [
      "Pratiquer à heure fixe chaque jour",
      "Féliciter les efforts, pas seulement les résultats",
      "Faire des pauses de 5 min toutes les 20 min",
    ],
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;

  const { childId } = await req.json();
  if (!childId) return NextResponse.json({ error: "childId requis" }, { status: 400 });

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { profile: true, assessments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!child) return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });
  if (child.parentId !== userId) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  const fallback = defaultPlan(child);

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("REMPLACE")) {
    if (child.profile) {
      await prisma.childProfile.update({
        where: { childId },
        data: { personalPlan: JSON.stringify(fallback) },
      });
    }
    return NextResponse.json(fallback);
  }

  const age = new Date().getFullYear() - new Date(child.birthDate).getFullYear();
  const profile = child.profile;

  const prompt = `Tu es un expert en éducation personnalisée pour enfants.
Crée un plan d'apprentissage personnalisé en JSON pour:
- Prénom: ${child.name}
- Âge: ${age} ans
- Groupe: ${child.ageGroup}
- Scores: lecture=${profile?.scoreReading ?? 50}, écriture=${profile?.scoreWriting ?? 50}, maths=${profile?.scoreMath ?? 50}, mémoire=${profile?.scoreMemory ?? 50}, attention=${profile?.scoreAttention ?? 50}
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

  let plan = fallback;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.weeklyGoal) plan = parsed;
    }
  } catch (err) {
    console.error("Claude plan error:", err);
  }

  if (child.profile) {
    await prisma.childProfile.update({
      where: { childId },
      data: { personalPlan: JSON.stringify(plan) },
    });
  }

  return NextResponse.json(plan);
}
