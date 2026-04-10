import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const child = await prisma.child.findUnique({
    where: { id: params.id },
    include: {
      profile: true,
      achievements: { orderBy: { unlockedAt: "desc" }, take: 10 },
      sessions: { orderBy: { createdAt: "desc" }, take: 50 },
      assessments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

  return NextResponse.json(child);
}
