import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;

  const { childId, module: mod, activity, score, duration, xpEarned, data } = await req.json();
  if (!childId || !mod) return NextResponse.json({ error: "childId et module requis" }, { status: 400 });

  // Vérifier que l'enfant appartient bien au parent connecté
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });
  if (child.parentId !== userId) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  const xp = Math.max(0, Math.min(1000, Number(xpEarned) || 0));
  const sc = Math.max(0, Math.min(100, Number(score) || 0));
  const dur = Math.max(0, Number(duration) || 0);

  const learningSession = await prisma.learningSession.create({
    data: {
      childId,
      module: mod,
      activity: activity || mod,
      score: sc,
      duration: dur,
      xpEarned: xp,
      data: JSON.stringify(data || {}),
    },
  });

  // Mise à jour XP, niveau et streak
  const newXp = child.xp + xp;
  const xpPerLevel = 500;
  const newLevel = Math.floor(newXp / xpPerLevel) + 1;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let newStreak = child.streak;
  if (child.lastActivity) {
    const last = new Date(child.lastActivity);
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const diffDays = Math.round((today.getTime() - lastDay.getTime()) / 86400000);
    if (diffDays === 0) {
      // Même jour → garder streak
    } else if (diffDays === 1) {
      newStreak = child.streak + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await prisma.child.update({
    where: { id: childId },
    data: { xp: newXp, level: newLevel, streak: newStreak, lastActivity: new Date() },
  });

  // Achievement si nouveau niveau
  if (newLevel > child.level) {
    const levelEmojis = ["⭐", "🌟", "💫", "🏆", "👑", "🚀", "💎", "🔥"];
    await prisma.achievement.create({
      data: {
        childId,
        title: `Niveau ${newLevel} atteint !`,
        emoji: levelEmojis[(newLevel - 1) % levelEmojis.length],
        desc: `Tu es passé au niveau ${newLevel}. Félicitations !`,
      },
    });
  }

  // Achievement streak
  const streakMilestones = [3, 7, 14, 30];
  if (streakMilestones.includes(newStreak)) {
    await prisma.achievement.create({
      data: {
        childId,
        title: `${newStreak} jours de suite !`,
        emoji: "🔥",
        desc: `Tu as pratiqué ${newStreak} jours consécutifs. Quelle régularité !`,
      },
    });
  }

  return NextResponse.json({ ...learningSession, newLevel, newXp, newStreak }, { status: 201 });
}
