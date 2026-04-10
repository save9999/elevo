import Link from 'next/link';

export default function CguPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Conditions générales d&apos;utilisation</h1>
        <p className="mt-2 text-sm text-slate-500">Version du 10 avril 2026 — bêta</p>

        <div className="mt-10 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-100">1. Objet</h2>
            <p className="mt-3 leading-relaxed">
              Elevo est une plateforme éducative adaptative pour enfants de 4 à 18 ans,
              proposant un parcours d&apos;apprentissage ludique accompagné d&apos;une
              intelligence artificielle (LUMO) et d&apos;outils de repérage bienveillant
              des signes de troubles dys.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">
              2. Ce qu&apos;Elevo n&apos;est pas
            </h2>
            <p className="mt-3 leading-relaxed">
              <strong>Elevo n&apos;établit aucun diagnostic médical.</strong> Les outils de
              repérage proposés par Elevo, y compris les bilans du Cabinet de LUMO, sont des
              aides à la décision pour les parents et les professionnels de santé. Ils ne
              remplacent en aucun cas la consultation d&apos;un·e orthophoniste, d&apos;un·e
              neuropsychologue ou d&apos;un·e médecin. Si vous observez des signes
              persistants chez votre enfant, nous vous recommandons vivement de consulter
              un professionnel de santé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">3. Inscription et compte</h2>
            <p className="mt-3 leading-relaxed">
              L&apos;inscription est réservée aux personnes majeures exerçant
              l&apos;autorité parentale sur un enfant, ou aux professionnels de santé
              titulaires d&apos;un numéro ADELI ou RPPS (mode pro).
            </p>
            <p className="mt-3 leading-relaxed">
              Les enfants n&apos;ont pas de compte distinct : ils se connectent via
              l&apos;espace parent. Aucune donnée personnelle de l&apos;enfant n&apos;est
              communiquée à des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">
              4. Utilisation de l&apos;intelligence artificielle
            </h2>
            <p className="mt-3 leading-relaxed">
              LUMO est une interface conversationnelle pilotée par des modèles de langage
              (actuellement Anthropic Claude). Les interactions de l&apos;enfant peuvent
              être envoyées à ce modèle pour générer des encouragements et des
              explications adaptés. Aucun contenu d&apos;entraînement n&apos;est envoyé
              aux éditeurs de modèles au-delà du cadre de l&apos;exécution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">5. Résiliation</h2>
            <p className="mt-3 leading-relaxed">
              Vous pouvez supprimer votre compte et toutes les données associées
              (y compris celles de vos enfants) à tout moment depuis votre espace parent.
              La suppression est définitive et effective sous 7 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">6. Droit applicable</h2>
            <p className="mt-3 leading-relaxed">
              Les présentes conditions sont soumises au droit français. Tout litige sera
              soumis aux juridictions compétentes de Paris.
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-slate-800 pt-6 text-xs text-slate-600">
          Elevo — Document de travail en bêta. Ces CGU seront revues par un juriste avant
          ouverture publique du service.
        </div>
      </div>
    </main>
  );
}
