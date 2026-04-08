import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStarsForScore, EXERCISE_REWARDS, BOSS_REWARDS } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId requis" }, { status: 400 });

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

  const chapters = await prisma.chapter.findMany({
    where: { ageGroup: child.ageGroup },
    orderBy: { order: "asc" },
    include: {
      steps: { orderBy: { order: "asc" } },
      progress: { where: { childId } },
    },
  });

  const chaptersWithStatus = chapters.map((chapter, idx) => {
    const chapterProgress = chapter.progress.find((p) => !p.stepId);
    const stepsWithStatus = chapter.steps.map((step) => {
      const stepProgress = chapter.progress.find((p) => p.stepId === step.id);
      return { ...step, status: stepProgress?.status || "locked", score: stepProgress?.score, starsEarned: stepProgress?.starsEarned };
    });

    let chapterStatus = "locked";
    if (chapterProgress?.status === "completed") {
      chapterStatus = "completed";
    } else if (idx === 0 || chapters[idx - 1]?.progress.some((p) => !p.stepId && p.status === "completed")) {
      chapterStatus = "available";
    }

    return { ...chapter, status: chapterStatus, steps: stepsWithStatus, progress: undefined };
  });

  const currency = await prisma.childCurrency.findUnique({ where: { childId } });

  return NextResponse.json({ chapters: chaptersWithStatus, currency: currency || { stars: 0, crystals: 0, streakFreezes: 1 } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, chapterId, stepId, score, isBoss } = await req.json();

  const stars = getStarsForScore(score);
  const xpEarned = isBoss ? BOSS_REWARDS.xp : (score >= 90 ? EXERCISE_REWARDS.xp.perfect : EXERCISE_REWARDS.xp.base);
  const starsEarned = isBoss ? BOSS_REWARDS.stars : EXERCISE_REWARDS.stars[stars as 1 | 2 | 3];
  const crystalsEarned = isBoss ? BOSS_REWARDS.crystals : 0;

  await prisma.childProgress.upsert({
    where: { childId_chapterId_stepId: { childId, chapterId, stepId: stepId || "" } },
    update: { status: "completed", score, starsEarned: stars, completedAt: new Date() },
    create: { childId, chapterId, stepId, status: "completed", score, starsEarned: stars, completedAt: new Date() },
  });

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { steps: true } });
  const allStepProgress = await prisma.childProgress.findMany({ where: { childId, chapterId, status: "completed", stepId: { not: null } } });

  let chapterCompleted = false;
  if (chapter && allStepProgress.length >= chapter.steps.length && isBoss) {
    await prisma.childProgress.upsert({
      where: { childId_chapterId_stepId: { childId, chapterId, stepId: "" } },
      update: { status: "completed", completedAt: new Date() },
      create: { childId, chapterId, stepId: null, status: "completed", completedAt: new Date() },
    });
    chapterCompleted = true;
  }

  await prisma.child.update({
    where: { id: childId },
    data: { xp: { increment: xpEarned }, lastActivity: new Date() },
  });

  await prisma.childCurrency.upsert({
    where: { childId },
    update: { stars: { increment: starsEarned }, crystals: { increment: crystalsEarned } },
    create: { childId, stars: starsEarned, crystals: crystalsEarned },
  });

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (child) {
    const newLevel = Math.floor(child.xp / 500) + 1;
    if (newLevel > child.level) {
      await prisma.child.update({ where: { id: childId }, data: { level: newLevel } });
      await prisma.achievement.create({
        data: { childId, title: `Niveau ${newLevel}`, emoji: "⭐", desc: `Tu as atteint le niveau ${newLevel} !` },
      });
    }
  }

  return NextResponse.json({ xpEarned, starsEarned, crystalsEarned, stars, chapterCompleted });
}
