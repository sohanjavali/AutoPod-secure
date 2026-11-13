import type { Request, Response, NextFunction } from "express";
import { GuardrailError } from "../guardrails/errors.ts";

// JSON 404 for unmatched routes
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

// Central error handler. Never leaks internals to the client.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof GuardrailError) {
    res.status(400).json({ error: err.publicMessage });
    return;
  }

  // Body-parser errors carry a type like "entity.too.large" / "entity.parse.failed"
  const parserErr = err as { type?: unknown } | null;
  const type = typeof parserErr?.type === "string" ? parserErr.type : undefined;
  if (type === "entity.too.large") {
    res.status(413).json({ error: "Request body too large" });
    return;
  }
  if (type === "entity.parse.failed" || type === "encoding.unsupported" || type === "charset.unsupported") {
    res.status(400).json({ error: "Malformed request body" });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}
