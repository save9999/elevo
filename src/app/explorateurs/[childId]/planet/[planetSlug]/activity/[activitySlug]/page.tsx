import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityRouter } from '@/components/explorateurs/games/ActivityRouter';

export default async function ActivityPageRoute({
  params,
}: {
  params: { childId: string; planetSlug: string; activitySlug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, firstName: true, parcours: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'EXPLORATEURS') redirect('/onboarding');

  return (
    <ActivityRouter
      childId={child.id}
      planetSlug={params.planetSlug}
      activitySlug={params.activitySlug}
    />
  );
}

export function generateStaticParams() {
  return [];
}
