import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

// ─── T016: LoginForm component (US-001 AC-4) ─────────────────────────────────
// Constitution §6 — Mock: next-auth/react signIn mocked in setup.ts.

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
  });

  it('should display "Invalid email or password" when signIn returns an error', async () => {
    // Arrange — AC-4: "incorrect credentials → error shown"
    vi.mocked(signIn).mockResolvedValueOnce({ error: 'CredentialsSignin', ok: false, status: 401, url: null });
    render(<LoginForm />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@epam.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPass!');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Assert — derived from US-001 AC-4
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should not navigate away from /login when credentials are incorrect', async () => {
    // Arrange — AC-4: "no session is created"
    vi.mocked(signIn).mockResolvedValueOnce({ error: 'CredentialsSignin', ok: false, status: 401, url: null });
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() } as any);
    render(<LoginForm />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@epam.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPass!');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Assert
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
