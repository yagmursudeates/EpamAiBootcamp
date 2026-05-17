import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth-utils';

interface Credentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function authorizeCredentials(
  credentials: Credentials
): Promise<AuthUser | null> {
  const db = getDb();
  const user = db
    .prepare('SELECT id, name, email, role, password_hash FROM users WHERE email = ?')
    .get(credentials.email) as
    | { id: string; name: string; email: string; role: string; password_hash: string }
    | undefined;

  if (!user) return null;

  const valid = await verifyPassword(credentials.password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
