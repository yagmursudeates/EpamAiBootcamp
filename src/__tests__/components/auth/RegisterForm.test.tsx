import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/auth/RegisterForm';

// ─── T015: RegisterForm component (US-001 AC-1, AC-2) ───────────────────────
// Constitution §6 — Mock: fetch stubbed; next/navigation mocked in setup.ts.

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should display the inline error "Email already in use" when the API responds with 409', async () => {
    // Arrange — AC-2
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Email already in use' }), { status: 409 })
    );
    render(<RegisterForm />);

    // Act
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice Tester');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@epam.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // Assert — derived from US-001 AC-2
    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  it('should display a validation error when the password field has fewer than 8 characters', async () => {
    // Arrange — AC-1 client-side validation
    render(<RegisterForm />);

    // Act
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice Tester');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@epam.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should call router.push("/dashboard") on a successful 201 response', async () => {
    // Arrange — AC-1: "redirected to /dashboard"
    const mockPush = vi.fn();
    vi.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush, replace: vi.fn() }),
      usePathname: () => '/',
    }));
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ user: { id: '1', role: 'submitter' } }), { status: 201 })
    );
    render(<RegisterForm />);

    // Act
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice Tester');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@epam.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    // Assert
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
