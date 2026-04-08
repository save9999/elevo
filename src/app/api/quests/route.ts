import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const QUEST_TEMPLATES = [
  { title: "Lumo a trouvé un coffre", description: "Résous {count} énigmes de {type} pour ouvrir le coffre", exerciseType: "math", targetCount: 2, reward: { stars: 15, xp: 30 } },
  { title: "Un villageois a perdu ses mots", description: "Aide-le en lisant {count} histoire(s)", exerciseType: "reading", targetCount: 1, reward: { stars: 10, xp: 20 } },
  { title: "Le pont est fragile", description: "Renforce-le en résolvant {count} problèmes de maths", exerciseType: "math", targetCount: 3, reward: { stars: 20, xp: 40 } },
  { title: "L'oiseau messager", description: "Aide l'oiseau à livrer son message en complétant {count} exercice(s) de mémoire", exerciseType: "memory", targetCount: 2, reward: { stars: 15, xp: 30 } },
  { title: "Le gardien triste", description: "Réconforte le gardien en complétant {count} exercice(s) émotionnel(s)", exerciseType: "emotional", targetCount: 1, reward: { stars: 10, xp: 25 } },
  { title: "Le défi de Lumo", description: "Lumo te défie ! Complète {count} exercices de n'importe quel type", exerciseType: "any", targetCount: 3, reward: { stars: 25, xp: 50 } },
];

function generateDailyQuests(childId: string, date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const shuffled = [...QUEST_TEMPLATES].sort((a, b) => {
    const hashA = (dayOfYear * 31 + QUEST_TEMPLATES.indexOf(a) * 7 + childId.charCodeAt(0)) % 100;
    const hashB = (dayOfYear * 31 + QUEST_TEMPLATES.indexOf(b) * 7 + childId.charCodeAt(0)) % 100;
    return hashA - hashB;
  });

  return shuffled.slice(0, 3).map((t) => ({
    childId,
    date,
    title: t.title,
    description: t.description.replace("{count}", String(t.targetCount)).replace("{type}", t.exerciseType),
    exerciseType: t.exerciseType,
    targetCount: t.targetCount,
    reward: t.reward,
  }));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId requis" }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let quests = await prisma.dailyQuest.findMany({ where: { childId, date: today } });

  if (quests.length === 0) {
    const questsData = generateDailyQuests(childId, today);
    await prisma.dailyQuest.createMany({ data: questsData, skipDuplicates: true });
    quests = await prisma.dailyQuest.findMany({ where: { childId, date: today } });
  }

  return NextResponse.json({ quests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { questId, increment } = await req.json();

  const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } });
  if (!quest) return NextResponse.json({ error: "Quête introuvée" }, { status: 404 });
  if (quest.completed) return NextResponse.json({ quest, alreadyCompleted: true });

  const newProgress = Math.min(quest.progress + (increment || 1), quest.targetCount);
  const completed = newProgress >= quest.targetCount;

  const updated = await prisma.dailyQuest.update({
    where: { id: questId },
    data: { progress: newProgress, completed },
  });

  if (completed) {
    const reward = quest.reward as { stars?: number; xp?: number };
    await prisma.childCurrency.upsert({
      where: { childId: quest.childId },
      update: { stars: { increment: reward.stars || 0 } },
      create: { childId: quest.childId, stars: reward.stars || 0, crystals: 0 },
    });
    if (reward.xp) {
      await prisma.child.update({ where: { id: quest.childId }, data: { xp: { increment: reward.xp } } });
    }
  }

  return NextResponse.json({ quest: updated, justCompleted: completed });
}
