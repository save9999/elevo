export default function ExplorateurStationPage({
  params,
}: {
  params: { childId: string };
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-wider text-slate-500">
        Station Elevo — parcours Explorateurs (6-10 ans)
      </p>
      <h1 className="text-3xl font-semibold">Bienvenue, petit·e astronaute ✨</h1>
      <p className="text-slate-400">
        Ici viendra le hub Station avec LUMO et les 6 planètes.
      </p>
      <p className="text-xs text-slate-600">childId : {params.childId}</p>
    </main>
  );
}
