"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700 flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl mb-6 animate-bounce">🔍</div>
      <h1 className="text-6xl font-black text-white mb-4">404</h1>
      <p className="text-xl text-white/80 mb-2 font-bold">Page introuvable !</p>
      <p className="text-white/60 mb-10 max-w-sm">
        Oups, cette page n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/parent"
          className="bg-white text-violet-700 font-black px-8 py-4 rounded-2xl hover:bg-violet-50 transition-colors"
        >
          Espace parent
        </Link>
        <Link
          href="/"
          className="bg-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
