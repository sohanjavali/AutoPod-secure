import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { access_token, refresh_token, expires_at } = body || {}

    const res = NextResponse.json({ ok: true })

    if (access_token) {
      // Set short-lived access token cookie
      res.cookies.set('autopod_access_token', access_token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      })
    }

    if (refresh_token) {
      // Set refresh token cookie
      res.cookies.set('autopod_refresh_token', refresh_token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        // keep refresh token longer
      })
    }

    if (expires_at) {
      // Optionally set expiry (not strictly necessary here)
      // Note: NextResponse cookie API doesn't accept expires as unix timestamp directly
    }

    return res
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
