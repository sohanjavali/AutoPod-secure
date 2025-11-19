import type { Request, Response, NextFunction } from "express";

/**
 * podcast.controller.ts
 * - Handles HTTP layer for podcast endpoints
 * - Delegates to services: research, script, tts, db
 */

/**
 * generatePodcastController
 * POST /podcast/generate
 * - Expected to read { prompt } from req.body
 * - Orchestrates research -> script -> tts -> save
 */
export async function generatePodcastController(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO: parse and validate input, call services, return audio URL + metadata
  throw new Error("generatePodcastController not implemented");
}

/**
 * getPodcastController
 * GET /podcast/:id
 * - Fetches stored episode metadata (including audio URL) from DB
 */
export async function getPodcastController(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO: call db.service to fetch episode by id and return it
  throw new Error("getPodcastController not implemented");
}
