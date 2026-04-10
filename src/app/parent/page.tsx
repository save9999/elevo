import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-wider text-slate-500">Dashboard parent</p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Bonjour {session.user.name ?? session.user.email} 👋
      </h1>
      <p className="text-slate-600">
        Le dashboard parent sera construit dans le Plan 5.
      </p>
    </main>
  );
}
