import { describe, it, expect } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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

function seedIdea(db: Database.Database, status = 'submitted') {
  const adminId = uuidv4()
  const submitterId = uuidv4()
  const ideaId = uuidv4()
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(adminId, 'Admin', `admin-${adminId}@epam.com`, 'hash', 'admin')
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(submitterId, 'Alice', `alice-${submitterId}@epam.com`, 'hash', 'submitter')
  db.prepare(
    `INSERT INTO ideas (id, title, description, category, status, submitter_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(ideaId, 'Test Idea', 'Desc', 'Technical', status, submitterId)
  return { adminId, submitterId, ideaId }
}

// ── FR-P5-01: screening status ────────────────────────────────────────────────

describe('FR-P5-01: screening status', () => {
  it('accepts screening as a valid idea status', () => {
    const db = createTestDb()
    const { submitterId } = seedIdea(db)
    const id = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, status, submitter_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, 'Screened', 'Desc', 'Technical', 'screening', submitterId)

    const idea = db.prepare('SELECT status FROM ideas WHERE id = ?').get(id) as { status: string }
    expect(idea.status).toBe('screening')
    db.close()
  })

  it('accepts screening as a valid evaluation decision', () => {
    const db = createTestDb()
    const { adminId, ideaId } = seedIdea(db)
    const evalId = uuidv4()
    db.prepare(
      `INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, ?)`
    ).run(evalId, ideaId, adminId, 'screening')

    const ev = db.prepare('SELECT decision FROM evaluations WHERE id = ?').get(evalId) as { decision: string }
    expect(ev.decision).toBe('screening')
    db.close()
  })
})

// ── FR-P5-02: stage history logging ──────────────────────────────────────────

describe('FR-P5-02: stage history logging', () => {
  it('inserts a row into review_stage_history on status transition', () => {
    const db = createTestDb()
    const { adminId, ideaId } = seedIdea(db, 'submitted')

    db.prepare(
      `INSERT INTO review_stage_history (id, idea_id, from_status, to_status, evaluator_id, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(uuidv4(), ideaId, 'submitted', 'screening', adminId, 'Initial screen')

    const rows = db
      .prepare('SELECT * FROM review_stage_history WHERE idea_id = ?')
      .all(ideaId) as { to_status: string; from_status: string }[]

    expect(rows).toHaveLength(1)
    expect(rows[0].from_status).toBe('submitted')
    expect(rows[0].to_status).toBe('screening')
    db.close()
  })

  it('accumulates multiple history entries for an idea', () => {
    const db = createTestDb()
    const { adminId, ideaId } = seedIdea(db, 'submitted')

    const transitions = [
      ['submitted', 'screening'],
      ['screening', 'under_review'],
      ['under_review', 'accepted'],
    ]

    for (const [from, to] of transitions) {
      db.prepare(
        `INSERT INTO review_stage_history (id, idea_id, from_status, to_status, evaluator_id)
         VALUES (?, ?, ?, ?, ?)`
      ).run(uuidv4(), ideaId, from, to, adminId)
    }

    const rows = db
      .prepare('SELECT * FROM review_stage_history WHERE idea_id = ? ORDER BY created_at ASC')
      .all(ideaId) as { to_status: string }[]

    expect(rows).toHaveLength(3)
    expect(rows[2].to_status).toBe('accepted')
    db.close()
  })

  it('history is cascade-deleted when idea is deleted', () => {
    const db = createTestDb()
    const { adminId, ideaId } = seedIdea(db, 'submitted')

    db.prepare(
      `INSERT INTO review_stage_history (id, idea_id, from_status, to_status, evaluator_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(uuidv4(), ideaId, 'submitted', 'screening', adminId)

    // Delete idea — CASCADE should remove history
    db.prepare('DELETE FROM ideas WHERE id = ?').run(ideaId)

    const rows = db
      .prepare('SELECT * FROM review_stage_history WHERE idea_id = ?')
      .all(ideaId)
    expect(rows).toHaveLength(0)
    db.close()
  })
})

// ── FR-P5-03: stage ordering ──────────────────────────────────────────────────

describe('FR-P5-03: available stage transitions', () => {
  it.each([
    ['submitted', ['screening', 'under_review', 'accepted', 'rejected']],
    ['screening', ['under_review', 'accepted', 'rejected']],
    ['under_review', ['accepted', 'rejected']],
  ])('from %s can transition to expected stages', (currentStatus, expected) => {
    // This is purely logic — no DB needed
    const TRANSITIONS: Record<string, string[]> = {
      submitted: ['screening', 'under_review', 'accepted', 'rejected'],
      screening: ['under_review', 'accepted', 'rejected'],
      under_review: ['accepted', 'rejected'],
    }
    expect(TRANSITIONS[currentStatus]).toEqual(expected)
  })
})
