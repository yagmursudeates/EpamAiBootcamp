import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import { RegisterSchema } from '@/lib/validations'
import type { DbUser } from '@/types/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email) as DbUser | undefined

    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const id = uuidv4()

    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, email, password_hash, 'submitter')

    return Response.json({ message: 'Account created' }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
