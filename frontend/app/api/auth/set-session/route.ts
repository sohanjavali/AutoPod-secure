import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { access_token, refresh_token, expires_at } = body || {}

  const res = NextResponse.json({ ok: true })

  // Set short-lived access token cookie
  if (access_token) {
    res.cookies.set('autopod_access_token', access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })
  }

  // Set refresh token cookie
  if (refresh_token) {
    res.cookies.set('autopod_refresh_token', refresh_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })
  }

    return res
}
