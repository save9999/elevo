import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/game-sessions
 * Démarre ou termine une session de jeu.
 *
 * - `{ action: 'start', childId, planetSlug, activitySlug }` → crée une GameSession et renvoie son id
 * - `{ action: 'end', sessionId, score, metadata? }` → termine la session
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;

  let body: {
    action?: 'start' | 'end';
    childId?: string;
    planetSlug?: string;
    activitySlug?: string;
    sessionId?: string;
    score?: number;
    metadata?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (body.action === 'start') {
    const { childId, planetSlug, activitySlug } = body;
    if (!childId || !planetSlug || !activitySlug) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      select: { id: true },
    });
    if (!child) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const created = await prisma.gameSession.create({
      data: { childId, planetSlug, activitySlug },
    });
    return NextResponse.json({ session: { id: created.id } }, { status: 201 });
  }

  if (body.action === 'end') {
    const { sessionId, score, metadata } = body;
    if (!sessionId) {
      return NextResponse.json({ error: 'missing_sessionId' }, { status: 400 });
    }
    const existing = await prisma.gameSession.findFirst({
      where: { id: sessionId, child: { parentId } },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const updated = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        score: score ?? null,
        metadata: (metadata ?? null) as never,
      },
    });
    return NextResponse.json({ session: updated });
  }

  return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
}
