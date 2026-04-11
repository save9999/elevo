import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANETS, type PlanetSlug } from '@/components/explorateurs/station/planets-data';
import { PlanetPage, type PlanetActivity } from '@/components/explorateurs/planets/PlanetPage';
import { PLANET_ACTIVITIES } from '@/components/explorateurs/planets/planet-activities';

export default async function PlanetPageRoute({
  params,
}: {
  params: { childId: string; planetSlug: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, parcours: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'EXPLORATEURS') redirect('/onboarding');

  const planet = PLANETS.find((p) => p.slug === params.planetSlug as PlanetSlug);
  if (!planet) notFound();

  const activities: PlanetActivity[] = PLANET_ACTIVITIES[planet.slug] ?? [];

  return (
    <PlanetPage
      childId={child.id}
      planet={planet}
      activities={activities}
      backHref={`/explorateurs/${child.id}`}
    />
  );
}
