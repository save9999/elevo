import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Elevo",
  description: "Politique de confidentialité d'Elevo. Protection des données personnelles et respect du RGPD pour les familles et enfants.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FEFCF9" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-stone-200/50" style={{ background: "rgba(254,252,249,0.82)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">E</div>
            <span className="font-bold text-lg text-stone-800 tracking-tight">Elevo</span>
          </Link>
          <Link href="/" className="text-[13px] font-semibold text-stone-500 hover:text-stone-900 transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">Politique de confidentialité</h1>
        <p className="text-stone-400 text-sm mb-12">Dernière mise à jour : avril 2026</p>

        <div className="prose-custom space-y-10">
          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">1. Introduction</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo (ci-après &laquo; nous &raquo;, &laquo; notre &raquo;) s&apos;engage fermement à protéger la vie privée des utilisateurs de sa plateforme, en particulier celle des enfants mineurs. Cette politique explique quelles données nous collectons, pourquoi nous les collectons, et comment nous les protégeons, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">2. Données collectées</h2>
            <p className="text-stone-600 leading-relaxed mb-3">Nous collectons les catégories suivantes de données :</p>
            <ul className="space-y-2 text-stone-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span><strong>Données du parent :</strong> nom, adresse email, mot de passe (hashé).</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span><strong>Données de l&apos;enfant :</strong> prénom, date de naissance, tranche d&apos;âge, avatar choisi.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span><strong>Données d&apos;apprentissage :</strong> scores, sessions, progression, résultats d&apos;évaluation, plan personnalisé.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span><strong>Données techniques :</strong> cookies de session, journaux d&apos;accès.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">3. Finalités du traitement</h2>
            <p className="text-stone-600 leading-relaxed">
              Les données sont utilisées exclusivement pour : fournir les services d&apos;apprentissage adaptatif, personnaliser le parcours pédagogique de l&apos;enfant, détecter d&apos;éventuels troubles d&apos;apprentissage, et permettre aux parents de suivre la progression. Aucune donnée n&apos;est vendue ou partagée à des tiers à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">4. Base légale</h2>
            <p className="text-stone-600 leading-relaxed">
              Le traitement repose sur le consentement du parent (article 6.1.a du RGPD), l&apos;exécution du contrat de service (article 6.1.b), et notre intérêt légitime à améliorer nos services (article 6.1.f). Pour les enfants de moins de 15 ans, le consentement parental est requis conformément à l&apos;article 8 du RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">5. Sécurité des données</h2>
            <p className="text-stone-600 leading-relaxed">
              Nous mettons en oeuvre des mesures de sécurité avancées : chiffrement des mots de passe (bcrypt), connexions HTTPS, base de données hébergée en Europe, tokens JWT sécurisés. L&apos;accès aux données est strictement limité aux personnes habilitées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">6. Conservation des données</h2>
            <p className="text-stone-600 leading-relaxed">
              Les données sont conservées pendant la durée d&apos;utilisation active du compte, puis supprimées dans un délai de 12 mois après la dernière connexion. Le parent peut demander la suppression immédiate de l&apos;ensemble des données à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">7. Vos droits</h2>
            <p className="text-stone-600 leading-relaxed">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de portabilité et d&apos;opposition au traitement de vos données. Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée dans la page Contact.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">8. Intelligence artificielle</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo utilise l&apos;IA (Claude par Anthropic) pour générer des exercices et analyser les résultats. Les conversations avec l&apos;IA sont traitées en temps réel et ne sont pas stockées par le fournisseur d&apos;IA. Seuls les résultats agrégés sont enregistrés dans le profil de l&apos;enfant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">9. Cookies</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session d&apos;authentification). Aucun cookie de tracking ou publicitaire n&apos;est utilisé.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-400">
            Pour toute question relative à vos données personnelles, <Link href="/contact" className="text-violet-600 hover:text-violet-700 font-medium">contactez-nous</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
