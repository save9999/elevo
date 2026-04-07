import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function getAgeGroup(age: number): string {
  if (age < 6) return "maternelle";
  if (age < 11) return "primaire";
  return "college-lycee";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const userId = (session.user as { id?: string }).id;
    if (!userId) return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    const children = await prisma.child.findMany({
      where: { parentId: userId },
      include: { profile: true, achievements: { orderBy: { unlockedAt: "desc" }, take: 3 } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(children);
  } catch (err) {
    console.error("GET /api/children error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const userId = (session.user as { id?: string }).id;
    if (!userId) return NextResponse.json({ error: "Session invalide, reconnectez-vous." }, { status: 401 });

    const { name, birthDate, avatar } = await req.json();
    if (!name || !birthDate) {
      return NextResponse.json({ error: "Nom et date de naissance requis." }, { status: 400 });
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return NextResponse.json({ error: "Date de naissance invalide." }, { status: 400 });
    }

    const age = getAge(birth);
    const ageGroup = getAgeGroup(age);
    const child = await prisma.child.create({
      data: {
        parentId: userId,
        name,
        birthDate: birth,
        ageGroup,
        avatar: avatar || "🦊",
      },
    });
    await prisma.childProfile.create({ data: { childId: child.id } });
    return NextResponse.json(child, { status: 201 });
  } catch (err) {
    console.error("POST /api/children error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du profil." },
      { status: 500 }
    );
  }
}
