import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-wider text-slate-500">Mode Pro — Orthophoniste</p>
      <h1 className="text-3xl font-semibold">Cabinet LUMO</h1>
      <p className="text-slate-400">Le mode pro sera construit dans le Plan 9.</p>
    </main>
  );
}
