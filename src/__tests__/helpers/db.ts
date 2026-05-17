import Database from 'better-sqlite3';

// Full schema SQL — mirrors src/lib/db/schema.ts
// Applied fresh to each :memory: instance in beforeEach.
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'submitter',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ideas (
    id           TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    category     TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'submitted',
    submitter_id TEXT NOT NULL,
    is_anonymous INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (submitter_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id        TEXT PRIMARY KEY,
    idea_id   TEXT NOT NULL,
    filename  TEXT NOT NULL,
    filepath  TEXT NOT NULL,
    mimetype  TEXT NOT NULL,
    size      INTEGER NOT NULL,
    FOREIGN KEY (idea_id) REFERENCES ideas(id)
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id           TEXT PRIMARY KEY,
    idea_id      TEXT NOT NULL UNIQUE,
    evaluator_id TEXT NOT NULL,
    notes        TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (idea_id) REFERENCES ideas(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

/**
 * Opens a fresh in-memory SQLite database and applies the full schema.
 * Call in `beforeEach`; pair with `closeTestDb()` in `afterEach`.
 *
 * Constitution §6 — Fake: in-memory SQLite (:memory:) per suite.
 */
export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.exec(SCHEMA_SQL);
  return db;
}

/**
 * Closes and destroys the in-memory database.
 * Call in `afterEach` to prevent cross-test state leakage.
 */
export function closeTestDb(db: Database.Database): void {
  db.close();
}
