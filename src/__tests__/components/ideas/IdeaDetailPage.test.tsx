import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IdeaDetailPage from '@/components/ideas/IdeaDetailPage';
import {
  SUBMITTED_IDEA,
  ACCEPTED_IDEA,
  REJECTED_IDEA,
  ACCEPTED_EVALUATION_NOTES,
  REJECTED_EVALUATION_NOTES,
} from '../../fixtures/ideas';

// ─── T028: IdeaDetailPage component (US-003 AC-3, AC-4, AC-5) ────────────────

describe('IdeaDetailPage', () => {
  it('should render title, description, category, status, submission date, and attachment link', () => {
    // Arrange — AC-3: "detail page shows all fields"
    render(
      <IdeaDetailPage
        idea={SUBMITTED_IDEA}
        attachment={{ filename: 'brief.pdf', url: '/api/attachments/1' }}
        evaluation={null}
      />
    );

    // Assert — derived from US-003 AC-3
    expect(screen.getByText(SUBMITTED_IDEA.title)).toBeInTheDocument();
    expect(screen.getByText(SUBMITTED_IDEA.description)).toBeInTheDocument();
    expect(screen.getByText(SUBMITTED_IDEA.category)).toBeInTheDocument();
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /brief\.pdf/i })).toBeInTheDocument();
  });

  it('should display the evaluation notes section when status is "accepted"', () => {
    // Arrange — AC-4: "status accepted → evaluation notes visible"
    render(
      <IdeaDetailPage
        idea={ACCEPTED_IDEA}
        attachment={null}
        evaluation={{ notes: ACCEPTED_EVALUATION_NOTES }}
      />
    );

    // Assert — derived from US-003 AC-4
    expect(screen.getByText(/evaluation notes/i)).toBeInTheDocument();
    expect(screen.getByText(ACCEPTED_EVALUATION_NOTES)).toBeInTheDocument();
  });

  it('should display the evaluation notes section when status is "rejected"', () => {
    // Arrange — AC-5: "status rejected → evaluation notes visible"
    render(
      <IdeaDetailPage
        idea={REJECTED_IDEA}
        attachment={null}
        evaluation={{ notes: REJECTED_EVALUATION_NOTES }}
      />
    );

    // Assert — derived from US-003 AC-5
    expect(screen.getByText(/evaluation notes/i)).toBeInTheDocument();
    expect(screen.getByText(REJECTED_EVALUATION_NOTES)).toBeInTheDocument();
  });

  it('should hide the evaluation notes section when status is "submitted"', () => {
    // Arrange — AC-4/5 inverse: no evaluation yet
    render(
      <IdeaDetailPage
        idea={SUBMITTED_IDEA}
        attachment={null}
        evaluation={null}
      />
    );

    // Assert — evaluation notes must NOT be rendered when no evaluation exists
    expect(screen.queryByText(/evaluation notes/i)).not.toBeInTheDocument();
  });
});
