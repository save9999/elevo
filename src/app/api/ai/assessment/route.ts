import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function fallbackResult(answers: Record<string, { index: number }>) {
  // Analyse locale si Claude API indisponible
  const avg = (keys: string[]) => {
    const vals = keys.map((k) => answers[k]?.index ?? 1);
    return Math.round(100 - (vals.reduce((a, b) => a + b, 0) / vals.length) * 25);
  };
  const reading = avg(["reading_speed"]);
  const writing = avg(["writing"]);
  const math = avg(["math"]);
  const memory = avg(["memory"]);
  const attention = avg(["attention"]);
  const motor = avg(["motor"]);

  const scores = { reading, writing, math, memory, attention, motor };
  const low = Object.entries(scores).filter(([, v]) => v < 50).map(([k]) => k);
  const high = Object.entries(scores).filter(([, v]) => v >= 70).map(([k]) => k);

  const labelMap: Record<string, string> = {
    reading: "Lecture", writing: "Écriture", math: "Mathématiques",
    memory: "Mémoire", attention: "Attention", motor: "Motricité",
  };

  return {
    scores,
    riskLevel: low.length >= 3 ? "high" : low.length >= 1 ? "medium" : "low",
    detectedChallenges: low.map((k) => `Difficultés en ${labelMap[k] || k}`),
    strengths: high.map((k) => `Bon niveau en ${labelMap[k] || k}`),
    recommendations: [
      "Pratiquer régulièrement avec les modules Elevo",
      "Faire des pauses toutes les 20 minutes",
      "Féliciter les efforts plutôt que les résultats",
    ],
    summary: "Évaluation complète. Consultez le tableau de bord parent pour les détails.",
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, answers, assessmentType } = await req.json();

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { profile: true },
  });
  if (!child) return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });

  const age = new Date().getFullYear() - new Date(child.birthDate).getFullYear();

  let result = fallbackResult(answers as Record<string, { index: number }>);

  // Tenter l'analyse Claude (peut échouer si clé manquante/invalide)
  try {
    const prompt = `Tu es un expert en neuropsychologie pédiatrique et troubles d'apprentissage.
Analyse les réponses suivantes d'un enfant de ${age} ans lors d'un jeu d'évaluation.

Type d'évaluation: ${assessmentType}
Réponses: ${JSON.stringify(answers)}

Génère une analyse JSON avec ce format exact:
{
  "scores": { "reading": 0-100, "writing": 0-100, "math": 0-100, "memory": 0-100, "attention": 0-100, "motor": 0-100 },
  "riskLevel": "low|medium|high",
  "detectedChallenges": ["liste des difficultés potentielles"],
  "strengths": ["liste des points forts"],
  "recommendations": ["recommandations concrètes"],
  "summary": "résumé en une phrase pour les parents"
}
Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const parsed = JSON.parse(text);
    if (parsed.riskLevel) result = parsed;
  } catch {
    // Utiliser le résultat de fallback calculé localement
  }

  // Sauvegarder l'évaluation
  await prisma.assessment.create({
    data: {
      childId,
      type: assessmentType,
      result: JSON.stringify(result),
      risk: result.riskLevel || "low",
    },
  });

  // Mettre à jour le profil enfant
  if (child.profile && result.scores) {
    await prisma.childProfile.update({
      where: { childId },
      data: {
        scoreReading: result.scores.reading ?? child.profile.scoreReading,
        scoreWriting: result.scores.writing ?? child.profile.scoreWriting,
        scoreMath: result.scores.math ?? child.profile.scoreMath,
        scoreMemory: result.scores.memory ?? child.profile.scoreMemory,
        scoreAttention: result.scores.attention ?? child.profile.scoreAttention,
        scoreMotor: result.scores.motor ?? child.profile.scoreMotor,
        troubles: JSON.stringify(result.detectedChallenges || []),
        strengths: JSON.stringify(result.strengths || []),
      },
    });
  }

  return NextResponse.json(result);
}
