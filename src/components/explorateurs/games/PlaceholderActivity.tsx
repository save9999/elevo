'use client';

import Link from 'next/link';
import { LumoSphere } from '../lumo/LumoSphere';

export function PlaceholderActivity({
  childId,
  planetSlug,
  activitySlug,
}: {
  childId: string;
  planetSlug: string;
  activitySlug: string;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-center text-slate-100">
      <LumoSphere mood="gentle" size="lg" />
      <h1 className="text-2xl font-bold">Cette activité arrive bientôt !</h1>
      <p className="max-w-md text-slate-400">
        LUMO prépare encore <code className="text-indigo-300">{activitySlug}</code> pour toi.
        En attendant, tu peux essayer une autre activité sur cette planète.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href={`/explorateurs/${childId}/planet/${planetSlug}`}
          className="rounded-full border border-slate-700 px-5 py-2 text-sm hover:border-slate-500"
        >
          Retour à la planète
        </Link>
        <Link
          href={`/explorateurs/${childId}`}
          className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium hover:bg-indigo-400"
        >
          Station
        </Link>
      </div>
    </main>
  );
}
