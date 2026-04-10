import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LumoSpeaker } from '@/components/explorateurs/lumo/LumoSpeaker';
import { PETITS_ACTIVITIES } from '@/components/petits/petits-activities';

const PETITS_PLANET_META: Record<
  string,
  { name: string; emoji: string; color: string; bg: string; welcome: string }
> = {
  alphabos: {
    name: 'Les Lettres',
    emoji: '🔤',
    color: 'from-sky-300 to-indigo-600',
    bg: 'from-slate-950 via-indigo-950 to-slate-950',
    welcome: "Bienvenue sur la planète des lettres. Choisis un jeu !",
  },
  numeris: {
    name: 'Les Nombres',
    emoji: '🔢',
    color: 'from-amber-300 to-orange-600',
    bg: 'from-slate-950 via-orange-950 to-slate-950',
    welcome: "Bienvenue sur la planète des nombres. Choisis un jeu !",
  },
  memoria: {
    name: 'La Mémoire',
    emoji: '🧠',
    color: 'from-violet-300 to-purple-700',
    bg: 'from-slate-950 via-purple-950 to-slate-950',
    welcome: "Bienvenue sur la planète de la mémoire. Choisis un jeu !",
  },
};

export default async function PetitsPlanetPage({
  params,
}: {
  params: { childId: string; planetSlug: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const parentId = (session.user as { id: string }).id;

  const child = await prisma.child.findFirst({
    where: { id: params.childId, parentId },
    select: { id: true, parcours: true, firstName: true },
  });
  if (!child) redirect('/parent');
  if (child.parcours !== 'PETITS') redirect('/onboarding');

  const meta = PETITS_PLANET_META[params.planetSlug];
  const activities = PETITS_ACTIVITIES[params.planetSlug];
  if (!meta || !activities) notFound();

  return (
    <main
      className={`relative min-h-screen bg-gradient-to-br ${meta.bg} text-slate-100`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1px_1px_at_60%_20%,white_,transparent_50%),radial-gradient(2px_2px_at_80%_60%,white_,transparent_50%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          href={`/petits/${child.id}`}
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-500"
          aria-label="Retour à la station"
        >
          <span aria-hidden>←</span>
          <span>Station</span>
        </Link>
      </header>

      <section className="relative z-10 mx-auto mt-4 flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
        <div
          className={`flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br text-7xl shadow-[0_0_80px_20px_rgba(99,102,241,0.4)] ${meta.color}`}
        >
          <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">{meta.emoji}</span>
        </div>
        <h1 className="text-4xl font-bold">{meta.name}</h1>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-3xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={`/petits/${child.id}/planet/${params.planetSlug}/activity/${a.slug}`}
              className="group flex flex-col items-center gap-3 rounded-3xl border-2 border-slate-800 bg-slate-900/60 p-6 text-center backdrop-blur transition hover:scale-105 hover:border-indigo-400 hover:bg-slate-900/90"
            >
              <div className="text-6xl">{a.emoji}</div>
              <div className="text-xl font-bold text-slate-100">{a.name}</div>
              <p className="text-sm text-slate-400">{a.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="fixed bottom-8 right-8 z-20">
        <LumoSpeaker text={meta.welcome} size="md" />
      </div>
    </main>
  );
}
