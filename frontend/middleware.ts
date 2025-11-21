import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/utiils/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /library and its subpaths
  if (pathname.startsWith('/library')) {
    const supabase = createMiddlewareSupabaseClient(req)

    try {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    } catch (err) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/library/:path*'],
}
