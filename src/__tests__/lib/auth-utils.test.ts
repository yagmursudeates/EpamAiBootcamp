import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth-utils';

// ─── T012: Password hashing utility (US-001 AC-1, AC-4) ─────────────────────

describe('hashPassword', () => {
  it('should return a string that differs from the plaintext input', async () => {
    // Arrange
    const plaintext = 'Password123!';

    // Act
    const hash = await hashPassword(plaintext);

    // Assert
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(plaintext);
  });

  it('should produce a bcrypt hash recognisable by the $2b$ prefix', async () => {
    // Arrange
    const plaintext = 'Password123!';

    // Act
    const hash = await hashPassword(plaintext);

    // Assert — derived from bcrypt spec; $2b$ prefix confirms algorithm
    expect(hash.startsWith('$2b$')).toBe(true);
  });
});

describe('verifyPassword', () => {
  it('should return true when the correct password is verified against its hash', async () => {
    // Arrange
    const plaintext = 'Password123!';
    const hash = await hashPassword(plaintext);

    // Act
    const result = await verifyPassword(plaintext, hash);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when an incorrect password is verified against a hash', async () => {
    // Arrange
    const correctPassword = 'Password123!';
    const wrongPassword = 'WrongPass456!';
    const hash = await hashPassword(correctPassword);

    // Act
    const result = await verifyPassword(wrongPassword, hash);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when an empty string is verified against a valid hash', async () => {
    // Arrange
    const hash = await hashPassword('Password123!');

    // Act
    const result = await verifyPassword('', hash);

    // Assert
    expect(result).toBe(false);
  });
});
