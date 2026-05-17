import Database from 'better-sqlite3';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(process.env.DATABASE_PATH ?? 'innovatepam.db');
  }
  return _db;
}
