"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { supabase } from "@/lib/supabase"
// dismissBroadcast and localStorage helpers are inlined below (no import needed)
import {
  Bell,
  CheckCircle,
  Truck,
  ArrowLeft,
  Clock,
  Star,
  Package,
  XCircle,
  Utensils,
  Store,
  PartyPopper,
  Trash2,
  CheckCheck,
  X,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered" | "cancelled"
type NotifType = "order_status" | "welcome" | "new_dish" | "new_restaurant"

type NotificationItem = {
  id: string
  user_id: string
  title: string
  detail: string | null
  type: NotifType | string
  status: OrderStatus | null
  order_id: string | null
  is_read: boolean
  created_at: string
  image_url?: string | null
}

// ── Visual config ──────────────────────────────────────────────────────────
const ORDER_STYLE: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string; ring: string }> = {
  pending:   { icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30",  ring: "ring-yellow-200" },
  confirmed: { icon: Star,         color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30",      ring: "ring-blue-200" },
  preparing: { icon: Package,      color: "text-amber-600",  bg: "bg-amber-100 dark:bg-amber-900/30",    ring: "ring-amber-200" },
  on_the_way:{ icon: Truck,        color: "text-primary",    bg: "bg-primary/10",                        ring: "ring-primary/20" },
  delivered: { icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-100 dark:bg-green-900/30",    ring: "ring-green-200" },
  cancelled: { icon: XCircle,      color: "text-red-500",    bg: "bg-red-100 dark:bg-red-900/30",        ring: "ring-red-200" },
}

const TYPE_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string; ring: string; badge: string }> = {
  welcome: {
    icon: PartyPopper,
    color: "text-purple-600",
    bg: "bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40",
    ring: "ring-purple-200 dark:ring-purple-700",
    badge: "Khush Amdeed",
  },
  new_dish: {
    icon: Utensils,
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    ring: "ring-orange-200 dark:ring-orange-700",
    badge: "Naya Dish",
  },
  new_restaurant: {
    icon: Store,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    ring: "ring-blue-200 dark:ring-blue-700",
    badge: "Naya Restaurant",
  },
  order_status: {
    icon: Bell,
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/20",
    badge: "Order",
  },
}

function getStyle(item: NotificationItem) {
  if (item.type === "order_status" && item.status && ORDER_STYLE[item.status]) {
    const s = ORDER_STYLE[item.status]
    return { Icon: s.icon, color: s.color, bg: s.bg, ring: s.ring, badge: item.status.replace("_", " ") }
  }
  const s = TYPE_STYLE[item.type] || TYPE_STYLE.order_status
  return { Icon: s.icon, color: s.color, bg: s.bg, ring: s.ring, badge: s.badge }
}

// ── Time helper ────────────────────────────────────────────────────────────
function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "Abhi abhi"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min pehle`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ghante pehle`
  if (diff < 172_800_000) return "Kal"
  return `${Math.floor(diff / 86_400_000)} din pehle`
}

function groupByDate(items: NotificationItem[]) {
  const groups: Record<string, NotificationItem[]> = {}
  const now = Date.now()
  for (const item of items) {
    const diff = now - new Date(item.created_at).getTime()
    let key: string
    if (diff < 86_400_000) key = "Aaj"
    else if (diff < 172_800_000) key = "Kal"
    else key = "Pehle"
    ;(groups[key] ||= []).push(item)
  }
  return Object.entries(groups)
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [clearing, setClearing] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)

  const loadDismissed = useCallback(() => {
    try {
      const raw = localStorage.getItem("dk-dismissed-broadcasts")
      setDismissedIds(new Set(raw ? JSON.parse(raw) : []))
    } catch {
      setDismissedIds(new Set())
    }
  }, [])

  const saveDismissed = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem("dk-dismissed-broadcasts", JSON.stringify([...ids]))
    } catch {}
    setDismissedIds(new Set(ids))
  }, [])

  useEffect(() => {
    loadDismissed()
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function load() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      setUserId(session.user.id)

      const { data } = await supabase
        .from("notifications")
        .select("id, user_id, title, detail, type, status, order_id, is_read, created_at, image_url")
        .or(`user_id.eq.${session.user.id},user_id.eq.broadcast`)
        .order("created_at", { ascending: false })

      if (data && active) setNotifications(data as NotificationItem[])
      setLoading(false)

      // realtime
      channel = supabase
        .channel("notifications-page")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
          if (!active) return
          const n = payload.new as NotificationItem
          if (n.user_id === session.user.id || n.user_id === "broadcast") {
            setNotifications((prev) => [n, ...prev])
          }
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "notifications" }, (payload) => {
          if (active) setNotifications((prev) => prev.filter((x) => x.id !== payload.old.id))
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications" }, (payload) => {
          if (active) {
            setNotifications((prev) =>
              prev.map((x) => (x.id === payload.new.id ? (payload.new as NotificationItem) : x))
            )
          }
        })
        .subscribe()
    }

    load()
    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [loadDismissed])

  // Visible notifications (excluding dismissed broadcasts)
  const visible = notifications.filter((n) => {
    if (n.user_id === "broadcast") return !dismissedIds.has(n.id)
    return true
  })

  const unreadCount = visible.filter((n) => !n.is_read && !dismissedIds.has(n.id)).length

  async function handleDeletePersonal(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id)
    if (!error) setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function handleDismissBroadcast(id: string) {
    const next = new Set(dismissedIds)
    next.add(id)
    saveDismissed(next)
  }

  async function handleDismiss(item: NotificationItem) {
    if (item.user_id === "broadcast") {
      handleDismissBroadcast(item.id)
    } else {
      await handleDeletePersonal(item.id)
    }
  }

  async function handleClearPersonal() {
    if (!userId) return
    setClearing(true)
    await supabase.from("notifications").delete().eq("user_id", userId)
    setNotifications((prev) => prev.filter((n) => n.user_id === "broadcast"))
    setClearing(false)
  }

  function handleDismissAllBroadcasts() {
    const next = new Set(dismissedIds)
    notifications.filter((n) => n.user_id === "broadcast").forEach((n) => next.add(n.id))
    saveDismissed(next)
  }

  async function handleMarkAllRead() {
    if (!userId) return
    setMarkingRead(true)
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === userId ? { ...n, is_read: true } : n))
    )
    setMarkingRead(false)
  }

  const groups = groupByDate(visible)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-4 pt-20 sm:p-6 lg:pt-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                  <Bell className="w-6 h-6 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                  <p className="text-sm text-muted-foreground">
                    {visible.length === 0 ? "Sab kuch theek hai" : `${visible.length} notification${visible.length !== 1 ? "s" : ""}`}
                    {unreadCount > 0 && <span className="text-primary font-semibold"> · {unreadCount} unread</span>}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {visible.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markingRead}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {markingRead ? "..." : "Mark read"}
                    </button>
                  )}
                  <button
                    onClick={() => { handleClearPersonal(); handleDismissAllBroadcasts() }}
                    disabled={clearing}
                    className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {clearing ? "..." : "Clear all"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <div className="w-10 h-10 border-4 border-muted border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm">Notifications load ho rahi hain…</p>
            </div>
          ) : visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <p className="font-bold text-foreground text-lg">Koi notification nahi</p>
              <p className="text-muted-foreground text-sm mt-1">
                Order karo — status updates yahan dikhenge!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {groups.map(([groupLabel, items]) => (
                <div key={groupLabel}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    {groupLabel}
                  </p>
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((item, index) => {
                        const { Icon, color, bg, ring, badge } = getStyle(item)
                        const isBroadcast = item.user_id === "broadcast"
                        const isWelcome = item.type === "welcome"

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 24, scale: 0.95 }}
                            transition={{ delay: index * 0.04 }}
                            className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all
                              ${!item.is_read && !isBroadcast
                                ? "bg-card border-primary/30 shadow-sm shadow-primary/5"
                                : "bg-card border-border/50"
                              }
                              ${isWelcome ? "bg-linear-to-r from-purple-50/60 to-pink-50/60 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/60 dark:border-purple-800/40" : ""}
                            `}
                          >
                            {/* Unread dot */}
                            {!item.is_read && !isBroadcast && (
                              <span className="absolute top-4 left-3 w-2 h-2 rounded-full bg-primary" />
                            )}

                            {/* Icon */}
                            <div className={`relative shrink-0 w-11 h-11 rounded-xl ${bg} ring-1 ${ring} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${color}`} />
                              {isBroadcast && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                                  <Bell className="w-2.5 h-2.5 text-white" />
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${bg} ${color}`}>
                                      {badge}
                                    </span>
                                    {isBroadcast && (
                                      <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 dark:bg-orange-900/30 rounded-full px-2 py-0.5">
                                        Announcement
                                      </span>
                                    )}
                                  </div>
                                  <h2 className={`font-semibold text-sm text-foreground leading-snug ${!item.is_read && !isBroadcast ? "font-bold" : ""}`}>
                                    {item.title}
                                  </h2>
                                  {item.detail && (
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                      {item.detail}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-muted-foreground mt-1.5">
                                    {formatRelativeTime(item.created_at)}
                                  </p>
                                </div>

                                {/* Dismiss button */}
                                <button
                                  onClick={() => handleDismiss(item)}
                                  className="shrink-0 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                  title="Dismiss"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Order action */}
                              {item.order_id && (
                                <button
                                  onClick={() => router.push(`/dashboard/orders`)}
                                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                                >
                                  Order track karo →
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
