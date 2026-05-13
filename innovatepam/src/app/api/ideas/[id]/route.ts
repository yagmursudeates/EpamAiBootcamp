import { auth } from '@/lib/auth'
import db from '@/lib/db'
import type { DbIdea, DbAttachment, DbEvaluation } from '@/types/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const idea = db
      .prepare(
        `SELECT i.*, u.name as submitter_name FROM ideas i
         JOIN users u ON u.id = i.submitter_id
         WHERE i.id = ?`
      )
      .get(id) as (DbIdea & { submitter_name: string }) | undefined

    if (!idea) return Response.json({ error: 'Not found' }, { status: 404 })

    // Submitters can only view their own ideas
    if (session.user.role !== 'admin' && idea.submitter_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admins cannot access draft ideas
    if (session.user.role === 'admin' && idea.status === 'draft') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const attachments = db
      .prepare('SELECT * FROM attachments WHERE idea_id = ?')
      .all(id) as DbAttachment[]

    const evaluation = db
      .prepare('SELECT * FROM evaluations WHERE idea_id = ?')
      .get(id) as DbEvaluation | undefined

    return Response.json({ idea, attachments, evaluation })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
