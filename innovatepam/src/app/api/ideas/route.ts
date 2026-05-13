import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { IdeaSchema } from '@/lib/validations'
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
    const parsed = IdeaSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, description, category, categoryMetadata } = parsed.data
    const id = uuidv4()

    db.prepare(
      `INSERT INTO ideas (id, title, description, category, category_metadata, submitter_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      title,
      description,
      category,
      categoryMetadata ? JSON.stringify(categoryMetadata) : null,
      session.user.id
    )

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as DbIdea

    return Response.json({ idea }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
