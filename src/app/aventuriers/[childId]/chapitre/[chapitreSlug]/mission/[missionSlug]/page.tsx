import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityRouter } from '@/components/explorateurs/games/ActivityRouter';

/**
 * Page mission Aventuriers — réutilise l'ActivityRouter des Explorateurs.
 * Les mini-jeux sont identiques mais la route par laquelle on arrive est
 * différente, donc les observations emises (planetSlug = chapitreSlug) sont
 * bien liées à la progression Aventuriers côté DB.
 */
export default async function MissionPage({
  params,
}: {
  params: { childId: string; chapitreSlug: string; missionSlug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, parcours: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'AVENTURIERS') redirect('/onboarding');

  return (
    <ActivityRouter
      childId={child.id}
      planetSlug={params.chapitreSlug}
      activitySlug={params.missionSlug}
    />
  );
}
