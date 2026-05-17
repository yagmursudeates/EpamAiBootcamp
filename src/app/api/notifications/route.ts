import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/db';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const notifications = db
    .prepare(
      `SELECT id, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
    .all(session.user.id);

  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 422 });
  }

  if (typeof body !== 'object' || body === null || !(body as Record<string, unknown>).markAllRead) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 422 });
  }

  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(session.user.id);

  return NextResponse.json({ ok: true });
}
