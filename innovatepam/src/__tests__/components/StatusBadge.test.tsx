import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '@/components/StatusBadge'

describe('StatusBadge', () => {
  const cases = [
    { status: 'submitted', label: 'Submitted' },
    { status: 'under_review', label: 'Under Review' },
    { status: 'accepted', label: 'Accepted' },
    { status: 'rejected', label: 'Rejected' },
    { status: 'draft', label: 'Draft' },
  ]

  for (const { status, label } of cases) {
    it(`renders correct label for status "${status}"`, () => {
      render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeDefined()
    })
  }

  it('renders unknown status as-is', () => {
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('unknown_status')).toBeDefined()
  })
})
