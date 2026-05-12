import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Express middleware factory that validates the request body against a Zod schema.
 * Returns HTTP 400 with field-level error details on validation failure (FR-015).
 *
 * @param schema - Zod schema to validate `req.body` against
 * @returns Express middleware function
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      res.status(400).json({ error: "Validation failed", fields: errors });
      return;
    }
    req.body = result.data as Record<string, unknown>;
    next();
  };
}
