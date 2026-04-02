import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_PATCH_FIELDS = new Set([
  "name", "birthDate", "avatar", "ageGroup",
  "level", "xp", "streak", "lastActivity",
]);

async function getOwnedChild(id: string, userId: string) {
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child || child.parentId !== userId) return null;
  return child;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;
  const { id } = params;

  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      profile: true,
      achievements: { orderBy: { unlockedAt: "desc" } },
      sessions: { orderBy: { createdAt: "desc" }, take: 20 },
      assessments: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!child) return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });
  if (child.parentId !== userId) return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  return NextResponse.json(child);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;
  const { id } = params;

  const existing = await getOwnedChild(id, userId);
  if (!existing) return NextResponse.json({ error: "Enfant non trouvé ou accès interdit" }, { status: 404 });

  const body = await req.json();

  const safeData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_PATCH_FIELDS.has(key)) safeData[key] = value;
  }
  if (Object.keys(safeData).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide fourni" }, { status: 400 });
  }

  if (safeData.birthDate) {
    const birth = new Date(safeData.birthDate as string);
    if (isNaN(birth.getTime())) return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    const age = new Date().getFullYear() - birth.getFullYear();
    safeData.ageGroup = age < 6 ? "maternelle" : age < 11 ? "primaire" : "college-lycee";
    safeData.birthDate = birth;
  }

  const child = await prisma.child.update({ where: { id }, data: safeData });
  return NextResponse.json(child);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;
  const { id } = params;

  const existing = await getOwnedChild(id, userId);
  if (!existing) return NextResponse.json({ error: "Enfant non trouvé ou accès interdit" }, { status: 404 });

  await prisma.child.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
