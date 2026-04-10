import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface DysResult {
  reading?: { mclm: number; percentile: string; duration: number; errors: number; wordCount: number };
  phoneme?: { correct: number; total: number; accuracy: number; avgRT: number; difficulties: string[] };
  subitization?: { correct: number; total: number; accuracy: number; avgRT: number; maxSubitized: number };
  dictation?: { totalWords: number; orthographicCorrect: number; phoneticCorrect: number; avgTimePerWord: number; regularErrors: number; irregularErrors: number };
}

// POST: save dys assessment results
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const { childId, results } = body as { childId: string; results: DysResult };

    if (!childId || !results) {
      return NextResponse.json({ error: "childId et results requis" }, { status: 400 });
    }

    // Verify child belongs to parent
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId: (session.user as { id: string }).id },
    });
    if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

    // Compute risk level
    const flags: string[] = [];
    if (results.reading?.percentile === "low") flags.push("reading_speed");
    if (results.phoneme && results.phoneme.accuracy < 70) flags.push("phoneme_discrimination");
    if (results.subitization && results.subitization.accuracy < 60) flags.push("number_sense");
    if (results.dictation) {
      const errorRate = ((results.dictation.totalWords - results.dictation.orthographicCorrect) / results.dictation.totalWords) * 100;
      if (errorRate > 60) flags.push("spelling");
    }

    let risk = "low";
    if (flags.length >= 3) risk = "high";
    else if (flags.length >= 1) risk = "medium";

    // Save as Assessment record
    const assessment = await prisma.assessment.create({
      data: {
        childId,
        type: "dys-screening",
        result: JSON.stringify({ results, flags }),
        risk,
      },
    });

    return NextResponse.json({ success: true, assessmentId: assessment.id, risk, flags });
  } catch (error) {
    console.error("Dys assessment save error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET: retrieve latest dys assessment for a child
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId requis" }, { status: 400 });

  try {
    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId: (session.user as { id: string }).id },
    });
    if (!child) return NextResponse.json({ error: "Enfant introuvé" }, { status: 404 });

    // Get all dys assessments, most recent first
    const assessments = await prisma.assessment.findMany({
      where: { childId, type: "dys-screening" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const parsed = assessments.map((a) => ({
      id: a.id,
      createdAt: a.createdAt,
      risk: a.risk,
      ...JSON.parse(a.result as string),
    }));

    return NextResponse.json({ assessments: parsed });
  } catch (error) {
    console.error("Dys assessment fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
