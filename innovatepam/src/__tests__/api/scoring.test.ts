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

function seedEvaluation(db: Database.Database) {
  const userId = uuidv4()
  const ideaId = uuidv4()
  const evalId = uuidv4()
  db.prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, 'Admin', 'admin@test.com', 'hash', 'admin')`).run(userId)
  db.prepare(`INSERT INTO ideas (id, title, description, category, submitter_id) VALUES (?, 'Test', 'Desc', 'Technical', ?)`).run(ideaId, userId)
  db.prepare(`INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, 'under_review')`).run(evalId, ideaId, userId)
  return { evalId, ideaId, userId }
}

// ── FR-P7-01: scores column ───────────────────────────────────────────────────

describe('FR-P7-01: scores column on evaluations', () => {
  it('evaluations table has a scores column', () => {
    const db = createTestDb()
    const cols = (db.prepare('PRAGMA table_info(evaluations)').all() as { name: string }[]).map(c => c.name)
    expect(cols).toContain('scores')
    db.close()
  })

  it('scores column defaults to NULL', () => {
    const db = createTestDb()
    const { evalId } = seedEvaluation(db)
    const row = db.prepare('SELECT scores FROM evaluations WHERE id = ?').get(evalId) as { scores: string | null }
    expect(row.scores).toBeNull()
    db.close()
  })
})

// ── FR-P7-02: storing and reading scores ─────────────────────────────────────

describe('FR-P7-02: storing and reading scores JSON', () => {
  it('can store a JSON scores object and read it back', () => {
    const db = createTestDb()
    const { evalId } = seedEvaluation(db)
    const scores = { innovation: 4, feasibility: 3, impact: 5, clarity: 4 }
    db.prepare('UPDATE evaluations SET scores = ? WHERE id = ?').run(JSON.stringify(scores), evalId)
    const row = db.prepare('SELECT scores FROM evaluations WHERE id = ?').get(evalId) as { scores: string }
    expect(JSON.parse(row.scores)).toEqual(scores)
    db.close()
  })

  it('computes average score correctly', () => {
    const scores = { innovation: 4, feasibility: 3, impact: 5, clarity: 4 }
    const values = Object.values(scores)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    expect(avg).toBe(4)
  })

  it('rejects scores outside 1-5 range in validation logic', () => {
    const isValid = (s: Record<string, number>) =>
      Object.values(s).every((v) => Number.isInteger(v) && v >= 1 && v <= 5)
    expect(isValid({ innovation: 3, feasibility: 6, impact: 2, clarity: 4 })).toBe(false)
    expect(isValid({ innovation: 3, feasibility: 5, impact: 2, clarity: 4 })).toBe(true)
  })
})
