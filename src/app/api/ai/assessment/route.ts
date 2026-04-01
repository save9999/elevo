import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, answers, assessmentType } = await req.json();

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { profile: true },
  });
  if (!child) return NextResponse.json({ error: "Enfant non trouvé" }, { status: 404 });

  const prompt = `Tu es un expert en neuropsychologie pédiatrique et troubles d'apprentissage.
Analyse les réponses suivantes d'un enfant de ${new Date().getFullYear() - new Date(child.birthDate).getFullYear()} ans lors d'un jeu d'évaluation.

Type d'évaluation: ${assessmentType}
Réponses: ${JSON.stringify(answers)}

Génère une analyse JSON avec ce format exact:
{
  "scores": {
    "reading": 0-100,
    "writing": 0-100,
    "math": 0-100,
    "memory": 0-100,
    "attention": 0-100,
    "motor": 0-100
  },
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
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    result = { riskLevel: "low", scores: {}, detectedChallenges: [], strengths: [], recommendations: [], summary: "" };
  }

  // Save assessment
  await prisma.assessment.create({
    data: {
      childId,
      type: assessmentType,
      result: JSON.stringify(result),
      risk: result.riskLevel || "low",
    },
  });

  // Update child profile with new scores
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
