import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const siteUrl = "https://elevo-five.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Elevo — L'IA qui accompagne chaque enfant",
    template: "%s — Elevo",
  },
  description:
    "Elevo détecte les troubles d'apprentissage (dyslexie, TDAH, dyscalculie) et crée un parcours personnalisé pour chaque enfant de 3 à 18 ans. Scolaire, cognitif, émotionnel.",
  keywords: [
    "éducation IA", "troubles apprentissage", "dyslexie", "TDAH", "dyscalculie",
    "soutien scolaire", "enfant", "apprentissage adaptatif", "plateforme éducative",
    "intelligence artificielle éducation", "Elevo", "maternelle", "primaire", "collège", "lycée",
  ],
  authors: [{ name: "Elevo" }],
  creator: "Elevo",
  publisher: "Elevo",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Elevo",
    title: "Elevo — L'IA qui accompagne chaque enfant",
    description: "Détection des troubles d'apprentissage et parcours personnalisé IA pour les enfants de 3 à 18 ans.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Elevo — Plateforme éducative IA pour enfants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevo — L'IA qui accompagne chaque enfant",
    description: "Détection des troubles d'apprentissage et parcours IA personnalisé de 3 à 18 ans.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-slate-50 min-h-screen antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
