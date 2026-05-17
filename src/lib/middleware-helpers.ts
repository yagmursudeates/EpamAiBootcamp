import type { MockSession } from '@/__tests__/helpers/auth';

const PROTECTED_PATHS = ['/dashboard', '/submit', '/ideas'];

export async function applyAuthMiddleware(
  request: Request,
  session: MockSession | null
): Promise<Response | null> {
  const url = new URL(request.url);
  const isProtected = PROTECTED_PATHS.some((p) => url.pathname.startsWith(p));

  if (isProtected && !session) {
    return Response.redirect(new URL('/login', request.url), 307);
  }

  return null;
}
