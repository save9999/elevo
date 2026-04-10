'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Child = {
  id: string;
  firstName: string;
  parcours: string;
  birthdate: string;
};

type Bilan = {
  id: string;
  protocolId: string;
  startedAt: string;
  completedAt: string | null;
  interpretation: string | null;
  band: string | null;
  accuracy: number | null;
};

type Alert = {
  id: string;
  severity: 'INFO' | 'ATTENTION' | 'IMPORTANT';
  title: string;
  body: string;
  createdAt: string;
  acknowledgedAt: string | null;
  action: string | null;
};

const DOMAIN_LABELS: Record<string, string> = {
  READING_SPEED: 'Vitesse de lecture',
  READING_ACCURACY: 'Précision de lecture',
  PHONOLOGY: 'Phonologie',
  WRITING: 'Écriture',
  NUMERIC: 'Nombres et calcul',
  ATTENTION: 'Attention',
  MEMORY: 'Mémoire',
  VISUO_SPATIAL: 'Orientation visuo-spatiale',
  MOTOR: 'Motricité fine',
};

export function ChildReportClient({
  child,
  bilans,
  alerts: initialAlerts,
  domainSummary,
}: {
  child: Child;
  bilans: Bilan[];
  alerts: Alert[];
  domainSummary: Record<string, { count: number; weight: number }>;
}) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Au mount : déclencher une évaluation fraîche des alertes
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/alerts?childId=${child.id}`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts);
        }
      } catch {
        // silencieux
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAck = async (alertId: string) => {
    setLoading(true);
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledgedAt: new Date().toISOString() } : a)),
      );
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledgedAt);
  const ackAlerts = alerts.filter((a) => a.acknowledgedAt);

  const sortedDomains = Object.entries(domainSummary)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 6);
  const maxWeight = Math.max(...sortedDomains.map(([, v]) => v.weight), 1);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1px_1px_at_60%_20%,white_,transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/parent"
              className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
            >
              ← Centre de contrôle
            </Link>
            <h1 className="mt-3 text-3xl font-bold">{child.firstName}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Parcours : {child.parcours} · Né·e le{' '}
              {new Date(child.birthdate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </header>

        {/* Alertes actives */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Alertes à examiner ({activeAlerts.length})
          </h2>
          {activeAlerts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
              <p className="text-emerald-300">
                ✓ Rien à signaler pour le moment. Tout va bien.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl border p-5 backdrop-blur ${
                    a.severity === 'IMPORTANT'
                      ? 'border-rose-500/40 bg-rose-500/10'
                      : a.severity === 'ATTENTION'
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-indigo-500/20 bg-indigo-500/5'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wider ${
                        a.severity === 'IMPORTANT'
                          ? 'bg-rose-500/30 text-rose-200'
                          : a.severity === 'ATTENTION'
                            ? 'bg-amber-500/30 text-amber-200'
                            : 'bg-indigo-500/30 text-indigo-200'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <h3 className="text-base font-semibold">{a.title}</h3>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-slate-300">{a.body}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/explorateurs/${child.id}/cabinet`}
                      className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium hover:bg-indigo-400"
                    >
                      Lancer un bilan
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAck(a.id)}
                      disabled={loading}
                      className="rounded-full border border-slate-700 px-4 py-1.5 text-xs hover:border-slate-500"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Carnet d'observation par domaine */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Carnet d&apos;observation (30 derniers jours)
          </h2>
          {sortedDomains.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center text-sm text-slate-500">
              Pas encore d&apos;observation. Laisse ton enfant explorer la Station et
              reviens dans quelques jours !
            </p>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
              <ul className="flex flex-col gap-3">
                {sortedDomains.map(([domain, data]) => {
                  const pct = (data.weight / maxWeight) * 100;
                  return (
                    <li key={domain}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-slate-300">
                          {DOMAIN_LABELS[domain] ?? domain}
                        </span>
                        <span className="text-slate-500">{data.count} obs.</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Bilans */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Historique des bilans
            </h2>
            <Link
              href={`/explorateurs/${child.id}/cabinet`}
              className="text-xs text-indigo-300 hover:text-indigo-200"
            >
              + Nouveau bilan
            </Link>
          </div>
          {bilans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center text-sm text-slate-500">
              Aucun bilan effectué pour le moment.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {bilans.map((b) => (
                <li
                  key={b.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{b.protocolId}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(b.startedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {b.band && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          b.band === 'normal'
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : b.band === 'attention'
                              ? 'bg-amber-500/20 text-amber-200'
                              : 'bg-rose-500/20 text-rose-200'
                        }`}
                      >
                        {b.band === 'normal'
                          ? 'Tout va bien'
                          : b.band === 'attention'
                            ? 'À surveiller'
                            : 'Préoccupant'}
                      </span>
                    )}
                  </div>
                  {b.interpretation && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {b.interpretation}
                    </p>
                  )}
                  {b.accuracy !== null && (
                    <p className="mt-2 text-xs text-slate-500">
                      Réussite : {Math.round(b.accuracy * 100)}%
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Alertes archivées */}
        {ackAlerts.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Alertes archivées ({ackAlerts.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {ackAlerts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-slate-800/60 bg-slate-900/20 p-3 text-sm text-slate-500"
                >
                  {a.title} ·{' '}
                  {a.acknowledgedAt &&
                    new Date(a.acknowledgedAt).toLocaleDateString('fr-FR')}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
