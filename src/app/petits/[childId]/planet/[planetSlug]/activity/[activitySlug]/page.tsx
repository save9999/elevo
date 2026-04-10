import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PetitsActivityRouter } from '@/components/petits/PetitsActivityRouter';

export default async function PetitsActivityPage({
  params,
}: {
  params: { childId: string; planetSlug: string; activitySlug: string };
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

  return (
    <PetitsActivityRouter
      childId={child.id}
      planetSlug={params.planetSlug}
      activitySlug={params.activitySlug}
    />
  );
}
