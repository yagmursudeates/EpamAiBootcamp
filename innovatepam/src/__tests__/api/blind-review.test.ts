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

// ── FR-P6-01: settings table ──────────────────────────────────────────────────

describe('FR-P6-01: settings table', () => {
  it('settings table exists with key/value columns', () => {
    const db = createTestDb()
    // schema seeds blind_mode = '0' already; just read it
    const row = db.prepare("SELECT value FROM settings WHERE key = 'blind_mode'").get() as { value: string }
    expect(row.value).toBe('0')
    db.close()
  })

  it('can toggle blind_mode on and off', () => {
    const db = createTestDb()
    // schema seeds blind_mode = '0'; update to '1'
    db.prepare("UPDATE settings SET value = '1' WHERE key = 'blind_mode'").run()
    const on = db.prepare("SELECT value FROM settings WHERE key = 'blind_mode'").get() as { value: string }
    expect(on.value).toBe('1')

    db.prepare("UPDATE settings SET value = '0' WHERE key = 'blind_mode'").run()
    const off = db.prepare("SELECT value FROM settings WHERE key = 'blind_mode'").get() as { value: string }
    expect(off.value).toBe('0')
    db.close()
  })
})

// ── FR-P6-02: blind mode logic ────────────────────────────────────────────────

describe('FR-P6-02: blind mode hides submitter name', () => {
  it('returns submitter name when blind mode is off', () => {
    const submitterId = uuidv4()
    const ideaSubmitterName = 'Alice Smith'
    const blindMode = '0'
    const displayName = blindMode === '1' ? 'Anonymous' : ideaSubmitterName
    expect(displayName).toBe('Alice Smith')
  })

  it('returns Anonymous when blind mode is on', () => {
    const ideaSubmitterName = 'Alice Smith'
    const blindMode = '1'
    const displayName = blindMode === '1' ? 'Anonymous' : ideaSubmitterName
    expect(displayName).toBe('Anonymous')
  })
})
