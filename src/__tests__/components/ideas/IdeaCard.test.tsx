import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IdeaCard from '@/components/ideas/IdeaCard';
import { SUBMITTED_IDEA } from '../../fixtures/ideas';

// ─── T026: IdeaCard component (US-003 AC-1) ──────────────────────────────────

describe('IdeaCard', () => {
  it('should render the idea title, category, submission date, and a StatusBadge', () => {
    // Arrange — AC-1: "list shows title, category, status badge, submission date"
    render(<IdeaCard idea={SUBMITTED_IDEA} />);

    // Assert — derived from US-003 AC-1
    expect(screen.getByText(SUBMITTED_IDEA.title)).toBeInTheDocument();
    expect(screen.getByText(SUBMITTED_IDEA.category)).toBeInTheDocument();
    // Date rendered in some human-readable format
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    // StatusBadge renders the status text
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
  });

  it('should pass the correct status value to StatusBadge', () => {
    // Arrange — AC-1: StatusBadge receives accurate status prop
    render(<IdeaCard idea={{ ...SUBMITTED_IDEA, status: 'accepted' }} />);

    // Assert — green badge indicates accepted (see StatusBadge tests)
    const badge = screen.getByText(/accepted/i);
    expect(badge).toBeInTheDocument();
  });
});
