import type { Request, Response, NextFunction } from "express";

/**
 * auth.middleware.ts
 * - Middleware that validates JWT/session for protected routes
 * - In this project, Supabase-authenticated sessions or custom JWTs can be supported.
 */

export async function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO: verify Authorization header / cookie, validate token, attach user to req
  throw new Error("jwtAuthMiddleware not implemented");
}
