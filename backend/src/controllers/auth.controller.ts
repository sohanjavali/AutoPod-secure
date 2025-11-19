import type { Request, Response, NextFunction } from "express";
import type { Config } from "../config/env.js";

/**
 * auth.controller.ts
 * - Handles HTTP layer for auth-related endpoints.
 * - Delegates to auth.service for actual Supabase operations.
 */

/**
 * signupController
 * POST /auth/signup
 * - Expected to read { email, password } from req.body
 * - Validate input, call auth.service.createUser, and return created user (or errors)
 */
export async function signupController(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO: validate request body and call service
  throw new Error("signupController not implemented");
}

/**
 * loginController
 * POST /auth/login
 * - Expected to read { email, password } from req.body
 * - Exchange credentials for a session/token or delegate to Supabase client
 */
export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO: validate request body and call service
  throw new Error("loginController not implemented");
}
