import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const globalForDb = globalThis as unknown as { _db: Database.Database | undefined }

if (!globalForDb._db) {
  const dbPath = path.join(process.cwd(), 'innovatepam.db')
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/db/schema.sql'), 'utf-8')
  db.exec(schema)

  // Phase 5 migration: add screening status + review_stage_history
  const hasHistoryTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='review_stage_history'")
    .get()
  if (!hasHistoryTable) {
    db.pragma('foreign_keys = OFF')
    db.exec(`
      CREATE TABLE ideas_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Technical','Process Improvement','Client Solutions','Cost Reduction','Employee Experience')),
        status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','screening','under_review','accepted','rejected','draft')),
        category_metadata TEXT,
        submitter_id TEXT NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO ideas_new SELECT * FROM ideas;
      DROP TABLE ideas;
      ALTER TABLE ideas_new RENAME TO ideas;

      CREATE TABLE evaluations_new (
        id TEXT PRIMARY KEY,
        idea_id TEXT NOT NULL UNIQUE REFERENCES ideas(id) ON DELETE CASCADE,
        evaluator_id TEXT NOT NULL REFERENCES users(id),
        decision TEXT NOT NULL CHECK(decision IN ('screening','under_review','accepted','rejected')),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO evaluations_new SELECT * FROM evaluations;
      DROP TABLE evaluations;
      ALTER TABLE evaluations_new RENAME TO evaluations;

      CREATE TABLE IF NOT EXISTS review_stage_history (
        id TEXT PRIMARY KEY,
        idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
        from_status TEXT,
        to_status TEXT NOT NULL,
        evaluator_id TEXT NOT NULL REFERENCES users(id),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)
    db.pragma('foreign_keys = ON')
  }

  globalForDb._db = db
}

export default globalForDb._db!
