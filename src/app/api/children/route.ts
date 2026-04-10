import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeParcours } from '@/engine/onboarding/dispatch';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;
  const children = await prisma.child.findMany({
    where: { parentId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ children });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parentId = (session.user as { id: string }).id;

  let body: { firstName?: string; birthdate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const birthdateStr = body.birthdate;

  if (!firstName || firstName.length < 1 || firstName.length > 50) {
    return NextResponse.json({ error: 'invalid_firstName' }, { status: 400 });
  }
  if (!birthdateStr) {
    return NextResponse.json({ error: 'missing_birthdate' }, { status: 400 });
  }

  const birthdate = new Date(birthdateStr);
  if (isNaN(birthdate.getTime())) {
    return NextResponse.json({ error: 'invalid_birthdate' }, { status: 400 });
  }

  let parcours;
  try {
    parcours = computeParcours(birthdate);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      parentId,
      firstName,
      birthdate,
      parcours,
    },
  });

  return NextResponse.json({ child }, { status: 201 });
}
