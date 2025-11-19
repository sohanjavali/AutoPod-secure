import express from "express";
import type { Request, Response } from "express";
import { healthController } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  // Simple health check response delegated to controller
  return healthController(req, res);
});

export default router;
