import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/db';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const notification = db
    .prepare('SELECT id, user_id, message, is_read, created_at FROM notifications WHERE id = ?')
    .get(id) as
    | { id: string; user_id: string; message: string; is_read: number; created_at: string }
    | undefined;

  if (!notification) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // IDOR prevention: ownership check (ADR-002 security note)
  if (notification.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);

  const updated = db
    .prepare('SELECT id, user_id, message, is_read, created_at FROM notifications WHERE id = ?')
    .get(id) as { id: string; user_id: string; message: string; is_read: number; created_at: string };

  return NextResponse.json({ notification: updated });
}
