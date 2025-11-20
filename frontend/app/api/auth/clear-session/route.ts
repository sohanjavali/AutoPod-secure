import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  // Clear cookies we set for session
  res.cookies.set('autopod_access_token', '', { path: '/', httpOnly: true, maxAge: 0 })
  res.cookies.set('autopod_refresh_token', '', { path: '/', httpOnly: true, maxAge: 0 })

  return res
}
