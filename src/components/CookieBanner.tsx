'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'elevo-cookie-consent';

/**
 * Bandeau cookies minimal et conforme RGPD.
 *
 * Elevo n'utilise que des cookies **essentiels** (session auth), donc on ne
 * demande pas vraiment de consentement — mais on informe l'utilisateur.
 * Si on ajoute un jour des cookies analytiques, il faudra un vrai consent flow.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, ts: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <p className="text-sm text-slate-200">
        Elevo n&apos;utilise que des <strong>cookies essentiels</strong> (session de
        connexion). Aucun tracking, aucune pub, aucun cookie tiers.{' '}
        <Link href="/confidentialite" className="text-indigo-300 underline">
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
