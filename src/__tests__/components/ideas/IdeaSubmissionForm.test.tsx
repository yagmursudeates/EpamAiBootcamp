import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IdeaSubmissionForm from '@/components/ideas/IdeaSubmissionForm';

// ─── T022: IdeaSubmissionForm component (US-002 AC-3, AC-4, AC-5) ────────────

const FIVE_CATEGORIES = [
  'Technical',
  'Process Improvement',
  'Client Solutions',
  'Cost Reduction',
  'Employee Experience',
];

describe('IdeaSubmissionForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should display an inline error under the title field when title is empty on submit', async () => {
    // Arrange — AC-3
    render(<IdeaSubmissionForm />);

    // Act — submit without filling in title
    await userEvent.type(screen.getByLabelText(/description/i), 'Some valid description.');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Assert — derived from US-002 AC-3: "inline validation errors shown"
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('should display an inline error under the description field when description is empty on submit', async () => {
    // Arrange — AC-3
    render(<IdeaSubmissionForm />);

    // Act
    await userEvent.type(screen.getByLabelText(/title/i), 'A valid idea title');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it('should display "File must be under 10 MB" when the user selects a file exceeding 10 MB', async () => {
    // Arrange — AC-4
    render(<IdeaSubmissionForm />);
    const oversizedFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'huge.pdf', {
      type: 'application/pdf',
    });

    // Act
    const fileInput = screen.getByLabelText(/attach/i);
    await userEvent.upload(fileInput, oversizedFile);

    // Assert — derived from US-002 AC-4
    await waitFor(() => {
      expect(screen.getByText(/file must be under 10 mb/i)).toBeInTheDocument();
    });
  });

  it('should render exactly 5 category options matching the defined enum', async () => {
    // Arrange — AC-5: "only the five defined categories are available"
    render(<IdeaSubmissionForm />);

    // Act
    const categorySelect = screen.getByLabelText(/category/i);
    await userEvent.click(categorySelect);

    // Assert — derived from US-002 AC-5
    for (const category of FIVE_CATEGORIES) {
      expect(screen.getByRole('option', { name: category })).toBeInTheDocument();
    }
    // Exactly 5 options (excluding any placeholder)
    const options = screen.getAllByRole('option');
    const categoryOptions = options.filter((o) => FIVE_CATEGORIES.includes(o.textContent ?? ''));
    expect(categoryOptions).toHaveLength(5);
  });
});
