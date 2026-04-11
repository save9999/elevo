import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PROTOCOLS } from '@/engine/diagnostic/protocols';

export default async function AventuriersCabinetPage({
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
  if (child.parcours !== 'AVENTURIERS') redirect('/onboarding');

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-900 text-stone-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/aventuriers/${child.id}`}
          className="text-xs uppercase tracking-[0.25em] text-amber-200/70 hover:text-amber-100"
        >
          ← Carnet de bord
        </Link>

        <header className="mt-6 mb-8 border-b border-stone-800 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Cabinet du bilan</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold italic">Bilan d&apos;autoévaluation</h1>
          <p className="mt-2 text-stone-300">
            Chaque bilan est une photo instantanée de ton niveau sur un domaine précis.
            Pas de pression, pas de note — juste un outil pour comprendre où tu en es.
          </p>
        </header>

        <div className="grid gap-3">
          {PROTOCOLS.map((p) => (
            <Link
              key={p.id}
              href={`/aventuriers/${child.id}/cabinet/bilan/${p.id}`}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-stone-700 bg-stone-900/50 p-5 hover:border-amber-500/50 hover:bg-stone-900"
            >
              <div className="flex-1">
                <p className="font-serif text-lg italic text-amber-100">{p.name}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {p.durationMin}–{p.durationMax} min · {p.items.length} items · cible : {p.targetTrouble}
                </p>
              </div>
              <span className="text-xs text-amber-300/70 opacity-0 transition group-hover:opacity-100">
                Lancer →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
