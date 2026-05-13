import { describe, it, expect } from 'vitest'
import { RegisterSchema, LoginSchema, IdeaSchema, EvaluationSchema } from '@/lib/validations'

// ── RegisterSchema ──────────────────────────────────────────────────────────

describe('RegisterSchema', () => {
  it('accepts valid inputs', () => {
    const result = RegisterSchema.safeParse({
      name: 'Alice Smith',
      email: 'alice@epam.com',
      password: 'Test1234!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = RegisterSchema.safeParse({
      name: '',
      email: 'alice@epam.com',
      password: 'Test1234!',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.name).toBeDefined()
  })

  it('rejects name longer than 100 chars', () => {
    const result = RegisterSchema.safeParse({
      name: 'A'.repeat(101),
      email: 'alice@epam.com',
      password: 'Test1234!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = RegisterSchema.safeParse({
      name: 'Alice',
      email: 'not-an-email',
      password: 'Test1234!',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })

  it('rejects password shorter than 8 chars', () => {
    const result = RegisterSchema.safeParse({
      name: 'Alice',
      email: 'alice@epam.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })

  it('accepts password exactly 8 chars', () => {
    const result = RegisterSchema.safeParse({
      name: 'Alice',
      email: 'alice@epam.com',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })
})

// ── LoginSchema ──────────────────────────────────────────────────────────────

describe('LoginSchema', () => {
  it('accepts valid credentials', () => {
    const result = LoginSchema.safeParse({ email: 'alice@epam.com', password: 'Test1234!' })
    expect(result.success).toBe(true)
  })

  it('rejects missing password', () => {
    const result = LoginSchema.safeParse({ email: 'alice@epam.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = LoginSchema.safeParse({ email: 'bad', password: 'Test1234!' })
    expect(result.success).toBe(false)
  })
})

// ── IdeaSchema ────────────────────────────────────────────────────────────────

describe('IdeaSchema', () => {
  const valid = {
    title: 'My great idea',
    description: 'A thorough description of the idea.',
    category: 'Technical' as const,
  }

  it('accepts valid idea', () => {
    expect(IdeaSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = IdeaSchema.safeParse({ ...valid, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 100 chars', () => {
    const result = IdeaSchema.safeParse({ ...valid, title: 'T'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects empty description', () => {
    const result = IdeaSchema.safeParse({ ...valid, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects description longer than 2000 chars', () => {
    const result = IdeaSchema.safeParse({ ...valid, description: 'D'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = IdeaSchema.safeParse({ ...valid, category: 'InvalidCat' })
    expect(result.success).toBe(false)
  })

  it('accepts all five valid categories', () => {
    const cats = [
      'Technical',
      'Process Improvement',
      'Client Solutions',
      'Cost Reduction',
      'Employee Experience',
    ] as const
    for (const category of cats) {
      expect(IdeaSchema.safeParse({ ...valid, category }).success).toBe(true)
    }
  })

  it('accepts optional categoryMetadata', () => {
    const result = IdeaSchema.safeParse({
      ...valid,
      categoryMetadata: { stack: 'React', complexity: 'Medium' },
    })
    expect(result.success).toBe(true)
  })
})

// ── EvaluationSchema ──────────────────────────────────────────────────────────

describe('EvaluationSchema', () => {
  it('accepts under_review decision', () => {
    expect(EvaluationSchema.safeParse({ decision: 'under_review' }).success).toBe(true)
  })

  it('accepts accepted decision', () => {
    expect(EvaluationSchema.safeParse({ decision: 'accepted' }).success).toBe(true)
  })

  it('accepts rejected decision', () => {
    expect(EvaluationSchema.safeParse({ decision: 'rejected' }).success).toBe(true)
  })

  it('rejects submitted as decision', () => {
    expect(EvaluationSchema.safeParse({ decision: 'submitted' }).success).toBe(false)
  })

  it('rejects missing decision', () => {
    expect(EvaluationSchema.safeParse({}).success).toBe(false)
  })

  it('accepts optional notes', () => {
    const result = EvaluationSchema.safeParse({ decision: 'accepted', notes: 'Great work!' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.notes).toBe('Great work!')
  })
})
