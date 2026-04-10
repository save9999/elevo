import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ParentDashboardClient from './_components/ParentDashboardClient';

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const parentId = (session.user as { id: string }).id;

  const children = await prisma.child.findMany({
    where: { parentId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      firstName: true,
      birthdate: true,
      parcours: true,
      createdAt: true,
    },
  });

  const parentName = session.user.name ?? session.user.email ?? 'parent';

  return (
    <ParentDashboardClient
      parentName={parentName}
      children={children.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        birthdate: c.birthdate.toISOString(),
        parcours: c.parcours,
      }))}
    />
  );
}
