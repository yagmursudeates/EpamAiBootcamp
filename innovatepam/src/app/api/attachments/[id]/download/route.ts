import path from 'path'
import fs from 'fs'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import type { DbAttachment, DbIdea } from '@/types/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const attachment = db
      .prepare('SELECT * FROM attachments WHERE id = ?')
      .get(id) as DbAttachment | undefined

    if (!attachment) return Response.json({ error: 'Not found' }, { status: 404 })

    const idea = db
      .prepare('SELECT * FROM ideas WHERE id = ?')
      .get(attachment.idea_id) as DbIdea | undefined

    if (!idea) return Response.json({ error: 'Not found' }, { status: 404 })

    // Only owner or admin can download
    if (session.user.role !== 'admin' && idea.submitter_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!fs.existsSync(attachment.filepath)) {
      return Response.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(attachment.filepath)

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': attachment.mimetype,
        'Content-Disposition': `attachment; filename="${attachment.filename}"`,
        'Content-Length': String(attachment.size),
      },
    })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
