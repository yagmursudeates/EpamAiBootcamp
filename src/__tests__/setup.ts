import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// --- next-auth global mock ---
// All component and API tests use mockSession() from src/__tests__/helpers/auth.ts
// to override this default null session.
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// --- next/navigation global mock ---
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
}));

// --- Reset all mocks after every test (Constitution §5) ---
afterEach(() => {
  vi.clearAllMocks();
});
