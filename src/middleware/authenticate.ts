import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

/** Authenticated request with verified JWT payload attached. */
export interface AuthenticatedRequest extends Request {
  auth: {
    sub: string;
    jti: string;
  };
}

/**
 * Express middleware that verifies the RS256-signed JWT Bearer token.
 * Validates signature, expiry, and required claims: sub, iat, exp, jti (FR-005).
 * Returns HTTP 401 on any failure without revealing the reason.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const publicKey = env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");
    const payload = jwt.verify(token, publicKey, {
      algorithms: [env.JWT_ALGORITHM],
    }) as JwtPayload;

    if (!payload.sub || !payload.jti || !payload.iat || !payload.exp) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    (req as AuthenticatedRequest).auth = {
      sub: payload.sub,
      jti: payload.jti,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid credentials" });
  }
}
