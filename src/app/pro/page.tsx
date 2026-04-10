import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

/**
 * Mode Pro — interface orthophoniste.
 *
 * MVP : accessible à tous les users `role=PRO`. Liste les "patients" (enfants
 * suivis) avec accès aux bilans bruts et comparaisons longitudinales.
 *
 * Différence avec le dashboard parent :
 *   - scores bruts visibles
 *   - option export
 *   - pas de ton parental ("votre enfant") mais clinique ("le patient")
 */
export default async function ProDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, proCode: true },
  });

  if (!user || user.role !== 'PRO') {
    return (
      <main className="relative min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Mode Pro</p>
          <h1 className="mt-4 text-3xl font-bold">Accès réservé aux professionnels</h1>
          <p className="mt-3 text-slate-400">
            Le mode pro d&apos;Elevo est réservé aux orthophonistes titulaires d&apos;un
            numéro ADELI ou RPPS. Si vous souhaitez l&apos;activer pour votre cabinet,
            contactez-nous — la validation est manuelle dans cette version bêta.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/parent"
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium"
            >
              Retour à l&apos;espace parent
            </Link>
            <Link
              href="mailto:pro@elevo.local?subject=Activation mode pro"
              className="rounded-full border border-slate-700 px-5 py-2 text-sm"
            >
              Demander l&apos;activation
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Liste des patients suivis (via proId sur Child)
  const patients = await prisma.child.findMany({
    where: { proId: user.id },
    include: {
      bilans: { orderBy: { startedAt: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(1px_1px_at_20%_20%,white_,transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">
              Cabinet LUMO — mode clinique
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {user.name ?? user.email}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Orthophoniste · {patients.length} patient{patients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">
              Se déconnecter
            </button>
          </form>
        </header>

        <section className="mb-10 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
          <h2 className="mb-2 text-sm font-semibold text-indigo-200">Mode clinique actif</h2>
          <p className="text-sm text-slate-300">
            Vous avez accès aux scores bruts, aux interprétations techniques et à l&apos;export
            PDF des bilans. Aucune information médicale n&apos;est communiquée à l&apos;enfant,
            qui ne voit jamais ses scores.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Patients
          </h2>
          {patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
              <p className="text-slate-400">
                Aucun patient suivi pour le moment. Un parent peut vous rattacher à son
                enfant depuis son espace.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {patients.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">{p.firstName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {p.parcours} · Né·e le{' '}
                        {new Date(p.birthdate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Link
                      href={`/pro/patient/${p.id}`}
                      className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-medium hover:bg-indigo-400"
                    >
                      Voir dossier
                    </Link>
                  </div>
                  {p.bilans.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
                      {p.bilans.map((b) => (
                        <li key={b.id}>
                          · {b.protocolId} — {new Date(b.startedAt).toLocaleDateString('fr-FR')}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
