import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Elevo gratuit et commencez l'évaluation personnalisée de votre enfant en 10 minutes.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
