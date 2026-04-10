import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ObservationDomain } from '@/engine/observation/collector';

/**
 * POST /api/observations
 * Body : { childId, sessionId?, observations: [{domain, signal, weight, context?}, ...] }
 *
 * Le parent connecté doit être le propriétaire de l'enfant.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;

  let body: {
    childId?: string;
    sessionId?: string;
    observations?: Array<{
      domain: ObservationDomain;
      signal: string;
      weight: number;
      context?: Record<string, unknown>;
    }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { childId, sessionId, observations } = body;
  if (!childId || !Array.isArray(observations) || observations.length === 0) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // Vérif propriété
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
    select: { id: true },
  });
  if (!child) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Création en batch
  const created = await prisma.observation.createMany({
    data: observations.map((o) => ({
      childId,
      sessionId: sessionId ?? null,
      domain: o.domain,
      signal: o.signal,
      weight: o.weight,
      context: (o.context ?? null) as never,
    })),
  });

  return NextResponse.json({ created: created.count }, { status: 201 });
}
