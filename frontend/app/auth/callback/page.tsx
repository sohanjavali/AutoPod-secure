"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/utiils/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const finishAuth = async () => {
      const supabase = createSupabaseClient()

      // Get session from Supabase Auth
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        router.replace('/')
        return
      }

      // Check if session exists
      const session = data?.session
      if (!session) {
        router.replace('/')
        return
      }

      // Send tokens to server to set HttpOnly cookies so middleware can read them
      await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        }),
      })

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
