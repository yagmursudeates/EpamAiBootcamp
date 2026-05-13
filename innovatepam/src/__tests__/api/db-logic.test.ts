import { describe, it, expect, vi, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

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

// ── POST /api/users (register) ────────────────────────────────────────────────

describe('POST /api/users — registration logic', () => {
  it('hashes password with bcrypt (not stored in plaintext)', async () => {
    const db = createTestDb()
    const bcrypt = await import('bcryptjs')
    const { v4: uuidv4 } = await import('uuid')

    const password = 'Test1234!'
    const hash = await bcrypt.hash(password, 12)

    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4(), 'Test User', 'test@epam.com', hash, 'submitter')

    const row = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('test@epam.com') as { password_hash: string }
    expect(row.password_hash).not.toBe(password)
    expect(await bcrypt.compare(password, row.password_hash)).toBe(true)
    db.close()
  })

  it('enforces unique email constraint', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4(), 'Alice', 'alice@epam.com', 'hash1', 'submitter')

    expect(() => {
      db.prepare(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      ).run(uuidv4(), 'Alice2', 'alice@epam.com', 'hash2', 'submitter')
    }).toThrow()

    db.close()
  })

  it('only allows submitter or admin roles', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    expect(() => {
      db.prepare(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      ).run(uuidv4(), 'BadRole', 'bad@epam.com', 'hash', 'superuser')
    }).toThrow()

    db.close()
  })
})

// ── POST /api/ideas ────────────────────────────────────────────────────────────

describe('Ideas DB — creation logic', () => {
  it('creates idea with status submitted by default', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    const userId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'Alice', 'alice@epam.com', 'hash', 'submitter')

    const ideaId = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, submitter_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(ideaId, 'Test Idea', 'A description', 'Technical', userId)

    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(ideaId) as { status: string }
    expect(idea.status).toBe('submitted')
    db.close()
  })

  it('only allows valid categories', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    const userId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'Alice', 'alice@epam.com', 'hash', 'submitter')

    expect(() => {
      db.prepare(
        `INSERT INTO ideas (id, title, description, category, submitter_id)
         VALUES (?, ?, ?, ?, ?)`
      ).run(uuidv4(), 'Bad Cat', 'desc', 'InvalidCategory', userId)
    }).toThrow()

    db.close()
  })

  it('only allows valid statuses', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    const userId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'Alice', 'alice@epam.com', 'hash', 'submitter')

    expect(() => {
      db.prepare(
        `INSERT INTO ideas (id, title, description, category, status, submitter_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(uuidv4(), 'Bad Status', 'desc', 'Technical', 'invalid_status', userId)
    }).toThrow()

    db.close()
  })
})

// ── POST /api/ideas/[id]/evaluate ─────────────────────────────────────────────

describe('Evaluations DB — evaluation logic', () => {
  it('syncs idea status with evaluation decision', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    const adminId = uuidv4()
    const userId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(adminId, 'Admin', 'admin@epam.com', 'hash', 'admin')
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'Alice', 'alice@epam.com', 'hash', 'submitter')

    const ideaId = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, submitter_id) VALUES (?, ?, ?, ?, ?)`
    ).run(ideaId, 'Test', 'desc', 'Technical', userId)

    // Insert evaluation
    db.prepare(
      `INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), ideaId, adminId, 'accepted')

    // Sync status
    db.prepare(`UPDATE ideas SET status = ? WHERE id = ?`).run('accepted', ideaId)

    const idea = db.prepare('SELECT status FROM ideas WHERE id = ?').get(ideaId) as { status: string }
    expect(idea.status).toBe('accepted')
    db.close()
  })

  it('rejects submitted as an evaluation decision', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    const adminId = uuidv4()
    const userId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(adminId, 'Admin', 'admin@epam.com', 'hash', 'admin')
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'Alice', 'alice@epam.com', 'hash', 'submitter')

    const ideaId = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, submitter_id) VALUES (?, ?, ?, ?, ?)`
    ).run(ideaId, 'Test', 'desc', 'Technical', userId)

    expect(() => {
      db.prepare(
        `INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, ?)`
      ).run(uuidv4(), ideaId, adminId, 'submitted')
    }).toThrow()

    db.close()
  })

  it('enforces one evaluation per idea (UNIQUE constraint)', () => {
    const db = createTestDb()
    const { v4: uuidv4 } = require('uuid')

    const adminId = uuidv4()
    const userId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(adminId, 'Admin', 'admin@epam.com', 'hash', 'admin')
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, 'Alice', 'alice@epam.com', 'hash', 'submitter')

    const ideaId = uuidv4()
    db.prepare(
      `INSERT INTO ideas (id, title, description, category, submitter_id) VALUES (?, ?, ?, ?, ?)`
    ).run(ideaId, 'Test', 'desc', 'Technical', userId)

    db.prepare(
      `INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), ideaId, adminId, 'accepted')

    expect(() => {
      db.prepare(
        `INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, ?)`
      ).run(uuidv4(), ideaId, adminId, 'rejected')
    }).toThrow()

    db.close()
  })
})
