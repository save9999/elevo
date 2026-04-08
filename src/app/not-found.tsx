import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FEFCF9" }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-200/25 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-rose-200/20 blur-[90px]" />

      <div className="text-center relative max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">🔍</span>
        </div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-violet-600 mb-4">Erreur 404</p>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">Page introuvable</h1>
        <p className="text-stone-500 text-[15px] leading-relaxed mb-10">
          Cette page n&apos;existe pas ou a été déplacée. Retournez vers un terrain connu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-violet-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-violet-700 transition-all hover:shadow-lg hover:shadow-violet-500/25 text-sm"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/parent"
            className="bg-white text-stone-700 border border-stone-200 px-8 py-3.5 rounded-full font-semibold hover:border-stone-300 hover:shadow-lg transition-all text-sm"
          >
            Espace parent
          </Link>
        </div>
      </div>
    </div>
  );
}
