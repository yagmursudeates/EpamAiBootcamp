import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import IdeaCard from '@/components/IdeaCard'

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const baseIdea = {
  id: 'idea-001',
  title: 'Automate reporting pipeline',
  category: 'Technical',
  status: 'submitted',
  created_at: '2026-05-01T10:00:00.000Z',
}

describe('IdeaCard', () => {
  it('renders the idea title', () => {
    render(<IdeaCard idea={baseIdea} href="/ideas/idea-001" />)
    expect(screen.getByText('Automate reporting pipeline')).toBeDefined()
  })

  it('renders the category', () => {
    render(<IdeaCard idea={baseIdea} href="/ideas/idea-001" />)
    expect(screen.getByText('Technical')).toBeDefined()
  })

  it('renders the status badge', () => {
    render(<IdeaCard idea={baseIdea} href="/ideas/idea-001" />)
    expect(screen.getByText('Submitted')).toBeDefined()
  })

  it('renders a formatted date', () => {
    render(<IdeaCard idea={baseIdea} href="/ideas/idea-001" />)
    expect(screen.getByText('May 1, 2026')).toBeDefined()
  })

  it('links to the correct href', () => {
    render(<IdeaCard idea={baseIdea} href="/ideas/idea-001" />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/ideas/idea-001')
  })

  it('renders submitter name when provided', () => {
    render(
      <IdeaCard
        idea={{ ...baseIdea, submitter_name: 'Alice Smith' }}
        href="/admin/ideas/idea-001"
      />
    )
    expect(screen.getByText(/Alice Smith/)).toBeDefined()
  })

  it('does not render submitter section when not provided', () => {
    render(<IdeaCard idea={baseIdea} href="/ideas/idea-001" />)
    expect(screen.queryByText(/By /)).toBeNull()
  })
})
