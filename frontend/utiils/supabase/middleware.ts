import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

type CookieEntry = { name: string; value: string }

export function createMiddlewareSupabaseClient(req: NextRequest) {
  // Provide a minimal cookies adapter for createServerClient using Next.js middleware request
  const cookiesAdapter = {
    getAll() {
      // NextRequest.cookies may expose getAll in some runtimes
      // @ts-ignore
      if (typeof req.cookies.getAll === 'function') {
        // Each item has { name, value }
        // @ts-ignore
        return req.cookies.getAll().map((c: any) => ({ name: c.name, value: c.value })) as CookieEntry[]
      }

      // Fallback: read known cookie names
      const entries: CookieEntry[] = []
      const access = req.cookies.get('autopod_access_token')?.value
      if (access) entries.push({ name: 'autopod_access_token', value: access })
      const refresh = req.cookies.get('autopod_refresh_token')?.value
      if (refresh) entries.push({ name: 'autopod_refresh_token', value: refresh })
      return entries
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: cookiesAdapter }
  )
}
