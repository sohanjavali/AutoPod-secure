import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// Validates req.body against a zod schema and stores the parsed result on res.locals.body
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue?.path.join(".");
      const message = field ? `Invalid "${field}" in request body.` : "Invalid request body.";
      res.status(400).json({ error: message });
      return;
    }
    res.locals.body = result.data;
    next();
  };
}
