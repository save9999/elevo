import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden grain" style={{ background: 'var(--bg-base)' }}>
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full opacity-[0.08] blur-[120px]"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="pointer-events-none absolute -right-40 top-1/2 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-[140px]"
        style={{ background: 'var(--accent)' }}
      />

      {/* Top nav */}
      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="text-base font-semibold tracking-tight">Elevo</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <a
            href="#parcours"
            className="hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:block"
          >
            Parcours
          </a>
          <a
            href="#science"
            className="hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:block"
          >
            Approche
          </a>
          <Link
            href="/login"
            className="rounded-md border px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent-bright)]"
            style={{ borderColor: 'var(--border-default)' }}
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg-base)',
            }}
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-20 mx-auto max-w-7xl px-8 pt-24 pb-32 lg:pt-32">
        <div className="max-w-4xl">
          <p className="eyebrow reveal reveal-1">
            <span className="divider" />
            Plateforme éducative · 4 — 18 ans
          </p>

          <h1 className="reveal reveal-2 mt-8 text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
            Apprendre à son rythme,
            <br />
            <span className="serif-italic" style={{ color: 'var(--accent-bright)' }}>
              repérer les troubles dys
            </span>
            <br />
            sans jamais étiqueter.
          </h1>

          <p
            className="reveal reveal-3 mt-10 max-w-2xl text-lg leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Elevo est un compagnon éducatif adaptatif pour les enfants et adolescents
            de 4 à 18 ans. Quatre parcours distincts, des protocoles inspirés
            d&apos;ODEDYS et Alouette, et une intelligence artificielle qui repère
            en douceur les signes de troubles dys — sans jamais poser de diagnostic.
          </p>

          <div className="reveal reveal-4 mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-md px-6 py-3.5 text-sm font-semibold transition hover:translate-y-[-1px]"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg-base)',
                boxShadow: '0 10px 30px -10px var(--accent-glow)',
              }}
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="rounded-md border px-6 py-3.5 text-sm font-semibold transition hover:border-[var(--text-secondary)]"
              style={{ borderColor: 'var(--border-default)' }}
            >
              J&apos;ai déjà un compte →
            </Link>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Aucune carte bancaire requise
            </span>
          </div>
        </div>
      </section>

      {/* Section : 4 parcours */}
      <section
        id="parcours"
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-24">
          <div className="mb-16 max-w-2xl">
            <p className="eyebrow">
              <span className="divider" />
              Quatre parcours
            </p>
            <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Une expérience pensée pour chaque âge.
            </h2>
            <p
              className="mt-5 text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Du tout-petit en maternelle au lycéen en première, chaque tranche
              d&apos;âge a son propre univers, son propre vocabulaire et ses
              propres outils de remédiation.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--border-default)' }}>
            {PARCOURS.map((p, i) => (
              <article
                key={p.number}
                className="group relative p-8 transition hover:bg-[var(--bg-elevated)] sm:p-10"
                style={{ background: 'var(--bg-surface)' }}
              >
                <div className="grid gap-6 sm:grid-cols-[80px_1fr_auto] sm:items-start">
                  <div
                    className="font-mono text-3xl font-light"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {p.number}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {p.name}
                      </h3>
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {p.age}
                      </span>
                    </div>
                    <p
                      className="mt-3 max-w-2xl text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {p.description}
                    </p>
                    <div
                      className="mt-4 flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wider"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border px-3 py-1"
                          style={{ borderColor: 'var(--border-default)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Cible dys
                    </p>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: 'var(--accent-bright)' }}
                    >
                      {p.dys}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section : Approche scientifique */}
      <section
        id="science"
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-24">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">
                <span className="divider" />
                L&apos;approche
              </p>
              <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Adossé à la recherche, validé par la pratique.
              </h2>
              <p
                className="mt-6 text-base leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Les protocoles d&apos;Elevo s&apos;inspirent des outils de référence
                utilisés par les orthophonistes : ODEDYS, Alouette, Corsi, batteries
                de subitisation. Aucun diagnostic n&apos;est posé par
                l&apos;application — l&apos;objectif est d&apos;alerter le parent
                sur des signes à surveiller, et d&apos;orienter vers un·e
                professionnel·le de santé.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border p-6"
                  style={{
                    borderColor: 'var(--border-default)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <p
                    className="font-mono text-3xl font-light tracking-tight"
                    style={{ color: 'var(--accent-bright)' }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section : CTA final */}
      <section className="relative z-20 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="mx-auto max-w-7xl px-8 py-32">
          <div
            className="rounded-2xl border p-12 text-center sm:p-16"
            style={{
              borderColor: 'var(--border-default)',
              background:
                'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
            }}
          >
            <p className="eyebrow">
              <span className="divider" /> Commencer
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Donnez à votre enfant un{' '}
              <span className="serif-italic" style={{ color: 'var(--accent-bright)' }}>
                tutorat à sa hauteur
              </span>
              .
            </h2>
            <p
              className="mx-auto mt-6 max-w-xl text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              Création de compte en moins d&apos;une minute, premier parcours
              accessible immédiatement.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-md px-7 py-3.5 text-sm font-semibold transition hover:translate-y-[-1px]"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--bg-base)',
                  boxShadow: '0 10px 30px -10px var(--accent-glow)',
                }}
              >
                Créer un compte gratuit
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold transition hover:text-[var(--accent-bright)]"
              >
                Se connecter →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <Mark />
                <span className="text-base font-semibold">Elevo</span>
              </Link>
              <p
                className="mt-3 max-w-xs text-xs leading-relaxed"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Plateforme éducative adaptative pour les 4-18 ans. Données hébergées
                en France. Aucun diagnostic médical établi par l&apos;application.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
              <div>
                <p
                  className="mb-3 text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Produit
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      Créer un compte
                    </Link>
                  </li>
                  <li>
                    <Link href="/pro" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      Mode pro
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p
                  className="mb-3 text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Légal
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/cgu" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      CGU
                    </Link>
                  </li>
                  <li>
                    <Link href="/confidentialite" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      Confidentialité
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:contact@elevo.local"
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div
            className="mt-12 border-t pt-6 text-xs"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-tertiary)',
            }}
          >
            © 2026 Elevo · Tous droits réservés
          </div>
        </div>
      </footer>
    </main>
  );
}

/* === Brand mark : 16px square avec accent === */
function Mark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="4" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" fill="var(--accent)" />
    </svg>
  );
}

/* === Données === */
const PARCOURS = [
  {
    number: '01',
    name: 'Petits',
    age: '4 — 6 ans',
    description:
      "Maternelle. Découverte des lettres, des nombres et des couleurs au travers d'activités courtes et entièrement guidées par la voix.",
    tags: ['Voix off', 'Sans lecture', 'Repérage précoce'],
    dys: 'Dysphasie · phonologie',
  },
  {
    number: '02',
    name: 'Explorateurs',
    age: '6 — 10 ans',
    description:
      "CP — CM2. Six domaines à explorer (lecture, calcul, écriture, langage, mémoire, espace) sous forme d'un hub interactif. Cœur du repérage des troubles dys.",
    tags: ['14 activités', '5 protocoles', 'Hub interactif'],
    dys: 'Dyslexie · dyscalculie · dysorthographie',
  },
  {
    number: '03',
    name: 'Aventuriers',
    age: '10 — 14 ans',
    description:
      "Collège. Carnet de bord narratif, six chapitres de remédiation et de compensation pour les enfants déjà diagnostiqués.",
    tags: ['Carnet de bord', 'Remédiation', 'Auto-évaluation'],
    dys: 'Compensation · rééducation',
  },
  {
    number: '04',
    name: 'Lycéens',
    age: '14 — 18 ans',
    description:
      "Lycée. Tableau de bord d'entraînement avec modules thématiques et bilans d'auto-évaluation. Outil de compensation pour préparer le bac.",
    tags: ['Tableau de bord', 'Modules', 'Aménagements bac'],
    dys: 'Méthodologie · expression écrite',
  },
];

const STATS = [
  { value: '5', label: 'Protocoles dys standardisés (Alouette, ODEDYS, Corsi…)' },
  { value: '14+', label: 'Activités pédagogiques pour le parcours Explorateurs' },
  { value: '4', label: "Parcours d'âge distincts, du tout-petit au lycéen" },
  { value: '🇫🇷', label: 'Données hébergées en France, conformes RGPD' },
];
