import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Elevo — L'IA qui accompagne chaque enfant",
  description:
    "La première plateforme IA qui détecte et accompagne tous les troubles d'apprentissage, développe les compétences de vie et prépare votre enfant pour l'avenir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
