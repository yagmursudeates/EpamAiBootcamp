import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from '@/components/notifications/NotificationBell';

// ─── T041: NotificationBell component (US-005 AC-1 UI, AC-3 UI, AC-6 UI) ─────

const UNREAD_NOTIFICATIONS = [
  { id: 'n1', message: 'Your idea "Project A" has been accepted', is_read: 0, created_at: '2026-05-17T10:00:00.000Z' },
  { id: 'n2', message: 'Your idea "Project B" has been rejected', is_read: 0, created_at: '2026-05-16T10:00:00.000Z' },
];

const READ_NOTIFICATIONS = [
  { id: 'n1', message: 'Your idea "Project A" has been accepted', is_read: 1, created_at: '2026-05-17T10:00:00.000Z' },
];

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, init?: RequestInit) => {
        if (init?.method === 'PATCH') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true }),
          });
        }
        // GET /api/notifications
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ notifications: UNREAD_NOTIFICATIONS }),
        });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should render a badge displaying the correct unread count when there are unread notifications', async () => {
    // Arrange / Act — AC-1 UI
    render(<NotificationBell />);

    // Assert — badge appears after fetch resolves
    const badge = await screen.findByTestId('unread-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('2');
  });

  it('should not render a count badge when all notifications have is_read = 1', async () => {
    // Arrange — override fetch to return only read notifications
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ notifications: READ_NOTIFICATIONS }),
      })
    );

    // Act — AC-3 UI
    render(<NotificationBell />);

    // Assert — badge should not appear
    await waitFor(() => {
      expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
    });
  });

  it('should call PATCH /api/notifications with { markAllRead: true } when the bell button is clicked', async () => {
    // Arrange — AC-6 UI
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ok: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ notifications: UNREAD_NOTIFICATIONS }),
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<NotificationBell />);
    await screen.findByTestId('unread-badge'); // wait for initial fetch

    // Act — click the bell (userEvent simulates a full browser-like interaction)
    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    // Assert — PATCH called with markAllRead
    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        ([, init]) => (init as RequestInit)?.method === 'PATCH'
      );
      expect(patchCall).toBeDefined();
      const bodyParsed = JSON.parse((patchCall![1] as RequestInit).body as string);
      expect(bodyParsed).toEqual({ markAllRead: true });
    });
  });
});
