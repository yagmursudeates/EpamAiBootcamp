import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { buildNotificationMessage } from '@/lib/notifications'

// ── Test DB setup ─────────────────────────────────────────────────────────────

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

function seedUsers(db: Database.Database) {
  const adminId = uuidv4()
  const submitterId = uuidv4()
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(adminId, 'Admin', 'admin@epam.com', 'hash', 'admin')
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  ).run(submitterId, 'Alice', 'alice@epam.com', 'hash', 'submitter')
  return { adminId, submitterId }
}

function seedIdea(db: Database.Database, submitterId: string) {
  const ideaId = uuidv4()
  db.prepare(
    `INSERT INTO ideas (id, title, description, category, submitter_id) VALUES (?, ?, ?, ?, ?)`
  ).run(ideaId, 'My Idea Title', 'Some description', 'Technical', submitterId)
  return ideaId
}

// ── FR-N01: Notification created on evaluation ────────────────────────────────

describe('FR-N01: notification created when evaluation is saved', () => {
  it('creates a notification for the submitter on acceptance', () => {
    const db = createTestDb()
    const { adminId, submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    // Simulate evaluate route: upsert evaluation + insert notification
    db.prepare(
      `INSERT INTO evaluations (id, idea_id, evaluator_id, decision) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), ideaId, adminId, 'accepted')
    db.prepare(`UPDATE ideas SET status = 'accepted' WHERE id = ?`).run(ideaId)
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, "Your idea 'My Idea Title' was accepted.")

    const notif = db
      .prepare('SELECT * FROM notifications WHERE user_id = ?')
      .get(submitterId) as { message: string; is_read: number } | undefined

    expect(notif).toBeDefined()
    expect(notif!.message).toBe("Your idea 'My Idea Title' was accepted.")
    expect(notif!.is_read).toBe(0)
    db.close()
  })

  it('creates notification message for rejection', () => {
    const db = createTestDb()
    const { adminId, submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, "Your idea 'My Idea Title' was rejected.")

    const notif = db
      .prepare('SELECT message FROM notifications WHERE user_id = ?')
      .get(submitterId) as { message: string }
    expect(notif.message).toBe("Your idea 'My Idea Title' was rejected.")
    db.close()
  })

  it('creates notification message for under_review', () => {
    const db = createTestDb()
    const { adminId, submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, "Your idea 'My Idea Title' is now under review.")

    const notif = db
      .prepare('SELECT message FROM notifications WHERE user_id = ?')
      .get(submitterId) as { message: string }
    expect(notif.message).toContain('under review')
    db.close()
  })
})

// ── FR-N02 / FR-N06: Unread count is user-scoped ─────────────────────────────

describe('FR-N02 / FR-N06: unread count is user-scoped', () => {
  it('counts only unread notifications for the correct user', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const bobId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(bobId, 'Bob', 'bob@epam.com', 'hash', 'submitter')

    const ideaId = seedIdea(db, submitterId)

    // 2 notifications for Alice, 1 for Bob
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, 'Notification 1 for Alice')
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, 'Notification 2 for Alice')
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), bobId, ideaId, 'Notification 1 for Bob')

    const aliceCount = (
      db
        .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0')
        .get(submitterId) as { cnt: number }
    ).cnt
    expect(aliceCount).toBe(2)

    const bobCount = (
      db
        .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0')
        .get(bobId) as { cnt: number }
    ).cnt
    expect(bobCount).toBe(1)
    db.close()
  })

  it('returns 0 unread when all are read', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    const notifId = uuidv4()
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message, is_read) VALUES (?, ?, ?, ?, 1)`
    ).run(notifId, submitterId, ideaId, 'Already read')

    const count = (
      db
        .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0')
        .get(submitterId) as { cnt: number }
    ).cnt
    expect(count).toBe(0)
    db.close()
  })
})

// ── FR-N05: Mark single notification as read ──────────────────────────────────

describe('FR-N05: mark single notification as read', () => {
  it('updates is_read to 1', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    const notifId = uuidv4()
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(notifId, submitterId, ideaId, 'Test notification')

    // Simulate PATCH /api/notifications/[id]
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`).run(
      notifId,
      submitterId
    )

    const notif = db
      .prepare('SELECT is_read FROM notifications WHERE id = ?')
      .get(notifId) as { is_read: number }
    expect(notif.is_read).toBe(1)
    db.close()
  })

  it('cannot mark another user\'s notification as read', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const bobId = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(bobId, 'Bob', 'bob@epam.com', 'hash', 'submitter')

    const ideaId = seedIdea(db, submitterId)
    const notifId = uuidv4()
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(notifId, submitterId, ideaId, "Alice's notification")

    // Bob tries to mark Alice's notification — WHERE user_id = bobId filters it out
    const result = db
      .prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`)
      .run(notifId, bobId)
    expect(result.changes).toBe(0)

    // Alice's notification is still unread
    const notif = db
      .prepare('SELECT is_read FROM notifications WHERE id = ?')
      .get(notifId) as { is_read: number }
    expect(notif.is_read).toBe(0)
    db.close()
  })
})

// ── FR-N07: Mark all as read ──────────────────────────────────────────────────

describe('FR-N07: mark all notifications as read', () => {
  it('sets is_read = 1 for all of the user\'s unread notifications', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, 'Notif 1')
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, 'Notif 2')

    db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(submitterId)

    const count = (
      db
        .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0')
        .get(submitterId) as { cnt: number }
    ).cnt
    expect(count).toBe(0)
    db.close()
  })
})

// ── Schema constraints ────────────────────────────────────────────────────────

describe('notifications schema constraints', () => {
  it('rejects is_read values other than 0 or 1', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    expect(() => {
      db.prepare(
        `INSERT INTO notifications (id, user_id, idea_id, message, is_read) VALUES (?, ?, ?, ?, ?)`
      ).run(uuidv4(), submitterId, ideaId, 'Bad', 5)
    }).toThrow()
    db.close()
  })

  it('defaults is_read to 0 (unread)', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    const id = uuidv4()
    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(id, submitterId, ideaId, 'Default unread')

    const notif = db
      .prepare('SELECT is_read FROM notifications WHERE id = ?')
      .get(id) as { is_read: number }
    expect(notif.is_read).toBe(0)
    db.close()
  })

  it('cascades delete when idea is deleted', () => {
    const db = createTestDb()
    const { submitterId } = seedUsers(db)
    const ideaId = seedIdea(db, submitterId)

    db.prepare(
      `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), submitterId, ideaId, 'Will be deleted')

    db.prepare('DELETE FROM ideas WHERE id = ?').run(ideaId)

    const count = (
      db
        .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE idea_id = ?')
        .get(ideaId) as { cnt: number }
    ).cnt
    expect(count).toBe(0)
    db.close()
  })
})

// ── Notification message helper ───────────────────────────────────────────────

describe('notification message generator', () => {
  it('generates correct message for each decision', () => {
    expect(buildNotificationMessage('accepted', 'My Idea')).toBe(
      "Your idea 'My Idea' was accepted."
    )
    expect(buildNotificationMessage('rejected', 'My Idea')).toBe(
      "Your idea 'My Idea' was rejected."
    )
    expect(buildNotificationMessage('under_review', 'My Idea')).toBe(
      "Your idea 'My Idea' is now under review."
    )
  })
})
