/**
 * Fond étoilé multi-couches pour la Station Spatiale.
 *
 * 3 couches d'étoiles à densités et tailles différentes, chacune avec un
 * rythme de twinkle légèrement différent pour un effet organique.
 */
export function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Couche 1 — fines étoiles lointaines */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 13% 17%, white, transparent 50%),
            radial-gradient(1px 1px at 27% 63%, white, transparent 50%),
            radial-gradient(1px 1px at 42% 22%, white, transparent 50%),
            radial-gradient(1px 1px at 58% 81%, white, transparent 50%),
            radial-gradient(1px 1px at 73% 14%, white, transparent 50%),
            radial-gradient(1px 1px at 85% 47%, white, transparent 50%),
            radial-gradient(1px 1px at 91% 73%, white, transparent 50%),
            radial-gradient(1px 1px at 6% 88%, white, transparent 50%),
            radial-gradient(1px 1px at 36% 36%, white, transparent 50%),
            radial-gradient(1px 1px at 67% 58%, white, transparent 50%)
          `,
        }}
      />
      {/* Couche 2 — étoiles moyennes avec twinkle lent */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          animation: 'star-twinkle 6s ease-in-out infinite',
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 21% 41%, #e0e7ff, transparent 50%),
            radial-gradient(1.5px 1.5px at 54% 29%, #ddd6fe, transparent 50%),
            radial-gradient(1.5px 1.5px at 78% 88%, #e0f2fe, transparent 50%),
            radial-gradient(1.5px 1.5px at 11% 72%, #e0e7ff, transparent 50%),
            radial-gradient(1.5px 1.5px at 44% 54%, #ddd6fe, transparent 50%)
          `,
        }}
      />
      {/* Couche 3 — grosses étoiles brillantes avec twinkle plus rapide */}
      <div
        className="absolute inset-0"
        style={{
          animation: 'star-twinkle 3.5s ease-in-out infinite',
          backgroundImage: `
            radial-gradient(2.5px 2.5px at 30% 20%, #ffffff, transparent 50%),
            radial-gradient(2.5px 2.5px at 70% 65%, #c7d2fe, transparent 50%),
            radial-gradient(2.5px 2.5px at 85% 25%, #ffffff, transparent 50%)
          `,
        }}
      />
      {/* Nébuleuses en fond */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl drift-slow" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-[460px] w-[460px] rounded-full bg-fuchsia-500/10 blur-3xl drift-slow" />
    </div>
  );
}
