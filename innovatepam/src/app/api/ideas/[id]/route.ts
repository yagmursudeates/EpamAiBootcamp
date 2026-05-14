import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { IdeaUpdateSchema } from '@/lib/validations'
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

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as DbIdea | undefined
    if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 })

    if (idea.submitter_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (idea.status !== 'draft') {
      return Response.json({ error: 'Only draft ideas can be edited' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = IdeaUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, description, category, categoryMetadata, status } = parsed.data

    db.prepare(
      `UPDATE ideas
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           category = COALESCE(?, category),
           category_metadata = COALESCE(?, category_metadata),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      title ?? null,
      description ?? null,
      category ?? null,
      categoryMetadata !== undefined ? JSON.stringify(categoryMetadata) : null,
      status ?? null,
      id
    )

    const updated = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as DbIdea
    return Response.json({ idea: updated })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
