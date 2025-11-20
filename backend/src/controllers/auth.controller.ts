// backend/src/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { loginWithEmail } from "../services/auth.service";
import logger from "../utils/logger";

export function loginController(req: Request, res: Response) {
  const { email } = req.body || {};

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      error: "Invalid request",
      message: "Field 'email' is required and must be a non-empty string",
    });
  }

  const { user, token } = loginWithEmail(email.trim());

  logger.info(`[auth] login for ${email}`);

  res.status(200).json({
    success: true,
    user,
    token,
  });
}
