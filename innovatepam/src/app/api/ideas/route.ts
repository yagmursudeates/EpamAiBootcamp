import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { IdeaSchema, DraftSchema } from '@/lib/validations'
import type { DbIdea } from '@/types/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    let ideas: DbIdea[]

    if (session.user.role === 'admin') {
      ideas = db
        .prepare(
          `SELECT i.*, u.name as submitter_name FROM ideas i
           JOIN users u ON u.id = i.submitter_id
           WHERE i.status != 'draft'
           ORDER BY i.created_at DESC`
        )
        .all() as DbIdea[]
    } else {
      ideas = db
        .prepare(
          `SELECT * FROM ideas WHERE submitter_id = ? ORDER BY created_at DESC`
        )
        .all(session.user.id) as DbIdea[]
    }

    return Response.json({ ideas })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Use DraftSchema when saving as draft (allows missing fields), IdeaSchema otherwise
    const isDraft = body.status === 'draft'
    const schema = isDraft ? DraftSchema : IdeaSchema
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, description, category, categoryMetadata, isAnonymous } = parsed.data
    const status = isDraft ? 'draft' : 'submitted'
    const id = uuidv4()

    db.prepare(
      `INSERT INTO ideas (id, title, description, category, category_metadata, is_anonymous, status, submitter_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      title,
      description ?? '',
      category ?? null,
      categoryMetadata ? JSON.stringify(categoryMetadata) : null,
      isAnonymous ? 1 : 0,
      status,
      session.user.id
    )

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as DbIdea

    return Response.json({ idea }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
