import { vi } from 'vitest';
import type { UserRole } from '../types';

export interface MockSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  expires: string;
}

/**
 * Returns a mock NextAuth session object.
 * Use with `vi.mocked(getServerSession).mockResolvedValue(mockSession())`.
 *
 * Constitution §6 — Mock: NextAuth session mocked in all component and API tests.
 */
export function mockSession(overrides?: Partial<MockSession['user']>): MockSession {
  return {
    user: {
      id: 'test-user-submitter-1',
      name: 'Alice Tester',
      email: 'alice@epam.com',
      role: 'submitter',
      ...overrides,
    },
    expires: '2099-01-01T00:00:00.000Z',
  };
}

/**
 * Returns a mock admin session.
 */
export function mockAdminSession(overrides?: Partial<MockSession['user']>): MockSession {
  return mockSession({ id: 'test-user-admin-1', role: 'admin', ...overrides });
}

/**
 * Shorthand: mock getServerSession to return the given session value.
 * Import getServerSession from next-auth and pass it here.
 */
export function setupSessionMock(
  getServerSession: ReturnType<typeof vi.fn>,
  session: MockSession | null
): void {
  getServerSession.mockResolvedValue(session);
}
