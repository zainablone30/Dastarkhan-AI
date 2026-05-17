"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const nextPath = searchParams.get("next") || "/dashboard"
    const code = searchParams.get("code")

    if (!code) {
      router.replace(nextPath)
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setErrorMessage(error.message)
        return
      }

      router.replace(nextPath)
    })
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold">Signing you in...</p>
        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </main>
  )
}
