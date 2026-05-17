import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/ideas/StatusBadge';

// ─── T025: StatusBadge component (US-003 AC-4, AC-5) ─────────────────────────

describe('StatusBadge', () => {
  it('should render with a green colour class when status is "accepted"', () => {
    // Arrange — AC-4: "status badge is green"
    const { container } = render(<StatusBadge status="accepted" />);

    // Act
    const badge = container.firstChild as HTMLElement;

    // Assert — derived from US-003 AC-4
    expect(badge.className).toMatch(/green/i);
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
  });

  it('should render with a red colour class when status is "rejected"', () => {
    // Arrange — AC-5: "status badge is red"
    const { container } = render(<StatusBadge status="rejected" />);

    // Act
    const badge = container.firstChild as HTMLElement;

    // Assert — derived from US-003 AC-5
    expect(badge.className).toMatch(/red/i);
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
  });

  it('should render with a neutral colour class when status is "submitted"', () => {
    // Arrange — default state: no evaluation yet
    const { container } = render(<StatusBadge status="submitted" />);

    // Act
    const badge = container.firstChild as HTMLElement;

    // Assert — neutral (gray/yellow, NOT green or red)
    expect(badge.className).not.toMatch(/green/i);
    expect(badge.className).not.toMatch(/red/i);
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
  });
});
