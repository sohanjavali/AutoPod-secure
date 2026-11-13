import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.ts";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.ts";
import type { AppLocals } from "./locals.ts";

// Middleware to authenticate requests using Supabase Auth
export async function authMiddleware(
  req: Request,
  res: Response<any, AppLocals>,
  next: NextFunction
): Promise<void> {
  // Expect "Authorization: Bearer <token>"
  const header = req.headers.authorization;
  const parts = typeof header === "string" ? header.split(" ") : [];
  const token = parts.length === 2 && parts[0]?.toLowerCase() === "bearer" ? parts[1] : undefined;

  if (!token) {
    res.status(401).json({ error: "Missing or malformed authorization token" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  res.locals.user = data.user;

  // Supabase client acting as the user, for further operations
  res.locals.supabase = createClient(
    env.SUPABASE_URL!,
    env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  next();
}
