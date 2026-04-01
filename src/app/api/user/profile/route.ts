import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom invalide" }, { status: 400 });

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { name: name.trim() },
  });

  return NextResponse.json({ name: user.name });
}
