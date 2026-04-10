import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PROTOCOLS } from '@/engine/diagnostic/protocols';
import { LumoSphere } from '@/components/explorateurs/lumo/LumoSphere';

export default async function CabinetPage({
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
  if (child.parcours !== 'EXPLORATEURS') redirect('/onboarding');

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(1px_1px_at_30%_20%,white_,transparent_50%),radial-gradient(1px_1px_at_70%_70%,white_,transparent_50%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href={`/explorateurs/${child.id}`}
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Retour à la Station
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Cabinet de LUMO · {child.firstName}
        </p>
      </header>

      <section className="relative z-10 mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
        <LumoSphere mood="thinking" size="lg" />
        <h1 className="text-3xl font-bold">Bienvenue au Cabinet</h1>
        <p className="max-w-xl text-slate-300">
          Ici, on fait des petits bilans avec LUMO pour mieux comprendre comment tu
          apprends. Ce sont des jeux un peu spéciaux, mais tu peux les faire à ton
          rythme et il n&apos;y a pas de mauvaises réponses.
        </p>
        <p className="max-w-xl text-xs text-slate-500">
          Les bilans du Cabinet doivent être lancés par un adulte. Si tu es venu·e seul·e,
          va chercher un parent avant de commencer.
        </p>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-3xl px-6 pb-20">
        <h2 className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
          Bilans disponibles
        </h2>
        <div className="grid gap-3">
          {PROTOCOLS.map((p) => (
            <Link
              key={p.id}
              href={`/explorateurs/${child.id}/cabinet/bilan/${p.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition hover:border-indigo-500 hover:bg-slate-900"
            >
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-100">{p.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Cible : {troubleLabel(p.targetTrouble)} · {p.durationMin}–{p.durationMax} min · {p.items.length} items
                </p>
              </div>
              <span className="text-xs uppercase tracking-wider text-indigo-300 opacity-0 transition group-hover:opacity-100">
                Lancer →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function troubleLabel(t: string): string {
  const labels: Record<string, string> = {
    dyslexie: 'Dyslexie (lecture)',
    dysorthographie: 'Dysorthographie (orthographe)',
    dyscalculie: 'Dyscalculie (nombres)',
    dyspraxie: 'Dyspraxie (coordination)',
    memoire: 'Mémoire de travail',
  };
  return labels[t] ?? t;
}
