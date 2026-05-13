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
  globalForDb._db = db
}

export default globalForDb._db!
