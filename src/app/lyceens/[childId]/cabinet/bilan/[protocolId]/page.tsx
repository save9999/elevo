import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProtocol } from '@/engine/diagnostic/protocols';
import { ProtocolRunner } from '@/components/explorateurs/cabinet/ProtocolRunner';

export default async function LyceensBilanPage({
  params,
}: {
  params: { childId: string; protocolId: string };
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

  const protocol = getProtocol(params.protocolId);
  if (!protocol) notFound();

  return <ProtocolRunner childId={child.id} protocol={protocol} />;
}
