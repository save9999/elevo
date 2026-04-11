import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PROTOCOLS } from '@/engine/diagnostic/protocols';

export default async function LyceensCabinetPage({
  params,
}: {
  params: { childId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, firstName: true, parcours: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'LYCEENS') redirect('/onboarding');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <Link
          href={`/lyceens/${child.id}`}
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Tableau de bord
        </Link>

        <header className="mt-6 mb-8 border-b border-slate-800 pb-6">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-indigo-300">
            Bilans
          </span>
          <h1 className="mt-3 text-3xl font-bold">Autoévaluation</h1>
          <p className="mt-2 text-slate-400">
            Passe un bilan pour te situer. Les résultats sont privés et ne sont jamais partagés avec ton établissement sans ton accord.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {PROTOCOLS.map((p) => (
            <Link
              key={p.id}
              href={`/lyceens/${child.id}/cabinet/bilan/${p.id}`}
              className="group flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-5 hover:border-indigo-500 hover:bg-slate-900"
            >
              <div className="flex-1">
                <p className="text-base font-semibold">{p.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {p.durationMin}–{p.durationMax} min · {p.items.length} items · cible : {p.targetTrouble}
                </p>
              </div>
              <span className="text-xs text-indigo-300 opacity-0 transition group-hover:opacity-100">
                Lancer →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
