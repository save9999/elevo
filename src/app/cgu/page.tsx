import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Elevo",
  description: "CGU d'Elevo. Conditions d'utilisation de la plateforme éducative IA pour enfants de 3 à 18 ans.",
};

export default function CGUPage() {
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
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">Conditions Générales d&apos;Utilisation</h1>
        <p className="text-stone-400 text-sm mb-12">Dernière mise à jour : avril 2026</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">1. Objet</h2>
            <p className="text-stone-600 leading-relaxed">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) définissent les modalités d&apos;accès et d&apos;utilisation de la plateforme Elevo, accessible à l&apos;adresse elevo-five.vercel.app. Elevo est une plateforme éducative utilisant l&apos;intelligence artificielle pour accompagner les enfants de 3 à 18 ans dans leur développement cognitif, scolaire et émotionnel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">2. Inscription et comptes</h2>
            <p className="text-stone-600 leading-relaxed mb-3">
              L&apos;accès aux services nécessite la création d&apos;un compte parent. En vous inscrivant, vous certifiez :
            </p>
            <ul className="space-y-2 text-stone-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span>Être majeur (18 ans ou plus) et parent ou tuteur légal de l&apos;enfant inscrit.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span>Fournir des informations exactes et à jour.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" /><span>Être responsable de la confidentialité de vos identifiants.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">3. Services proposés</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo propose des modules d&apos;apprentissage adaptatifs (lecture, mathématiques, mémoire, émotions, etc.), des évaluations de dépistage de troubles d&apos;apprentissage, un compagnon IA interactif (Lumo), un système de gamification (XP, niveaux, badges), et un tableau de bord parent pour le suivi de la progression.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">4. Offres et tarification</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo propose une offre gratuite et des offres payantes. Les tarifs sont indiqués en euros TTC sur la page Tarifs. L&apos;abonnement est sans engagement et résiliable à tout moment. Aucune carte bancaire n&apos;est requise pour l&apos;offre gratuite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">5. Utilisation acceptable</h2>
            <p className="text-stone-600 leading-relaxed">
              Vous vous engagez à utiliser Elevo conformément à sa destination éducative. Il est interdit de : tenter d&apos;accéder à des données d&apos;autres utilisateurs, utiliser la plateforme à des fins commerciales non autorisées, contourner les mesures de sécurité, ou soumettre du contenu inapproprié via les interfaces de chat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">6. Intelligence artificielle</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo utilise Claude (Anthropic) comme moteur d&apos;IA. Les résultats d&apos;évaluation sont fournis à titre informatif et ne constituent en aucun cas un diagnostic médical. En cas de suspicion de trouble d&apos;apprentissage, nous recommandons vivement de consulter un professionnel de santé qualifié (orthophoniste, psychologue, neuropédiatre).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">7. Propriété intellectuelle</h2>
            <p className="text-stone-600 leading-relaxed">
              L&apos;ensemble des contenus de la plateforme (textes, illustrations, code, design, logo, Lumo) sont la propriété exclusive d&apos;Elevo et sont protégés par le droit de la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">8. Limitation de responsabilité</h2>
            <p className="text-stone-600 leading-relaxed">
              Elevo s&apos;efforce d&apos;assurer la disponibilité et la fiabilité de ses services. Toutefois, nous ne pouvons garantir un fonctionnement ininterrompu. Elevo ne saurait être tenu responsable des dommages indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">9. Résiliation</h2>
            <p className="text-stone-600 leading-relaxed">
              Vous pouvez supprimer votre compte à tout moment. Elevo se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, après notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-3">10. Droit applicable</h2>
            <p className="text-stone-600 leading-relaxed">
              Les présentes CGU sont soumises au droit français. En cas de litige, les parties s&apos;engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, les tribunaux compétents de Paris seront seuls compétents.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-400">
            Pour toute question, <Link href="/contact" className="text-violet-600 hover:text-violet-700 font-medium">contactez-nous</Link>. Voir aussi notre <Link href="/confidentialite" className="text-violet-600 hover:text-violet-700 font-medium">politique de confidentialité</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
