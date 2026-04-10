import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-slate-500">Conforme RGPD — Version bêta 2026-04-10</p>

        <div className="mt-10 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-100">
              1. Qui est responsable de traitement ?
            </h2>
            <p className="mt-3 leading-relaxed">
              Elevo (nom commercial, société en cours de constitution) — responsable de
              traitement au sens du Règlement (UE) 2016/679. Un DPO sera désigné avant
              toute ouverture publique du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">2. Données collectées</h2>
            <p className="mt-3 leading-relaxed">
              Nous collectons uniquement ce qui est strictement nécessaire au service :
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 leading-relaxed">
              <li><strong>Parent :</strong> email, mot de passe chiffré, prénom</li>
              <li><strong>Enfant :</strong> prénom, date de naissance, parcours calculé</li>
              <li>
                <strong>Apprentissage :</strong> sessions de jeu, observations comportementales
                (signaux abstraits sans contenu nominatif), résultats de bilans
              </li>
              <li>
                <strong>Techniques :</strong> logs serveur minimaux pour la sécurité, pas de
                tracking publicitaire, pas de Google Analytics, pas de Facebook Pixel
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">
              3. Consentement parental obligatoire
            </h2>
            <p className="mt-3 leading-relaxed">
              Les données d&apos;enfants mineurs ne sont collectées qu&apos;avec le
              consentement explicite de leur représentant légal (parent). Ce consentement
              est recueilli lors de l&apos;ajout de l&apos;enfant au compte parent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">4. Base légale</h2>
            <p className="mt-3 leading-relaxed">
              Le traitement des données repose sur l&apos;exécution du contrat de service
              (article 6(1)(b) RGPD) et, pour les données d&apos;enfants mineurs, sur le
              consentement du représentant légal (article 6(1)(a) et article 8 RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">5. Hébergement</h2>
            <p className="mt-3 leading-relaxed">
              Toutes les données sont hébergées dans l&apos;Union Européenne (Vercel EU pour
              l&apos;application, Neon Frankfurt pour la base de données PostgreSQL).
              Aucune donnée n&apos;est transférée hors UE sans votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">
              6. Partage avec l&apos;intelligence artificielle
            </h2>
            <p className="mt-3 leading-relaxed">
              Les interactions avec LUMO (conversation, encouragements, interprétations de
              bilans) passent par l&apos;API Anthropic Claude. Seules les données nécessaires
              à la génération sont envoyées — jamais le prénom, l&apos;email ou l&apos;identité
              complète de l&apos;enfant. Anthropic s&apos;engage contractuellement à ne pas
              utiliser ces données pour entraîner ses modèles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">7. Vos droits</h2>
            <p className="mt-3 leading-relaxed">
              Conformément au RGPD, vous disposez à tout moment d&apos;un droit d&apos;accès,
              de rectification, d&apos;effacement, d&apos;opposition, de limitation et de
              portabilité de vos données et de celles de vos enfants. Vous pouvez exercer ces
              droits depuis votre espace parent ou en nous écrivant à{' '}
              <a href="mailto:privacy@elevo.local" className="text-indigo-300 underline">
                privacy@elevo.local
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">
              8. Durée de conservation
            </h2>
            <p className="mt-3 leading-relaxed">
              Les données sont conservées pendant toute la durée du compte. Après suppression,
              les données sont effacées sous 7 jours. Les sauvegardes techniques sont purgées
              sous 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">9. Cookies</h2>
            <p className="mt-3 leading-relaxed">
              Elevo utilise uniquement des cookies <strong>essentiels</strong> au
              fonctionnement du service (session d&apos;authentification). Aucun cookie
              publicitaire, de mesure d&apos;audience ou de profilage n&apos;est déposé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100">10. Réclamation</h2>
            <p className="mt-3 leading-relaxed">
              Vous disposez du droit d&apos;introduire une réclamation auprès de la CNIL
              (Commission nationale de l&apos;informatique et des libertés) si vous estimez
              que le traitement de vos données ne respecte pas la réglementation applicable.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
