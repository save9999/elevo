import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LyceensModulePage } from '@/components/lyceens/LyceensModulePage';

export default async function LyceensModulePageRoute({
  params,
}: {
  params: { childId: string; moduleSlug: string };
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

  return <LyceensModulePage childId={child.id} moduleSlug={params.moduleSlug} />;
}
