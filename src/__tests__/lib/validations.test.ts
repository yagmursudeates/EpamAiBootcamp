import { describe, it, expect } from 'vitest';
import { registrationSchema, ideaSchema } from '@/lib/validations';

// ─── T011: Registration schema (US-001 AC-1) ─────────────────────────────────

describe('registrationSchema', () => {
  it('should accept a valid name, email, and password ≥ 8 characters', () => {
    // Arrange
    const input = { name: 'Alice Tester', email: 'alice@epam.com', password: 'Password123!' };

    // Act
    const result = registrationSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should reject a password shorter than 8 characters', () => {
    // Arrange
    const input = { name: 'Alice Tester', email: 'alice@epam.com', password: 'Short1' };

    // Act
    const result = registrationSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('password');
  });

  it('should reject a missing name field', () => {
    // Arrange
    const input = { email: 'alice@epam.com', password: 'Password123!' };

    // Act
    const result = registrationSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
  });

  it('should reject a malformed email address', () => {
    // Arrange
    const input = { name: 'Alice Tester', email: 'not-an-email', password: 'Password123!' };

    // Act
    const result = registrationSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });
});

// ─── T018: Idea schema (US-002 AC-1, AC-3, AC-5) ────────────────────────────

describe('ideaSchema', () => {
  const VALID_IDEA = {
    title: 'Automate onboarding checklist',
    description: 'Replace the manual PDF with an interactive digital checklist.',
    category: 'Process Improvement',
  };

  it('should accept a valid title, description, and one of the five defined categories', () => {
    // Arrange / Act
    const result = ideaSchema.safeParse(VALID_IDEA);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should reject a blank title', () => {
    // Arrange
    const input = { ...VALID_IDEA, title: '' };

    // Act
    const result = ideaSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('title');
  });

  it('should reject a blank description', () => {
    // Arrange
    const input = { ...VALID_IDEA, description: '' };

    // Act
    const result = ideaSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('description');
  });

  it('should reject a title longer than 100 characters', () => {
    // Arrange
    const input = { ...VALID_IDEA, title: 'A'.repeat(101) };

    // Act
    const result = ideaSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('title');
  });

  it('should reject a description longer than 2000 characters', () => {
    // Arrange
    const input = { ...VALID_IDEA, description: 'D'.repeat(2001) };

    // Act
    const result = ideaSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('description');
  });

  it('should reject a category value not in the defined enum', () => {
    // Arrange
    const input = { ...VALID_IDEA, category: 'InvalidCategory' };

    // Act
    const result = ideaSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('category');
  });

  it('should accept all five defined category values', () => {
    // Arrange — derived from US-002 AC-5
    const categories = [
      'Technical',
      'Process Improvement',
      'Client Solutions',
      'Cost Reduction',
      'Employee Experience',
    ];

    categories.forEach((category) => {
      // Act
      const result = ideaSchema.safeParse({ ...VALID_IDEA, category });

      // Assert
      expect(result.success, `Expected category "${category}" to be valid`).toBe(true);
    });
  });
});
