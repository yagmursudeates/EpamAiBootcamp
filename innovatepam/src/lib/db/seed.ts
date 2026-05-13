import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const DB_PATH = path.join(process.cwd(), 'innovatepam.db')
const SCHEMA_PATH = path.join(process.cwd(), 'src/lib/db/schema.sql')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')
db.exec(schema)

const accounts = [
  { email: 'admin@epam.com', password: 'Admin1234!', name: 'Admin User', role: 'admin' },
  { email: 'alice@epam.com', password: 'Test1234!', name: 'Alice Smith', role: 'submitter' },
  { email: 'bob@epam.com', password: 'Test1234!', name: 'Bob Jones', role: 'submitter' },
]

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
)

for (const account of accounts) {
  const hash = bcrypt.hashSync(account.password, 12)
  insertUser.run(uuidv4(), account.name, account.email, hash, account.role)
  console.log(`✓ Seeded: ${account.email}`)
}

console.log('Seed complete.')
db.close()
