import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plaintext: string): Promise<string> {
  // bcryptjs@2.4 emits $2a$ identifiers; normalise to $2b$ (same algorithm, different version byte).
  const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
  return hash.replace(/^\$2a\$/, '$2b$');
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
