export default function LyceensStubPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Lycéens — bientôt disponible</h1>
      <p className="text-slate-700">Le parcours 14-18 ans arrive prochainement.</p>
      <p className="text-xs text-slate-500">childId : {params.childId}</p>
    </main>
  );
}
