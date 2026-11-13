import { AsyncLocalStorage } from "node:async_hooks";
import type { Request, Response, NextFunction } from "express";
import type { Logger } from "pino";
import { logger } from "./logger.ts";

export interface RequestContext {
  requestId: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

// Enters the per-request context. Mount after pino-http (needs req.id) and after body parsing.
export function requestContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  storage.run({ requestId: String(req.id) }, next);
}

// Called after authMiddleware succeeds.
export function setContextUserId(userId: string): void {
  const store = storage.getStore();
  if (store) store.userId = userId;
}

// Child logger bound to the current request; base logger outside a request.
export function getLog(): Logger {
  const store = storage.getStore();
  if (!store) return logger;
  return logger.child(store.userId ? { requestId: store.requestId, userId: store.userId } : { requestId: store.requestId });
}
