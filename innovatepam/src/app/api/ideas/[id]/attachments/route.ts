import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import type { DbIdea, DbAttachment } from '@/types/db'

const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/gif',
  'video/mp4',
])

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: ideaId } = await params

    const idea = db
      .prepare('SELECT * FROM ideas WHERE id = ?')
      .get(ideaId) as DbIdea | undefined

    if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 })

    // Only the idea owner can upload attachments
    if (idea.submitter_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only one attachment allowed per idea
    const existing = db
      .prepare('SELECT id FROM attachments WHERE idea_id = ?')
      .get(ideaId) as DbAttachment | undefined

    if (existing) {
      return Response.json({ error: 'Idea already has an attachment' }, { status: 409 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    if (!ALLOWED_MIMETYPES.has(file.type)) {
      return Response.json({ error: 'File type not allowed' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File too large (max 20MB)' }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name)
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(uploadsDir, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filepath, buffer)

    const attachmentId = uuidv4()
    db.prepare(
      `INSERT INTO attachments (id, idea_id, filename, filepath, mimetype, size)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(attachmentId, ideaId, file.name, filepath, file.type, file.size)

    return Response.json({ message: 'Uploaded' }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
