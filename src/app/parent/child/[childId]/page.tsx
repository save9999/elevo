import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChildReportClient } from './_components/ChildReportClient';
import type { ObservationDomain } from '@/engine/observation/collector';

export default async function ParentChildPage({
  params,
}: {
  params: { childId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    include: {
      bilans: { orderBy: { startedAt: 'desc' }, take: 20 },
      alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!child) notFound();

  // Compte les observations par domaine, 30 derniers jours
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const observations = await prisma.observation.findMany({
    where: { childId: child.id, createdAt: { gte: cutoff } },
    select: { domain: true, weight: true },
  });

  const domainSummary: Record<string, { count: number; weight: number }> = {};
  for (const obs of observations) {
    const key = obs.domain as ObservationDomain;
    if (!domainSummary[key]) domainSummary[key] = { count: 0, weight: 0 };
    domainSummary[key].count += 1;
    domainSummary[key].weight += obs.weight;
  }

  return (
    <ChildReportClient
      child={{
        id: child.id,
        firstName: child.firstName,
        parcours: child.parcours,
        birthdate: child.birthdate.toISOString(),
      }}
      bilans={child.bilans.map((b) => ({
        id: b.id,
        protocolId: b.protocolId,
        startedAt: b.startedAt.toISOString(),
        completedAt: b.completedAt?.toISOString() ?? null,
        interpretation: b.interpretation,
        band: (b.normedScores as { band?: string } | null)?.band ?? null,
        accuracy: (b.normedScores as { accuracy?: number } | null)?.accuracy ?? null,
      }))}
      alerts={child.alerts.map((a) => ({
        id: a.id,
        severity: a.severity,
        title: a.title,
        body: a.body,
        createdAt: a.createdAt.toISOString(),
        acknowledgedAt: a.acknowledgedAt?.toISOString() ?? null,
        action: a.action,
      }))}
      domainSummary={domainSummary}
    />
  );
}
