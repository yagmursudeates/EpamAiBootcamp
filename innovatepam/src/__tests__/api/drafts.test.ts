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

function seedUser(db: Database.Database, role: 'submitter' | 'admin' = 'submitter') {
  const id = uuidv4()
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(id, 'Test User', `${id}@epam.com`, 'hash', role)
  return id
}

function insertIdea(
  db: Database.Database,
  submitterId: string,
  status: 'submitted' | 'draft' = 'submitted',
  title = 'My Idea'
) {
  const id = uuidv4()
  db.prepare(
    `INSERT INTO ideas (id, title, description, category, status, submitter_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, title, 'Description', 'Technical', status, submitterId)
  return id
}

// ── FR-020: Save as draft ─────────────────────────────────────────────────────

describe('FR-020: draft creation', () => {
  it('inserts an idea with status draft when status param is draft', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    const id = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, status, submitter_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, 'Draft Idea', 'WIP', 'Technical', 'draft', submitterId)

    const idea = db.prepare('SELECT status FROM ideas WHERE id = ?').get(id) as { status: string }
    expect(idea.status).toBe('draft')
    db.close()
  })

  it('defaults to submitted when no status is provided', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    const id = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, submitter_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, 'Submitted Idea', 'Done', 'Technical', submitterId)

    const idea = db.prepare('SELECT status FROM ideas WHERE id = ?').get(id) as { status: string }
    expect(idea.status).toBe('submitted')
    db.close()
  })
})

// ── FR-020: Edit & promote draft ─────────────────────────────────────────────

describe('FR-020: draft editing', () => {
  it('updates title and description of a draft', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    const id = insertIdea(db, submitterId, 'draft', 'Original Title')

    db.prepare(
      `UPDATE ideas SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'draft'`
    ).run('Updated Title', 'Updated Desc', id)

    const idea = db.prepare('SELECT title, description FROM ideas WHERE id = ?').get(id) as {
      title: string
      description: string
    }
    expect(idea.title).toBe('Updated Title')
    expect(idea.description).toBe('Updated Desc')
    db.close()
  })

  it('promotes draft to submitted', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    const id = insertIdea(db, submitterId, 'draft')

    db.prepare(
      `UPDATE ideas SET status = 'submitted', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND submitter_id = ? AND status = 'draft'`
    ).run(id, submitterId)

    const idea = db.prepare('SELECT status FROM ideas WHERE id = ?').get(id) as { status: string }
    expect(idea.status).toBe('submitted')
    db.close()
  })

  it('cannot promote an idea that belongs to another user', () => {
    const db = createTestDb()
    const owner = seedUser(db)
    const other = seedUser(db)
    const id = insertIdea(db, owner, 'draft')

    const result = db.prepare(
      `UPDATE ideas SET status = 'submitted'
       WHERE id = ? AND submitter_id = ? AND status = 'draft'`
    ).run(id, other)

    expect(result.changes).toBe(0)
    const idea = db.prepare('SELECT status FROM ideas WHERE id = ?').get(id) as { status: string }
    expect(idea.status).toBe('draft')
    db.close()
  })
})

// ── FR-011: Admin cannot see drafts ──────────────────────────────────────────

describe('FR-011: admin excludes drafts', () => {
  it('admin query returns only non-draft ideas', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    insertIdea(db, submitterId, 'submitted', 'Visible Idea')
    insertIdea(db, submitterId, 'draft', 'Hidden Draft')

    const ideas = db
      .prepare(`SELECT * FROM ideas WHERE status != 'draft'`)
      .all() as { status: string }[]

    expect(ideas).toHaveLength(1)
    expect(ideas[0].status).toBe('submitted')
    db.close()
  })

  it('submitter dashboard query returns all own ideas including drafts', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    insertIdea(db, submitterId, 'submitted')
    insertIdea(db, submitterId, 'draft')

    const ideas = db
      .prepare(`SELECT * FROM ideas WHERE submitter_id = ?`)
      .all(submitterId) as { status: string }[]

    expect(ideas).toHaveLength(2)
    db.close()
  })

  it('submitter dashboard drafts are separable from submitted ideas', () => {
    const db = createTestDb()
    const submitterId = seedUser(db)
    insertIdea(db, submitterId, 'submitted')
    insertIdea(db, submitterId, 'draft')

    const drafts = db
      .prepare(`SELECT * FROM ideas WHERE submitter_id = ? AND status = 'draft'`)
      .all(submitterId) as { status: string }[]

    const submitted = db
      .prepare(`SELECT * FROM ideas WHERE submitter_id = ? AND status != 'draft'`)
      .all(submitterId) as { status: string }[]

    expect(drafts).toHaveLength(1)
    expect(submitted).toHaveLength(1)
    db.close()
  })
})
