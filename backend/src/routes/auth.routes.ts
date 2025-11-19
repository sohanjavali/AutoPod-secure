import express from "express";
import type { Request, Response, NextFunction } from "express";
import { signupController, loginController } from "../controllers/auth.controller.js";

/**
 * auth.routes.ts
 * - POST /auth/signup
 * - POST /auth/login
 *
 * Routes delegate to controllers which contain request/response handling and
 * call into services for the real work.
 */

const router = express.Router();

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  // Controller handles validation and response
  return signupController(req, res, next);
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  return loginController(req, res, next);
});

export default router;
