import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import authConfig from '@/lib/auth.config'
import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { LoginSchema } from '@/lib/validations'
import type { DbUser } from '@/types/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | undefined
        if (!user) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
})
