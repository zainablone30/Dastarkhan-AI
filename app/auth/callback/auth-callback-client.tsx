"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const nextPath = searchParams.get("next") || "/dashboard"
    const code = searchParams.get("code")

    if (!code) {
      router.replace(nextPath)
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setIsRetrying(true)
        setTimeout(() => {
          router.replace("/login?error=oauth")
        }, 1500)
        return
      }

      router.replace(nextPath)
    })
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold">Signing you in...</p>
        {isRetrying && (
          <p className="text-sm text-muted-foreground">Session expired. Redirecting to login...</p>
        )}
      </div>
    </main>
  )
}
