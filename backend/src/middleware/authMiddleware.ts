import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.ts";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.ts";

// Middleware to authenticate requests using Supabase Auth
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
  // Extract the token from the authorization header and verify it
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Create a Supabase client with the user's token for further operations
  req.body.user = data.user;

  req.body.supabase = createClient(
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
