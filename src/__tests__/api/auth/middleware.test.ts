import { describe, it, expect, vi } from 'vitest';
import { applyAuthMiddleware } from '@/lib/middleware-helpers';
import { mockSession } from '../../helpers/auth';

// ─── T017: Auth middleware redirect (US-001 AC-6) ────────────────────────────
// Tests the middleware logic that redirects unauthenticated users to /login.
// Constitution §6 — Stub: auth() from next-auth stubbed per test.

describe('applyAuthMiddleware', () => {
  it('should redirect an unauthenticated request for /dashboard to /login', async () => {
    // Arrange — AC-6: "unauthenticated user navigates to /dashboard → redirected to /login"
    vi.mock('@/auth', () => ({ auth: vi.fn(() => Promise.resolve(null)) }));
    const request = new Request('http://localhost/dashboard');

    // Act
    const response = await applyAuthMiddleware(request, null);

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should allow an authenticated request for /dashboard without redirecting', async () => {
    // Arrange — AC-6 inverse
    const session = mockSession();

    // Act
    const response = await applyAuthMiddleware(new Request('http://localhost/dashboard'), session);

    // Assert — null means "pass through" (no redirect)
    expect(response).toBeNull();
  });

  it('should redirect an unauthenticated request for /submit to /login', async () => {
    // Arrange — protection applies to all authenticated routes
    const request = new Request('http://localhost/submit');

    // Act
    const response = await applyAuthMiddleware(request, null);

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });
});
