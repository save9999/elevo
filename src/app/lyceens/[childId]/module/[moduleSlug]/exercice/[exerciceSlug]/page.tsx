import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityRouter } from '@/components/explorateurs/games/ActivityRouter';

export default async function LyceensExercicePage({
  params,
}: {
  params: { childId: string; moduleSlug: string; exerciceSlug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, parcours: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'LYCEENS') redirect('/onboarding');

  return (
    <ActivityRouter
      childId={child.id}
      planetSlug={params.moduleSlug}
      activitySlug={params.exerciceSlug}
    />
  );
}
