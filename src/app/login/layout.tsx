import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace parent Elevo pour suivre les progrès de vos enfants.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
