import Link from 'next/link';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { LumoSphere } from '@/components/explorateurs/lumo/LumoSphere';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden grain">
      <CosmicBackground variant="default" />

      {/* Top nav */}
      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <LumoSphere mood="idle" size="sm" />
          <span className="editorial-italic text-2xl" style={{ color: 'var(--paper)' }}>
            Elevo
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/cgu" style={{ color: 'var(--paper-muted)' }} className="hover:text-[var(--gold)]">
            CGU
          </Link>
          <Link
            href="/login"
            className="rounded-full border px-5 py-2 transition hover:border-[var(--cyan)]"
            style={{
              borderColor: 'var(--ink-500)',
              color: 'var(--paper)',
            }}
          >
            Se connecter
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-20 mx-auto max-w-7xl px-8 pt-12 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Left — editorial title */}
          <div>
            <p className="eyebrow reveal reveal-1">
              <span className="deco-rule" />
              Une plateforme éducative · 4 — 18 ans
            </p>

            <h1 className="reveal reveal-2 mt-6 text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.04em]">
              <span className="block" style={{ color: 'var(--paper)' }}>
                Une station
              </span>
              <span
                className="block italic"
                style={{
                  background:
                    'linear-gradient(120deg, var(--gold) 20%, var(--magenta) 60%, var(--cyan) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                pour grandir
              </span>
              <span className="block" style={{ color: 'var(--paper)' }}>
                à son rythme.
              </span>
            </h1>

            <p
              className="reveal reveal-3 mt-8 max-w-xl text-lg leading-relaxed"
              style={{ color: 'var(--paper-muted)' }}
            >
              Six planètes, mille façons d&apos;apprendre.{' '}
              <em className="editorial-italic" style={{ color: 'var(--gold-bright)' }}>
                LUMO
              </em>
              , ton intelligence artificielle bienveillante, t&apos;accompagne pour
              repérer en douceur les signes de troubles dys et construire un parcours
              à ta mesure.
            </p>

            <div className="reveal reveal-4 mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full px-8 py-4 text-base font-medium transition hover:scale-[1.02]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%)',
                  color: 'var(--ink-900)',
                  boxShadow: '0 0 50px -10px var(--gold)',
                }}
              >
                Embarquer maintenant
              </Link>
              <Link
                href="/login"
                className="rounded-full border px-8 py-4 text-base font-medium transition hover:border-[var(--cyan)]"
                style={{
                  borderColor: 'var(--ink-500)',
                  color: 'var(--paper)',
                }}
              >
                J&apos;ai déjà un compte
              </Link>
            </div>

            {/* Trust line */}
            <div
              className="reveal reveal-5 mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
              style={{ color: 'var(--paper-dim)' }}
            >
              <span>★ Protocoles inspirés ODEDYS, Alouette</span>
              <span>·</span>
              <span>Mode pro orthophonistes</span>
              <span>·</span>
              <span>RGPD · données en France</span>
            </div>
          </div>

          {/* Right — LUMO hero portrait */}
          <div className="reveal reveal-3 relative flex items-center justify-center">
            <LumoSphere mood="happy" size="xl" />
          </div>
        </div>
      </section>

      {/* Pillar section */}
      <section
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--ink-700)' }}
      >
        <div className="mx-auto max-w-7xl px-8 py-24">
          <p className="eyebrow reveal reveal-6">
            <span className="deco-rule" />
            Trois piliers
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <article
                key={p.title}
                className={`reveal reveal-${i + 6} group relative overflow-hidden rounded-2xl border p-8 transition hover:translate-y-[-2px]`}
                style={{
                  borderColor: 'var(--ink-700)',
                  background:
                    'linear-gradient(180deg, var(--ink-800) 0%, var(--ink-900) 100%)',
                }}
              >
                <div
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-3xl"
                  style={{ background: p.glow }}
                />
                <p className="eyebrow" style={{ color: p.accent }}>
                  {p.eyebrow}
                </p>
                <h3
                  className="mt-4 editorial-italic text-3xl"
                  style={{ color: 'var(--paper)' }}
                >
                  {p.title}
                </h3>
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: 'var(--paper-muted)' }}
                >
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-20 border-t"
        style={{ borderColor: 'var(--ink-700)' }}
      >
        <div
          className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-8 py-8 text-xs"
          style={{ color: 'var(--paper-dim)' }}
        >
          <p className="editorial-italic">
            © Elevo — La station qui apprend avec toi.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/cgu" className="hover:text-[var(--gold)]">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/confidentialite" className="hover:text-[var(--gold)]">
              Confidentialité &amp; RGPD
            </Link>
            <a href="mailto:contact@elevo.local" className="hover:text-[var(--gold)]">
              Contact
            </a>
          </div>
        </div>
        <p
          className="mx-auto max-w-7xl px-8 pb-8 text-[0.65rem] italic"
          style={{ color: 'var(--paper-dim)' }}
        >
          Elevo n&apos;établit aucun diagnostic médical. Nous encourageons toujours à
          consulter un orthophoniste pour un bilan officiel.
        </p>
      </footer>
    </main>
  );
}

const PILLARS = [
  {
    eyebrow: 'Liberté',
    title: 'Explorer librement',
    body: "Pas de progression forcée, pas de score qui clignote. L'enfant choisit ses planètes et révèle ses forces et ses difficultés naturellement, à son rythme.",
    accent: 'var(--cyan)',
    glow: 'var(--cyan)',
  },
  {
    eyebrow: 'Bienveillance',
    title: 'Repérer en douceur',
    body: 'Observation discrète pendant le jeu, bilans standardisés au Cabinet quand tu les demandes. Jamais de diagnostic — toujours une orientation vers les bons professionnels.',
    accent: 'var(--gold)',
    glow: 'var(--gold)',
  },
  {
    eyebrow: 'Compagnie',
    title: 'Guidé par LUMO',
    body: "Voix off chaleureuse, ton adapté à l'enfant, encouragements pilotés par une intelligence artificielle pensée pour les enfants — pas pour les ingénieurs.",
    accent: 'var(--magenta)',
    glow: 'var(--magenta)',
  },
];
