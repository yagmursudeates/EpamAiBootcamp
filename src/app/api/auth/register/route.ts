import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';
import { registrationSchema } from '@/lib/validations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 422 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  const { name, email, password } = parsed.data;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = randomUUID();

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, email, passwordHash, 'submitter');

  return NextResponse.json(
    { user: { id, name, email, role: 'submitter' } },
    { status: 201 }
  );
}
