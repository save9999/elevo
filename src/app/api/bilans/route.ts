import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProtocol } from '@/engine/diagnostic/protocols';
import { scoreProtocol } from '@/engine/diagnostic/protocol-scoring';
import type { ProtocolAnswer } from '@/engine/diagnostic/protocols/types';

/**
 * POST /api/bilans
 * Crée un bilan terminé (MVP : on envoie toutes les réponses d'un coup à la fin).
 * Body : { childId, protocolId, answers: ProtocolAnswer[], mode, triggeredBy }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;

  let body: {
    childId?: string;
    protocolId?: string;
    answers?: ProtocolAnswer[];
    mode?: 'PARENT' | 'PRO';
    triggeredBy?: 'PARENT_REQUEST' | 'PRO_REQUEST' | 'AI_SUGGESTION';
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { childId, protocolId, answers, mode = 'PARENT', triggeredBy = 'PARENT_REQUEST' } = body;
  if (!childId || !protocolId || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
    select: { id: true },
  });
  if (!child) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const protocol = getProtocol(protocolId);
  if (!protocol) {
    return NextResponse.json({ error: 'unknown_protocol' }, { status: 404 });
  }

  const result = scoreProtocol(protocol, answers);

  const bilan = await prisma.bilan.create({
    data: {
      childId,
      protocolId: protocol.id,
      protocolVersion: protocol.version,
      completedAt: new Date(),
      rawAnswers: answers as never,
      rawScores: {
        correct: result.rawScore.correct,
        total: result.rawScore.total,
        durationMs: result.rawScore.durationMs,
      } as never,
      normedScores: {
        band: result.band,
        accuracy: result.accuracy,
      } as never,
      interpretation: result.interpretation,
      mode,
      triggeredBy,
    },
  });

  return NextResponse.json({ bilan, result }, { status: 201 });
}

/**
 * GET /api/bilans?childId=...
 * Liste les bilans d'un enfant (le parent doit en être propriétaire).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;

  const url = new URL(req.url);
  const childId = url.searchParams.get('childId');
  if (!childId) {
    return NextResponse.json({ error: 'missing_childId' }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
    select: { id: true },
  });
  if (!child) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const bilans = await prisma.bilan.findMany({
    where: { childId },
    orderBy: { startedAt: 'desc' },
  });
  return NextResponse.json({ bilans });
}
