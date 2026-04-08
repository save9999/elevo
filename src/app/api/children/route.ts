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

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const { name, birthDate, avatar } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Le prénom est requis." }, { status: 400 });
    }
    if (!birthDate) {
      return NextResponse.json({ error: "La date de naissance est requise." }, { status: 400 });
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return NextResponse.json({ error: "Date de naissance invalide." }, { status: 400 });
    }

    const age = getAge(birth);
    if (age < 0 || age > 25) {
      return NextResponse.json({ error: "La date de naissance semble incorrecte." }, { status: 400 });
    }

    const ageGroup = getAgeGroup(age);

    // Transaction : crée l'enfant ET son profil en une seule opération
    const child = await prisma.child.create({
      data: {
        parentId: userId,
        name: name.trim(),
        birthDate: birth,
        ageGroup,
        avatar: avatar || "🦊",
        profile: {
          create: {},
        },
      },
      include: { profile: true },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (err) {
    console.error("POST /api/children error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string }).code || "";

    // Erreur de connexion DB
    if (code === "P1001" || code === "P1002" || message.includes("Can't reach")) {
      return NextResponse.json({ error: "Base de données injoignable. Réessayez dans quelques secondes." }, { status: 503 });
    }
    // Table inexistante
    if (code === "P2021" || message.includes("does not exist")) {
      return NextResponse.json({ error: "La base de données n'est pas initialisée. Contactez le support." }, { status: 500 });
    }
    // Contrainte de clé étrangère
    if (code === "P2003" || message.includes("Foreign key") || message.includes("foreign key")) {
      return NextResponse.json({ error: "Compte parent introuvable. Reconnectez-vous." }, { status: 401 });
    }
    return NextResponse.json(
      { error: `Erreur serveur : ${code || "UNKNOWN"} — ${message.slice(0, 200)}` },
      { status: 500 }
    );
  }
}
