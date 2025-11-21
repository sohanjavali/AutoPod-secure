"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/utiils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const finishAuth = async () => {
      const supabase = createSupabaseClient()

      // supabase-js stores session in browser storage after redirect
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session after OAuth redirect', error)
        router.replace('/')
        return
      }

      const session = data?.session
      if (!session) {
        // No session, go home
        router.replace('/')
        return
      }

      // Send tokens to server to set HttpOnly cookies so middleware can read them
      try {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        })
      } catch (err) {
        console.error('Failed to persist session to cookie', err)
      }

      // Redirect to dashboard after cookies set
      router.replace('/library')
    }

    finishAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-foreground">Finishing sign-in…</p>
      </div>
    </div>
  )
}
