export default function AventuriersStubPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold text-indigo-900">Les Aventuriers — bientôt disponible</h1>
      <p className="text-indigo-800">Le parcours 10-14 ans arrive prochainement.</p>
      <p className="text-xs text-indigo-700">childId : {params.childId}</p>
    </main>
  );
}
