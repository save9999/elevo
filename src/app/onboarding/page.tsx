import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeParcours, routeForChild } from '@/engine/onboarding/dispatch';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { childId?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const parentId = (session.user as { id: string }).id;
  const { childId } = searchParams;

  // Cas 1 : pas de childId → lister les enfants du parent
  if (!childId) {
    const children = await prisma.child.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
    if (children.length === 0) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-2xl font-semibold">Aucun enfant enregistré</h1>
          <p className="text-slate-600">
            Ajoute un premier enfant depuis ton dashboard parent pour commencer.
          </p>
          <a href="/parent" className="underline text-indigo-600">
            Aller au dashboard parent
          </a>
        </main>
      );
    }
    // Si un seul enfant → on dispatche directement
    if (children.length === 1) {
      const child = children[0];
      const parcours = child.parcours ?? computeParcours(child.birthdate);
      redirect(routeForChild({ id: child.id, parcours }));
    }
    // Sinon → choisir quel enfant (UI minimale pour le MVP)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold">Quel enfant rejoint la station ?</h1>
        <ul className="flex flex-col gap-2">
          {children.map((c) => (
            <li key={c.id}>
              <a
                href={`/onboarding?childId=${c.id}`}
                className="underline text-indigo-600"
              >
                {c.firstName}
              </a>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  // Cas 2 : childId fourni → dispatcher vers le bon parcours
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!child) {
    redirect('/parent');
  }

  const parcours = child.parcours ?? computeParcours(child.birthdate);
  redirect(routeForChild({ id: child.id, parcours }));
}
