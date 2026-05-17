import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/components/dashboard/Dashboard';
import { mockSession } from '../../helpers/auth';
import { SUBMITTED_IDEA, ACCEPTED_IDEA } from '../../fixtures/ideas';

// ─── T027: Dashboard component (US-003 AC-1, AC-2) ───────────────────────────

describe('Dashboard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should render one IdeaCard per idea returned by GET /api/ideas', async () => {
    // Arrange — AC-1: "list of their own ideas"
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ideas: [SUBMITTED_IDEA, ACCEPTED_IDEA] }), { status: 200 })
    );

    // Act
    render(<Dashboard session={mockSession()} />);

    // Assert — derived from US-003 AC-1
    await waitFor(() => {
      expect(screen.getByText(SUBMITTED_IDEA.title)).toBeInTheDocument();
      expect(screen.getByText(ACCEPTED_IDEA.title)).toBeInTheDocument();
    });
  });

  it('should render the empty state with a "Submit your first idea" link when ideas is empty', async () => {
    // Arrange — AC-2: "empty state with CTA"
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ideas: [] }), { status: 200 })
    );

    // Act
    render(<Dashboard session={mockSession()} />);

    // Assert — derived from US-003 AC-2
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /submit your first idea/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/submit');
    });
  });
});
