import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
  return NextResponse.json(child);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = params;
  const data = await req.json();
  const child = await prisma.child.update({ where: { id }, data });
  return NextResponse.json(child);
}
