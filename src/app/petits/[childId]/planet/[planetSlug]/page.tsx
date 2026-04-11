import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANETS, type PlanetSlug } from '@/components/explorateurs/station/planets-data';
import { PlanetPage } from '@/components/explorateurs/planets/PlanetPage';
import { PETITS_ACTIVITIES } from '@/components/petits/petits-activities';

export default async function PetitsPlanetPage({
  params,
}: {
  params: { childId: string; planetSlug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, parcours: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'PETITS') redirect('/onboarding');

  const planet = PLANETS.find((p) => p.slug === (params.planetSlug as PlanetSlug));
  if (!planet) notFound();

  const activities = PETITS_ACTIVITIES[params.planetSlug] ?? [];
  if (activities.length === 0) notFound();

  return (
    <PlanetPage
      childId={child.id}
      planet={planet}
      activities={activities}
      backHref={`/petits/${child.id}`}
    />
  );
}
