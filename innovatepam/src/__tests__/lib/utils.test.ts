import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, cn } from '@/lib/utils'

describe('cn (className merge)', () => {
  it('merges class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    // twMerge resolves conflicts: px-2 and px-4 → px-4
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles falsy values gracefully', () => {
    expect(cn('foo', false && 'bar', undefined, null)).toBe('foo')
  })
})

describe('formatDate', () => {
  it('formats ISO date as "MMM d, yyyy"', () => {
    expect(formatDate('2026-01-15T10:30:00.000Z')).toMatch(/Jan 15, 2026/)
  })

  it('formats end-of-year date correctly', () => {
    expect(formatDate('2025-12-31T00:00:00.000Z')).toMatch(/Dec 31, 2025/)
  })
})

describe('formatDateTime', () => {
  it('includes time component', () => {
    const result = formatDateTime('2026-05-14T09:00:00.000Z')
    expect(result).toMatch(/May 14, 2026/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})
