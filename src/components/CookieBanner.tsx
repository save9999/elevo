'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'elevo-cookie-consent';

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
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border p-4"
      style={{
        borderColor: 'var(--border-default)',
        background: 'var(--bg-surface)',
        boxShadow: '0 20px 50px -20px rgba(11, 25, 48, 0.2)',
      }}
    >
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        Elevo n&apos;utilise que des <strong>cookies essentiels</strong> (session de
        connexion). Aucun tracking, aucune pub, aucun cookie tiers.{' '}
        <Link href="/confidentialite" className="underline" style={{ color: 'var(--accent)' }}>
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-full px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
