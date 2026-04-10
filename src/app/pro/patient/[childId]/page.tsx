import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Vue clinique d'un patient pour l'orthophoniste.
 * Affiche les scores bruts, la séquence historique, et permet l'export (stub).
 */
export default async function ProPatientPage({
  params,
}: {
  params: { childId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== 'PRO') redirect('/parent');

  const patient = await prisma.child.findFirst({
    where: { id: params.childId, proId: userId },
    include: {
      bilans: { orderBy: { startedAt: 'desc' } },
    },
  });
  if (!patient) notFound();

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="relative mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/pro"
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Tous les patients
        </Link>

        <header className="mt-6 mb-8 border-b border-slate-800 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Dossier patient</p>
          <h1 className="mt-2 text-3xl font-bold">{patient.firstName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Né·e le {new Date(patient.birthdate).toLocaleDateString('fr-FR')} · Parcours{' '}
            {patient.parcours}
          </p>
        </header>

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Bilans standardisés ({patient.bilans.length})
            </h2>
            <button
              type="button"
              className="rounded-full border border-slate-700 px-4 py-1.5 text-xs text-slate-400 hover:border-slate-500"
              disabled
              title="Export PDF disponible dans une version ultérieure"
            >
              Export PDF (à venir)
            </button>
          </div>

          {patient.bilans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              Aucun bilan standardisé dans le dossier.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {patient.bilans.map((b) => {
                const raw = b.rawScores as
                  | { correct?: number; total?: number; durationMs?: number }
                  | null;
                const normed = b.normedScores as
                  | { band?: string; accuracy?: number }
                  | null;
                return (
                  <li
                    key={b.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="text-base font-semibold">{b.protocolId}</p>
                        <p className="text-xs text-slate-500">
                          v{b.protocolVersion} · {new Date(b.startedAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                        {b.mode}
                      </span>
                    </div>
                    <dl className="mb-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <dt className="text-xs uppercase text-slate-500">Correct / total</dt>
                        <dd className="mt-0.5 text-slate-100">
                          {raw?.correct ?? '—'} / {raw?.total ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-slate-500">Précision</dt>
                        <dd className="mt-0.5 text-slate-100">
                          {normed?.accuracy !== undefined
                            ? `${Math.round(normed.accuracy * 100)}%`
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-slate-500">Durée</dt>
                        <dd className="mt-0.5 text-slate-100">
                          {raw?.durationMs !== undefined
                            ? `${Math.round(raw.durationMs / 1000)} s`
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                    {normed?.band && (
                      <p className="mb-2 text-xs">
                        Bande :{' '}
                        <span
                          className={
                            normed.band === 'normal'
                              ? 'text-emerald-300'
                              : normed.band === 'attention'
                                ? 'text-amber-300'
                                : 'text-rose-300'
                          }
                        >
                          {normed.band}
                        </span>
                      </p>
                    )}
                    {b.interpretation && (
                      <p className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
                        {b.interpretation}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
