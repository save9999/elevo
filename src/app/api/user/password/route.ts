import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.passwordHash) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email: session.user.email }, data: { passwordHash: hashed } });

  return NextResponse.json({ success: true });
}
