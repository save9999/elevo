import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExplorateurHubClient } from './_components/ExplorateurHubClient';

export default async function ExplorateurStationPage({
  params,
}: {
  params: { childId: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, firstName: true, parcours: true },
  });

  if (!child) {
    redirect('/parent');
  }

  if (child.parcours !== 'EXPLORATEURS') {
    // L'enfant appartient à un autre parcours → rediriger
    redirect('/onboarding');
  }

  return <ExplorateurHubClient childId={child.id} firstName={child.firstName} />;
}
