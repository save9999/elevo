export default function PetitsStubPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold text-amber-900">Les Petits — bientôt disponible</h1>
      <p className="text-amber-800">
        Le parcours 4-6 ans arrive prochainement.
      </p>
      <p className="text-xs text-amber-700">childId : {params.childId}</p>
    </main>
  );
}
