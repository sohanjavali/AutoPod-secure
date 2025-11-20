// backend/src/middleware/auth.middleware.ts
import type { NextFunction, Response } from "express";
import { AuthedRequest } from "../utils/types";
import { getUserFromToken } from "../services/auth.service";

export function authMiddleware(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const user = getUserFromToken(authHeader);
  if (user) {
    req.user = user;
  }
  next();
}
