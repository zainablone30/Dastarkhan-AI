"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { OrderMap } from "@/components/dashboard/order-map"
import {
  Package, Clock, CheckCircle, XCircle,
  ChevronRight, ArrowLeft, Truck, Star,
  RotateCcw, MapPin, ShoppingBag, Smartphone, Copy, CheckCheck,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/lib/cart-context"

// ── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  food_id: string
  name: string
  price: number
  quantity: number
  image?: string
  restaurant_name?: string
}

type OrderStatus = "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered" | "cancelled"

type Order = {
  id: string
  restaurant_area?: string
  restaurant_lat?: number
  restaurant_lng?: number
  items: OrderItem[]
  total: number
  status: OrderStatus
  customer_lat?: number
  customer_lng?: number
  estimated_minutes?: number
  created_at: string
}

function getRestaurantName(order: Order): string {
  return order.items?.[0]?.restaurant_name ?? "DastarKhan"
}

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  OrderStatus,
  { label: string; urdu: string; Icon: React.FC<{ className?: string }>; color: string; bg: string }
> = {
  pending:    { label: "Pending",    urdu: "انتظار",    Icon: Clock,        color: "text-yellow-500", bg: "bg-yellow-500/10"  },
  confirmed:  { label: "Confirmed",  urdu: "تصدیق",    Icon: Star,         color: "text-blue-500",   bg: "bg-blue-500/10"    },
  preparing:  { label: "Preparing",  urdu: "بن رہا ہے", Icon: Package,      color: "text-amber-500",  bg: "bg-amber-500/10"   },
  on_the_way: { label: "On the Way", urdu: "راستے میں",  Icon: Truck,        color: "text-primary",    bg: "bg-primary/10"     },
  delivered:  { label: "Delivered",  urdu: "پہنچ گیا",  Icon: CheckCircle,  color: "text-green-500",  bg: "bg-green-500/10"   },
  cancelled:  { label: "Cancelled",  urdu: "منسوخ",     Icon: XCircle,      color: "text-red-500",    bg: "bg-red-500/10"     },
}

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "on_the_way", "delivered"]
const SIM_DELAYS = [0, 4_000, 12_000, 35_000, 75_000]

// ── Live location hook ───────────────────────────────────────────────────────

function useLiveLocation(active: boolean) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      p => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [active])

  return pos
}

// ── Delivery simulation hook ─────────────────────────────────────────────────

function useDeliverySimulation(orderId: string | null) {
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (!orderId) return
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []

    STATUS_FLOW.forEach((status, idx) => {
      const t = setTimeout(async () => {
        await supabase.from("orders").update({ status }).eq("id", orderId)
      }, SIM_DELAYS[idx])
      timerRefs.current.push(t)
    })

    return () => timerRefs.current.forEach(clearTimeout)
  }, [orderId])
}

// ── Status timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return null
  const currentIdx = STATUS_FLOW.indexOf(status)

  return (
    <div className="flex items-center gap-0">
      {STATUS_FLOW.map((s, idx) => {
        const { Icon, color, bg, label } = STATUS_CFG[s]
        const done    = idx <= currentIdx
        const current = idx === currentIdx
        const isLast  = idx === STATUS_FLOW.length - 1

        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  done ? bg : "bg-muted"
                } ${current ? "ring-2 ring-offset-2 ring-orange-400" : ""}`}
              >
                <Icon className={`w-4 h-4 ${done ? color : "text-muted-foreground/40"}`} />
              </div>
              <span className={`text-[10px] font-medium ${done ? color : "text-muted-foreground/40"}`}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-0.5 w-6 sm:w-10 mx-0.5 mb-5 transition-colors ${
                  idx < currentIdx ? "bg-orange-400" : "bg-muted"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Payment QR section ───────────────────────────────────────────────────────

function PaymentQR({ orderId, total }: { orderId: string; total: number }) {
  const [copied, setCopied] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">Payment Required</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Easypaisa se payment karein</p>
        </div>
      </div>

      {/* Amount + QR */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* QR */}
        <div className="w-36 h-36 rounded-xl overflow-hidden border-2 border-yellow-200 bg-white flex items-center justify-center shrink-0">
          {!imgErr ? (
            <img
              src="/payment-qr.png"
              alt="Easypaisa QR"
              className="w-full h-full object-contain p-1"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="grid grid-cols-3 gap-0.5 opacity-30 p-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`rounded ${[0,2,6,8].includes(i) ? "h-6 w-6 bg-black" : i===4 ? "h-4 w-4 bg-black m-1" : "h-3 w-3 bg-gray-400 m-1.5"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2 w-full">
          <div className="rounded-xl bg-white dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-3 py-2">
            <p className="text-[10px] font-semibold text-yellow-600 uppercase tracking-wide">Amount</p>
            <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200 tabular-nums">Rs. {total}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-3 py-2">
            <p className="text-[10px] font-semibold text-yellow-600 uppercase tracking-wide">Send To</p>
            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">DastarKhan</p>
            <p className="text-xs text-yellow-600 font-mono">*******3395 · Easypaisa</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <ol className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300 list-decimal list-inside">
        <li>QR scan karein ya number pe <strong>Rs. {total}</strong> DastarKhan ko send karein</li>
        <li>Payment ka screenshot lein</li>
        <li>Screenshot admin ko WhatsApp karein</li>
      </ol>

      {/* Copy Order ID */}
      <button
        onClick={copyId}
        className="w-full flex items-center justify-between rounded-xl border border-yellow-200 bg-white dark:bg-yellow-900/20 px-3 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
      >
        <div className="text-left">
          <p className="text-[10px] text-yellow-600 font-semibold">Order ID (copy)</p>
          <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200 truncate">{orderId.slice(0, 24)}…</p>
        </div>
        {copied
          ? <CheckCheck className="w-4 h-4 text-green-500 shrink-0" />
          : <Copy className="w-4 h-4 text-yellow-500 shrink-0" />
        }
      </button>

      <p className="text-center text-[11px] text-yellow-600 dark:text-yellow-400 font-medium">
        🔐 Payment verify hone ke baad order <strong>confirm</strong> ho jayega
      </p>
    </motion.div>
  )
}

// ── Order detail panel ────────────────────────────────────────────────────────

function OrderDetail({
  order,
  liveLocation,
  onReorder,
}: {
  order: Order
  liveLocation: { lat: number; lng: number } | null
  onReorder: () => void
}) {
  const { Icon, label, color, bg } = STATUS_CFG[order.status]
  const isActive = !["delivered", "cancelled"].includes(order.status)
  const isPending = order.status === "pending"
  const customerLat = liveLocation?.lat ?? order.customer_lat
  const customerLng = liveLocation?.lng ?? order.customer_lng
  const showMap = isActive && !isPending && customerLat && customerLng && order.restaurant_lat && order.restaurant_lng
  const restaurantName = getRestaurantName(order)
  const eta = order.estimated_minutes ?? 30
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = order.total - subtotal

  return (
    <div className="space-y-4">
      {/* Payment QR for pending orders */}
      {isPending && (
        <PaymentQR orderId={order.id} total={order.total} />
      )}

      {/* Map */}
      {showMap && (
        <motion.div
          key="map"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/50 overflow-hidden h-64"
        >
          <OrderMap
            customerLat={customerLat!}
            customerLng={customerLng!}
            restaurantLat={order.restaurant_lat!}
            restaurantLng={order.restaurant_lng!}
            restaurantName={restaurantName}
            status={order.status}
          />
        </motion.div>
      )}

      {/* Info card */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-foreground text-base">{restaurantName}</p>
            {order.restaurant_area && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {order.restaurant_area}
              </p>
            )}
            {liveLocation && isActive && (
              <p className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Live location active
              </p>
            )}
          </div>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 ${bg} ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
        </div>

        {/* Timeline */}
        {order.status !== "cancelled" && (
          <div className="overflow-x-auto pb-1">
            <StatusTimeline status={order.status} />
          </div>
        )}

        {/* ETA */}
        {isActive && !isPending && (
          <div className="rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-center gap-3">
            <Truck className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs text-orange-700 font-semibold">Estimated Delivery</p>
              <p className="text-sm font-bold text-orange-800">{eta}–{eta + 10} min</p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
              <span className="text-foreground">
                {item.name}
                <span className="text-muted-foreground ml-1">×{item.quantity}</span>
              </span>
              <span className="text-muted-foreground tabular-nums">
                Rs. {item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">Rs. {subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="tabular-nums">Rs. {deliveryFee > 0 ? deliveryFee : 50}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-orange-600 tabular-nums">Rs. {order.total}</span>
          </div>
        </div>

        {/* Reorder */}
        {order.status === "delivered" && (
          <button
            onClick={onReorder}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary/10 text-primary font-semibold py-3 hover:bg-primary/20 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Dobara Order Karo
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page inner ────────────────────────────────────────────────────────────────

function OrdersPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const newOrderId = searchParams.get("new")
  const { addItem, openCart } = useCart()

  const [orders, setOrders]         = useState<Order[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(newOrderId)
  const [loading, setLoading]       = useState(true)

  const selected = orders.find(o => o.id === selectedId) ?? null
  const isActiveOrder = selected ? !["delivered", "cancelled"].includes(selected.status) : false

  // Live GPS — only active when viewing an active order
  const liveLocation = useLiveLocation(isActiveOrder)

  useDeliverySimulation(newOrderId)

  const fetchOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data as Order[])
      if (newOrderId) setSelectedId(newOrderId)
    }
    setLoading(false)
  }, [newOrderId])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Realtime order status updates
  useEffect(() => {
    const ch = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        payload => {
          setOrders(prev =>
            prev.map(o => o.id === payload.new.id ? { ...o, ...(payload.new as Order) } : o),
          )
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  function handleReorder(order: Order) {
    order.items.forEach(item => {
      addItem({
        foodId:         item.food_id,
        name:           item.name,
        price:          item.price,
        image:          item.image ?? "/placeholder.jpg",
        restaurantName: getRestaurantName(order),
        restaurantArea: order.restaurant_area ?? "",
      })
    })
    openCart()
  }

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status))

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString("en-PK", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      })
    } catch { return iso }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-6 pt-20 lg:pt-6">
        {/* Page header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mere Orders</h1>
          <p className="text-muted-foreground text-sm">Apne orders track karo aur history dekho</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 border-4 border-muted border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm">Orders load ho rahe hain…</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mb-4" />
            <p className="font-bold text-foreground text-lg">Koi order nahi hai abhi</p>
            <p className="text-muted-foreground text-sm mt-1 mb-6">
              MediMenu se kuch order karo!
            </p>
            <button
              onClick={() => router.push("/dashboard/medimenu")}
              className="flex items-center gap-2 rounded-2xl bg-orange-500 text-white font-semibold px-6 py-3 hover:bg-orange-600 transition-colors"
            >
              MediMenu kholein
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — order list */}
            <div className="lg:col-span-1 space-y-4">
              {/* Active order banner */}
              {activeOrders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 p-4 text-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {activeOrders.length} active order{activeOrders.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs opacity-80">
                          {getRestaurantName(activeOrders[0])}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedId(activeOrders[0].id)}
                      className="rounded-full bg-white text-orange-600 font-semibold text-xs px-3 py-1.5 hover:bg-orange-50 transition-colors"
                    >
                      Track Karo
                    </button>
                  </div>
                </motion.div>
              )}

              {/* List */}
              <div className="rounded-3xl border border-border/50 bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h2 className="font-bold text-foreground">Order History</h2>
                </div>
                <div className="divide-y divide-border/50">
                  {orders.map((order, idx) => {
                    const { Icon, label, color, bg } = STATUS_CFG[order.status]
                    const isNew = order.id === newOrderId
                    return (
                      <motion.button
                        key={order.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedId(order.id)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedId === order.id ? "bg-muted/50" : ""
                        } ${isNew ? "ring-1 ring-orange-300 ring-inset" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                              <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="font-semibold text-foreground text-sm truncate">
                                  {getRestaurantName(order)}
                                </p>
                                {isNew && (
                                  <span className="rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 shrink-0">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color} font-medium`}>
                                {label}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <p className="font-bold text-foreground tabular-nums text-sm">
                              Rs. {order.total}
                            </p>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right — detail + map */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <OrderDetail
                      order={selected}
                      liveLocation={liveLocation}
                      onReorder={() => handleReorder(selected)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-3xl border border-border/50 bg-card p-12 text-center"
                  >
                    <ShoppingBag className="w-14 h-14 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">
                      Koi order select karo details dekhne ke liye
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersPageInner />
    </Suspense>
  )
}
