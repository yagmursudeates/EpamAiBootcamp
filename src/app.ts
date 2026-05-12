import express, { Application, Request, Response, NextFunction } from "express";
import { authRouter } from "./routes/auth.router";

/**
 * Creates and configures the Express application.
 * Does not call `listen` — kept testable (supertest compatible).
 *
 * @returns Configured Express application
 */
export function createApp(): Application {
  const app = express();

  // Enforce HTTPS — reject plaintext HTTP (FR-014)
  app.use((req: Request, res: Response, next: NextFunction): void => {
    if (req.headers["x-forwarded-proto"] === "http") {
      res.redirect(301, `https://${req.headers.host ?? ""}${req.url}`);
      return;
    }
    next();
  });

  app.use(express.json());

  // Mount authentication routes
  app.use("/auth", authRouter);

  // 404 handler
  app.use((_req: Request, res: Response): void => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
