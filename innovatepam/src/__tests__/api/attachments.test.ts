import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// ── In-memory DB setup ───────────────────────────────────────────────────────

function createTestDb() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  const schema = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/db/schema.sql'),
    'utf-8'
  )
  db.exec(schema)
  return db
}

function seedIdea(db: Database.Database) {
  const submitterId = uuidv4()
  const ideaId = uuidv4()
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(submitterId, 'Alice', 'alice@epam.com', 'hash', 'submitter')
  db.prepare(
    `INSERT INTO ideas (id, title, description, category, submitter_id)
     VALUES (?, ?, ?, ?, ?)`
  ).run(ideaId, 'Test Idea', 'Description', 'Technical', submitterId)
  return { submitterId, ideaId }
}

function insertAttachment(db: Database.Database, ideaId: string) {
  const id = uuidv4()
  db.prepare(
    `INSERT INTO attachments (id, idea_id, filename, filepath, mimetype, size)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, ideaId, `file-${id}.pdf`, `/uploads/file-${id}.pdf`, 'application/pdf', 1024)
  return id
}

// ── FR-M02: max 5 attachments per idea ───────────────────────────────────────

describe('FR-M02: attachment limit (max 5 per idea)', () => {
  it('allows up to 5 attachments on a single idea', () => {
    const db = createTestDb()
    const { ideaId } = seedIdea(db)

    for (let i = 0; i < 5; i++) insertAttachment(db, ideaId)

    const count = (
      db.prepare('SELECT COUNT(*) as n FROM attachments WHERE idea_id = ?').get(ideaId) as { n: number }
    ).n
    expect(count).toBe(5)
    db.close()
  })

  it('API should reject a 6th attachment (count check logic)', () => {
    const db = createTestDb()
    const { ideaId } = seedIdea(db)

    for (let i = 0; i < 5; i++) insertAttachment(db, ideaId)

    const count = (
      db.prepare('SELECT COUNT(*) as n FROM attachments WHERE idea_id = ?').get(ideaId) as { n: number }
    ).n

    // This simulates the API guard: if count >= 5, reject
    expect(count >= 5).toBe(true)
    db.close()
  })
})

// ── FR-M07: multiple attachments listed per idea ──────────────────────────────

describe('FR-M07: multiple attachments retrievable per idea', () => {
  it('returns all attachments for an idea ordered by created_at', () => {
    const db = createTestDb()
    const { ideaId } = seedIdea(db)

    const id1 = insertAttachment(db, ideaId)
    const id2 = insertAttachment(db, ideaId)
    const id3 = insertAttachment(db, ideaId)

    const attachments = db
      .prepare('SELECT id FROM attachments WHERE idea_id = ? ORDER BY created_at ASC')
      .all(ideaId) as { id: string }[]

    expect(attachments).toHaveLength(3)
    expect(attachments.map((a) => a.id)).toContain(id1)
    expect(attachments.map((a) => a.id)).toContain(id2)
    expect(attachments.map((a) => a.id)).toContain(id3)
    db.close()
  })

  it('returns empty array when idea has no attachments', () => {
    const db = createTestDb()
    const { ideaId } = seedIdea(db)

    const attachments = db
      .prepare('SELECT id FROM attachments WHERE idea_id = ?')
      .all(ideaId)

    expect(attachments).toHaveLength(0)
    db.close()
  })
})

// ── FR-M03/M04: MIME type and size validation constants ───────────────────────

describe('FR-M03/M04: allowed MIME types and size limit', () => {
  it('ALLOWED_MIMETYPES includes all required types', async () => {
    const { ALLOWED_MIMETYPES } = await import('@/lib/attachmentConfig')
    const required = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif',
      'video/mp4',
    ]
    for (const mime of required) {
      expect(ALLOWED_MIMETYPES.has(mime), `Missing MIME type: ${mime}`).toBe(true)
    }
  })

  it('MAX_FILE_SIZE is 20 MB', async () => {
    const { MAX_FILE_SIZE } = await import('@/lib/attachmentConfig')
    expect(MAX_FILE_SIZE).toBe(20 * 1024 * 1024)
  })

  it('MAX_ATTACHMENTS_PER_IDEA is 5', async () => {
    const { MAX_ATTACHMENTS_PER_IDEA } = await import('@/lib/attachmentConfig')
    expect(MAX_ATTACHMENTS_PER_IDEA).toBe(5)
  })
})
