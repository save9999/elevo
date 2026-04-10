import type { Metadata, Viewport } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

const siteUrl = 'https://elevo-five.vercel.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/favicon.svg',
  },
  title: {
    default: 'Elevo — La Station éducative IA pour enfants',
    template: '%s — Elevo',
  },
  description:
    "Elevo accompagne les enfants de 4 à 18 ans avec un parcours éducatif adaptatif, un repérage bienveillant des signes de troubles dys (dyslexie, dyscalculie, dysorthographie) et des exercices d'orthophonie ludiques pilotés par LUMO, une IA holographique.",
  keywords: [
    'Elevo',
    'éducation IA',
    'dyslexie',
    'dyscalculie',
    'dysorthographie',
    'orthophonie',
    'repérage troubles dys',
    "aide aux devoirs",
    'enfant 4-18 ans',
    'soutien scolaire adaptatif',
  ],
  authors: [{ name: 'Elevo' }],
  creator: 'Elevo',
  publisher: 'Elevo',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Elevo',
    title: 'Elevo — La Station éducative IA pour enfants',
    description:
      "Parcours adaptatif de 4 à 18 ans, repérage bienveillant des troubles dys, exercices d'orthophonie. LUMO, l'IA qui accompagne chaque enfant.",
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Elevo — La Station éducative IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevo — La Station éducative IA',
    description:
      "Parcours adaptatif 4-18 ans, repérage des troubles dys, orthophonie ludique.",
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
