import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe Elevo pour toute question sur la plateforme éducative IA. Réponse sous 48h.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
