import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const idea = db
    .prepare(
      `SELECT i.id, i.title, i.description, i.category, i.status, i.created_at, i.updated_at,
              i.submitter_id, e.notes AS evaluation_notes
       FROM ideas i
       LEFT JOIN evaluations e ON e.idea_id = i.id
       WHERE i.id = ?`
    )
    .get(id) as
    | {
        id: string;
        title: string;
        description: string;
        category: string;
        status: string;
        created_at: string;
        updated_at: string;
        submitter_id: string;
        evaluation_notes: string | null;
      }
    | undefined;

  if (!idea) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (idea.submitter_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ idea });
}
