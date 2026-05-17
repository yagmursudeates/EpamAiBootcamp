import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db';
import { evaluationSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 422 });
  }

  const parsed = evaluationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  const { id: ideaId } = await params;
  const db = getDb();

  const idea = db
    .prepare('SELECT id, title, submitter_id FROM ideas WHERE id = ?')
    .get(ideaId) as { id: string; title: string; submitter_id: string } | undefined;

  if (!idea) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { status, notes } = parsed.data;
  const now = new Date().toISOString();
  const evaluationId = randomUUID();
  const notificationId = randomUUID();
  const message = `Your idea "${idea.title}" has been ${status}`;

  const runTransaction = db.transaction(() => {
    db.prepare('UPDATE ideas SET status = ?, updated_at = ? WHERE id = ?').run(
      status,
      now,
      ideaId
    );

    db.prepare(
      `INSERT OR REPLACE INTO evaluations (id, idea_id, evaluator_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(evaluationId, ideaId, session.user.id, notes ?? null, now);

    db.prepare(
      `INSERT INTO notifications (id, user_id, message, is_read, created_at)
       VALUES (?, ?, ?, 0, ?)`
    ).run(notificationId, idea.submitter_id, message, now);
  });

  runTransaction();

  const updatedIdea = db
    .prepare(
      `SELECT i.id, i.title, i.status, e.notes AS evaluation_notes
       FROM ideas i
       LEFT JOIN evaluations e ON e.idea_id = i.id
       WHERE i.id = ?`
    )
    .get(ideaId) as { id: string; title: string; status: string; evaluation_notes: string | null };

  return NextResponse.json({ idea: updatedIdea }, { status: 200 });
}
