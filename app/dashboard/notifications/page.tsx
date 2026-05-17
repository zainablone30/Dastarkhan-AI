"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { supabase } from "@/lib/supabase"
import {
  Bell,
  CheckCircle,
  Truck,
  ArrowLeft,
  Clock,
  Star,
  Package,
  XCircle,
} from "lucide-react"

type OrderStatus = "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered" | "cancelled"

type NotificationItem = {
  id: string
  title: string
  detail: string | null
  status: OrderStatus | null
  order_id: string | null
  created_at: string
}

type IconType = (props: { className?: string }) => JSX.Element

const STATUS_STYLE: Record<OrderStatus, { icon: IconType; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  confirmed: { icon: Star, color: "text-blue-500", bg: "bg-blue-500/10" },
  preparing: { icon: Package, color: "text-amber-500", bg: "bg-amber-500/10" },
  on_the_way: { icon: Truck, color: "text-primary", bg: "bg-primary/10" },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
}

function formatRelativeTime(iso: string) {
  const created = new Date(iso).getTime()
  const diffMs = Date.now() - created
  if (Number.isNaN(created) || diffMs < 0) return "Just now"

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    let active = true
    let channel: any = null

    const loadNotifications = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, detail, status, order_id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (!error && data && active) {
        setNotifications(data as NotificationItem[])
      }
      setLoading(false)
    }

    loadNotifications()

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const ch = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (!active) return

            if (payload.eventType === "INSERT") {
              setNotifications((prev) => [payload.new as NotificationItem, ...prev])
              return
            }

            if (payload.eventType === "DELETE") {
              setNotifications((prev) => prev.filter((item) => item.id !== payload.old.id))
              return
            }

            if (payload.eventType === "UPDATE") {
              setNotifications((prev) =>
                prev.map((item) => (item.id === payload.new.id ? (payload.new as NotificationItem) : item)),
              )
            }
          },
        )
        .subscribe()

      channel = ch
    }

    setupRealtime()

    return () => {
      active = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const handleClearAll = async () => {
    setClearing(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setClearing(false)
      return
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", session.user.id)

    if (!error) {
      setNotifications([])
    }
    setClearing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-6 pt-20 lg:pt-6">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">Latest updates from your orders and AI.</p>
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="ml-auto rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
                disabled={clearing}
              >
                {clearing ? "Clearing..." : "Clear all"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 border-4 border-muted border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm">Notifications load ho rahi hain…</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="font-bold text-foreground text-lg">Abhi koi notification nahi</p>
            <p className="text-muted-foreground text-sm mt-1">
              Order status update yahan dikhayenge.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item, index) => {
              const style = item.status ? STATUS_STYLE[item.status] : null
              const Icon = style?.icon || Bell
              const color = style?.color || "text-primary"
              const bg = style?.bg || "bg-primary/10"

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold text-foreground">{item.title}</h2>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
