import Link from 'next/link';
import { IllustratedPlanet } from '@/components/cosmic/IllustratedPlanet';
import { LumoSphere } from '@/components/explorateurs/lumo/LumoSphere';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden sky-bg">
      {/* Soft decorative clouds */}
      <div
        className="pointer-events-none absolute -left-20 top-32 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: 'rgba(125, 211, 252, 0.5)', animation: 'cloud-drift 22s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute right-0 top-60 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: 'rgba(110, 231, 183, 0.4)', animation: 'cloud-drift-2 26s ease-in-out infinite' }}
      />

      {/* Top nav */}
      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Mark />
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Elevo
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="#parcours"
            className="hidden font-medium transition hover:text-[var(--accent)] sm:block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Parcours
          </a>
          <a
            href="#approche"
            className="hidden font-medium transition hover:text-[var(--accent)] sm:block"
            style={{ color: 'var(--text-secondary)' }}
          >
            Approche
          </a>
          <Link
            href="/login"
            className="rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 10px 30px -10px var(--accent-glow)',
            }}
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-20 mx-auto max-w-7xl px-8 pt-16 pb-24 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Left — text */}
          <div>
            <div
              className="reveal reveal-1 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
              style={{
                borderColor: 'var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--accent)',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--green-bright)' }}
              />
              Plateforme éducative · 4 à 18 ans
            </div>

            <h1 className="reveal reveal-2 mt-8 text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              <span style={{ color: 'var(--text-primary)' }}>Apprendre</span>
              <br />
              <span className="serif-italic" style={{ color: 'var(--accent)' }}>
                à son rythme
              </span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>
                dans une station <span style={{ color: 'var(--green)' }}>vivante</span>.
              </span>
            </h1>

            <p
              className="reveal reveal-3 mt-8 max-w-xl text-lg leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Six planètes à explorer. Des exercices qui s&apos;adaptent à chaque âge,
              de la maternelle au lycée. Un repérage en douceur des signes de
              troubles dys, guidé par <strong style={{ color: 'var(--text-primary)' }}>LUMO</strong>,
              une intelligence artificielle bienveillante.
            </p>

            <div className="reveal reveal-4 mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-full px-7 py-4 text-base font-semibold text-white transition hover:translate-y-[-1px]"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 16px 40px -12px var(--accent-glow)',
                }}
              >
                Embarquer gratuitement
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-base font-semibold transition hover:text-[var(--accent)]"
                style={{ color: 'var(--text-primary)' }}
              >
                J&apos;ai déjà un compte
                <span className="text-sm">→</span>
              </Link>
            </div>

            <div
              className="reveal reveal-5 mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <span>✓ Gratuit pour les familles</span>
              <span>✓ Protocoles inspirés ODEDYS &amp; Alouette</span>
              <span>✓ Données hébergées en France</span>
            </div>
          </div>

          {/* Right — planetary showcase */}
          <div className="reveal reveal-3 relative flex items-center justify-center">
            <div className="relative h-[460px] w-[460px]">
              {/* Orbit rings */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px dashed var(--border-default)' }}
              />
              <div
                className="absolute inset-10 rounded-full"
                style={{ border: '1px solid var(--border-subtle)' }}
              />
              {/* Center LUMO */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <LumoSphere mood="happy" size="lg" />
              </div>
              {/* Decorative planets around */}
              <div className="absolute left-0 top-10">
                <IllustratedPlanet kind="lettres" size={90} />
              </div>
              <div className="absolute right-0 top-16">
                <IllustratedPlanet kind="nombres" size={70} />
              </div>
              <div className="absolute bottom-10 left-20">
                <IllustratedPlanet kind="memoire" size={80} />
              </div>
              <div className="absolute bottom-0 right-16">
                <IllustratedPlanet kind="espace" size={75} />
              </div>
              <div className="absolute right-8 top-56">
                <IllustratedPlanet kind="langage" size={60} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parcours section */}
      <section
        id="parcours"
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-24">
          <div className="mb-16 max-w-2xl">
            <p className="eyebrow">
              <span className="divider" /> Quatre parcours
            </p>
            <h2
              className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Une expérience pensée
              <br />
              <span className="serif-italic" style={{ color: 'var(--accent)' }}>
                pour chaque âge
              </span>
              .
            </h2>
            <p
              className="mt-5 text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Du tout-petit en maternelle au lycéen en première, chaque tranche d&apos;âge
              a son hub planétaire — avec des activités, un vocabulaire et des outils
              adaptés.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PARCOURS.map((p, i) => (
              <article
                key={p.number}
                className={`reveal reveal-${i + 4} group relative overflow-hidden rounded-2xl border p-6 transition hover:translate-y-[-2px] hover:border-[var(--accent)]`}
                style={{
                  borderColor: 'var(--border-default)',
                  background: 'var(--bg-surface)',
                  boxShadow: '0 4px 12px -4px rgba(11, 25, 48, 0.04)',
                }}
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: 'var(--accent-pale)' }}
                >
                  <IllustratedPlanet kind={p.planetKind} size={46} />
                </div>
                <p
                  className="font-mono text-xs font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {p.number} · {p.age}
                </p>
                <h3
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {p.name}
                </h3>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {p.description}
                </p>
                <div
                  className="mt-4 text-xs font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  {p.focus}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Approche scientifique */}
      <section id="approche" className="relative z-20">
        <div className="mx-auto max-w-7xl px-8 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="eyebrow">
                <span className="divider" /> L&apos;approche
              </p>
              <h2
                className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Adossé à la recherche,
                <br />
                <span className="serif-italic" style={{ color: 'var(--green)' }}>
                  validé par la pratique
                </span>
                .
              </h2>
              <p
                className="mt-6 max-w-lg text-base leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Les protocoles d&apos;Elevo s&apos;inspirent des outils de
                référence utilisés par les orthophonistes : ODEDYS, Alouette,
                Corsi, batteries de subitisation. Aucun diagnostic n&apos;est
                posé par l&apos;application — l&apos;objectif est d&apos;alerter
                en douceur et d&apos;orienter vers un·e professionnel·le.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: 'var(--border-default)',
                    background: 'var(--bg-surface)',
                    boxShadow: '0 4px 12px -4px rgba(11, 25, 48, 0.04)',
                  }}
                >
                  <p
                    className="font-mono text-3xl font-semibold tracking-tight"
                    style={{ color: 'var(--accent)' }}
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

      {/* CTA final */}
      <section
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-24">
          <div
            className="relative overflow-hidden rounded-3xl border p-12 text-center sm:p-16"
            style={{
              borderColor: 'var(--border-default)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
            }}
          >
            <div
              className="absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-30 blur-3xl"
              style={{ background: 'var(--accent-soft)' }}
            />
            <div
              className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-30 blur-3xl"
              style={{ background: 'var(--green-soft)' }}
            />
            <div className="relative">
              <p className="eyebrow">
                <span className="divider" /> Commencer
              </p>
              <h2
                className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Donnez à votre enfant un{' '}
                <span className="serif-italic" style={{ color: 'var(--accent)' }}>
                  tutorat à sa hauteur
                </span>
                .
              </h2>
              <p
                className="mx-auto mt-6 max-w-xl text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                Création de compte en moins d&apos;une minute, premier parcours accessible
                immédiatement.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-full px-8 py-4 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 16px 40px -12px var(--accent-glow)',
                  }}
                >
                  Créer un compte gratuit
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold transition hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Se connecter →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <Mark />
                <span className="text-base font-bold">Elevo</span>
              </Link>
              <p
                className="mt-3 max-w-xs text-xs leading-relaxed"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Plateforme éducative adaptative pour les 4-18 ans. Données
                hébergées en France. Aucun diagnostic médical.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
              <div>
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Produit
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/login" style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--accent)]">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--accent)]">
                      Créer un compte
                    </Link>
                  </li>
                  <li>
                    <Link href="/pro" style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--accent)]">
                      Mode pro
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Légal
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/cgu" style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--accent)]">
                      CGU
                    </Link>
                  </li>
                  <li>
                    <Link href="/confidentialite" style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--accent)]">
                      Confidentialité
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:contact@elevo.local" style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--accent)]">
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

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="24" height="24" rx="7" fill="var(--accent-pale)" />
      <rect
        x="2"
        y="2"
        width="24"
        height="24"
        rx="7"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      <circle cx="14" cy="14" r="5" fill="var(--accent)" />
      <circle cx="16" cy="12" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
}

const PARCOURS = [
  {
    number: '01',
    name: 'Petits',
    age: '4 — 6 ans',
    description:
      "Maternelle. Voix off guidée, découverte des lettres, nombres et couleurs sans lecture requise.",
    focus: '3 planètes · sans lecture',
    planetKind: 'memoire' as const,
  },
  {
    number: '02',
    name: 'Explorateurs',
    age: '6 — 10 ans',
    description:
      "CP à CM2. Six planètes, quatorze activités. Cœur du repérage des troubles dys.",
    focus: '6 planètes · 14 activités',
    planetKind: 'lettres' as const,
  },
  {
    number: '03',
    name: 'Aventuriers',
    age: '10 — 14 ans',
    description:
      "Collège. Remédiation et compensation pour les enfants déjà diagnostiqués dys.",
    focus: '6 planètes · rééducation',
    planetKind: 'nombres' as const,
  },
  {
    number: '04',
    name: 'Lycéens',
    age: '14 — 18 ans',
    description:
      "Lycée. Entraînement et méthodologie pour compenser les troubles dys jusqu'au bac.",
    focus: '6 planètes · bac',
    planetKind: 'espace' as const,
  },
];

const STATS = [
  { value: '5', label: 'Protocoles dys standardisés (Alouette, ODEDYS, Corsi…)' },
  { value: '14+', label: 'Activités pédagogiques dans chaque parcours' },
  { value: '4', label: "Parcours d'âge, du tout-petit au lycéen" },
  { value: '🇫🇷', label: 'Données hébergées en France, conformes RGPD' },
];
