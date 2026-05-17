"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

const DISMISSED_KEY = "dk-dismissed-broadcasts"

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]))
  } catch {}
}

export function dismissBroadcast(id: string) {
  const set = getDismissed()
  set.add(id)
  saveDismissed(set)
}

export function useUnreadCount() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCount(0); return }

    const dismissed = getDismissed()

    const { data } = await supabase
      .from("notifications")
      .select("id, user_id, is_read")
      .or(`user_id.eq.${session.user.id},user_id.eq.broadcast`)
      .eq("is_read", false)

    if (!data) return

    const unread = data.filter((n) => {
      if (n.user_id === "broadcast") return !dismissed.has(n.id)
      return true
    })
    setCount(unread.length)
  }, [])

  useEffect(() => {
    refresh()

    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      channel = supabase
        .channel("notif-badge")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          () => refresh(),
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "notifications" },
          () => refresh(),
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications" },
          () => refresh(),
        )
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [refresh])

  return { count, refresh }
}
