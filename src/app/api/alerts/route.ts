import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { evaluateAlerts, type ObservationInput } from '@/engine/diagnostic/alerts';

/**
 * GET /api/alerts?childId=...
 * Évalue les observations récentes de l'enfant, persiste les nouvelles alertes,
 * et retourne la liste consolidée.
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

  // 1. Charger les observations 30 derniers jours
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const observations = await prisma.observation.findMany({
    where: { childId, createdAt: { gte: cutoff } },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Évaluer via le moteur
  const input: ObservationInput[] = observations.map((o) => ({
    domain: o.domain,
    signal: o.signal,
    weight: o.weight,
    createdAt: o.createdAt,
  }));
  const suggestions = evaluateAlerts(input);

  // 3. Persister les alertes nouvelles (dédup par title + domain)
  const existingTitles = new Set(
    (
      await prisma.alert.findMany({
        where: { childId, acknowledgedAt: null },
        select: { title: true },
      })
    ).map((a) => a.title),
  );

  for (const s of suggestions) {
    if (existingTitles.has(s.title)) continue;
    await prisma.alert.create({
      data: {
        childId,
        severity: s.severity,
        title: s.title,
        body: s.body,
        observationIds: [],
        action: s.action,
      },
    });
  }

  // 4. Retourner toutes les alertes non-ack
  const alerts = await prisma.alert.findMany({
    where: { childId },
    orderBy: [{ acknowledgedAt: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ alerts });
}

/**
 * PATCH /api/alerts — marque une alerte comme acquittée.
 * Body : { alertId }
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;

  let body: { alertId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.alertId) {
    return NextResponse.json({ error: 'missing_alertId' }, { status: 400 });
  }

  const alert = await prisma.alert.findFirst({
    where: { id: body.alertId, child: { parentId } },
  });
  if (!alert) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const updated = await prisma.alert.update({
    where: { id: alert.id },
    data: { acknowledgedAt: new Date() },
  });
  return NextResponse.json({ alert: updated });
}
