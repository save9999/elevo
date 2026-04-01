import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, module: mod, activity, score, duration, xpEarned, data } = await req.json();

  const learningSession = await prisma.learningSession.create({
    data: {
      childId,
      module: mod,
      activity,
      score,
      duration,
      xpEarned,
      data: JSON.stringify(data || {}),
    },
  });

  // Update child XP and streak
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (child) {
    const newXp = child.xp + xpEarned;
    const xpPerLevel = 500;
    const newLevel = Math.floor(newXp / xpPerLevel) + 1;
    await prisma.child.update({
      where: { id: childId },
      data: { xp: newXp, level: newLevel, lastActivity: new Date() },
    });

    // Check for achievements
    if (newLevel > child.level) {
      await prisma.achievement.create({
        data: {
          childId,
          title: `Niveau ${newLevel} atteint !`,
          emoji: "⭐",
          desc: `Tu es passé au niveau ${newLevel}. Bravo !`,
        },
      });
    }
  }

  return NextResponse.json(learningSession, { status: 201 });
}
