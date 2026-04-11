import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AventuriersChapitrePage } from '@/components/aventuriers/AventuriersChapitrePage';

export default async function ChapitrePage({
  params,
}: {
  params: { childId: string; chapitreSlug: string };
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
    <AventuriersChapitrePage
      childId={child.id}
      chapitreSlug={params.chapitreSlug}
    />
  );
}
