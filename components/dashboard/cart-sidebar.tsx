"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X, Plus, Minus, Trash2, ShoppingBag, MapPin,
  ChevronRight, ShoppingCart, Smartphone, Copy, CheckCheck,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"

// ── Floating cart button ──────────────────────────────────────────────────────
export function CartButton() {
  const { items, openCart, isOpen } = useCart()
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  if (count === 0 || isOpen) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={openCart}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 rounded-full bg-orange-500 px-5 py-3.5 text-white shadow-2xl hover:bg-orange-600 transition-colors font-bold text-sm"
    >
      <ShoppingCart className="w-5 h-5" />
      <span>{count} item{count > 1 ? "s" : ""}</span>
      <span className="rounded-full bg-white text-orange-600 text-xs font-bold px-2.5 py-1">
        Rs. {total}
      </span>
    </motion.button>
  )
}

// ── Payment overlay ───────────────────────────────────────────────────────────
function PaymentOverlay({
  total,
  orderId,
  onDone,
}: {
  total: number
  orderId: string
  onDone: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="absolute inset-0 z-20 flex flex-col bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-orange-500/5 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-base">Payment Karo</h2>
          <p className="text-xs text-muted-foreground">Easypaisa ke zariye</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center gap-5 px-5 py-6">

        {/* Amount pill */}
        <div className="w-full rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 px-5 py-4 text-center">
          <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Kul Raqam</p>
          <p className="text-3xl font-bold text-orange-600 tabular-nums">Rs. {total}</p>
          <p className="text-xs text-muted-foreground mt-1">Delivery fee shamil hai</p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative w-52 h-52 rounded-2xl overflow-hidden border-2 border-border shadow-lg bg-white flex items-center justify-center">
            {!imgError ? (
              <img
                src="/payment-qr.png"
                alt="Easypaisa Payment QR"
                className="w-full h-full object-contain p-2"
                onError={() => setImgError(true)}
              />
            ) : (
              // Fallback placeholder if image not added yet
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`rounded ${i % 3 === 0 ? "h-8 w-8 bg-black" : i === 4 ? "h-8 w-8 bg-black" : "h-4 w-4 bg-gray-400 m-2"}`} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Add QR image:<br />
                  <code className="text-[9px]">public/payment-qr.png</code>
                </p>
              </div>
            )}
          </div>

          {/* digital bank label */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-[8px] font-black text-white">d</span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">digital bank · Easypaisa</p>
          </div>
        </div>

        {/* Recipient card */}
        <div className="w-full rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recipient</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground text-sm">DastarKhan</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">MSISDN: *******3395</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 space-y-2">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
            ⚠️ Zaroori Hidayaat
          </p>
          <ol className="space-y-1.5 text-xs text-amber-700 dark:text-amber-300 list-decimal list-inside">
            <li>Upar diye gaye QR code ko scan karein</li>
            <li>Rs. {total} DastarKhan ke Easypaisa pe send karein</li>
            <li>Payment ka screenshot lein</li>
            <li>Screenshot hamare admin ko bhejein</li>
          </ol>
        </div>

        {/* Notice */}
        <div className="w-full rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-center">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
            🔐 Aapka order hamare team ke payment verify karne ke baad{" "}
            <strong>confirm</strong> ho jayega.
          </p>
        </div>

        {/* Order ID */}
        <button
          onClick={copyId}
          className="w-full flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-2.5 hover:bg-muted transition-colors"
        >
          <div className="text-left min-w-0">
            <p className="text-[10px] text-muted-foreground font-semibold">Order ID (copy karein)</p>
            <p className="text-xs font-mono text-foreground truncate">{orderId.slice(0, 20)}…</p>
          </div>
          {copied ? (
            <CheckCheck className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 shrink-0 space-y-2">
        <button
          onClick={onDone}
          className="w-full rounded-2xl bg-orange-500 text-white font-bold py-3.5 hover:bg-orange-600 transition-colors shadow-lg"
        >
          Payment Ho Gayi — Orders Dekhein →
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Confirm na ho? Admin se rabta karein
        </p>
      </div>
    </motion.div>
  )
}

// ── Cart sidebar ──────────────────────────────────────────────────────────────
export function CartSidebar() {
  const {
    items, isOpen, closeCart,
    removeItem, updateQty,
    subtotal, deliveryFee, total,
    placeOrder, isPlacingOrder,
    restaurantName, orderError, clearOrderError,
  } = useCart()

  const router = useRouter()
  const [gettingLocation, setGettingLocation] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)
  const [placedTotal, setPlacedTotal] = useState(0)

  async function handlePlaceOrder() {
    clearOrderError()
    setGettingLocation(true)
    let lat: number | undefined
    let lng: number | undefined

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
      )
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    } catch {
      lat = 31.5204
      lng = 74.3587
    }

    setGettingLocation(false)
    const snapshot = total // capture before cart clears
    const orderId = await placeOrder(lat, lng)

    if (orderId) {
      setPlacedOrderId(orderId)
      setPlacedTotal(snapshot)
      setShowPayment(true)
    }
  }

  function handlePaymentDone() {
    setShowPayment(false)
    closeCart()
    if (placedOrderId) {
      router.push(`/dashboard/orders?new=${placedOrderId}`)
    }
  }

  const busy = isPlacingOrder || gettingLocation

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Slide-over panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Payment overlay (sits on top of everything) */}
            <AnimatePresence>
              {showPayment && placedOrderId && (
                <PaymentOverlay
                  total={placedTotal}
                  orderId={placedOrderId}
                  onDone={handlePaymentDone}
                />
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div>
                <h2 className="font-bold text-foreground text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Your Cart
                </h2>
                {restaurantName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{restaurantName}</p>
                )}
              </div>
              <button
                onClick={closeCart}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="font-semibold text-muted-foreground">Cart khali hai</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Koi bhi dish add karo!
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.foodId}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 rounded-2xl bg-muted/50 border border-border/40 p-3"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Rs. {item.price} each</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.foodId, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.foodId, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="font-bold text-foreground text-sm tabular-nums">
                          Rs. {item.price * item.quantity}
                        </p>
                        <button
                          onClick={() => removeItem(item.foodId)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Error banner */}
            {orderError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mb-2 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <span className="shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold">Order fail ho gaya</p>
                  <p className="text-xs text-red-600 mt-0.5">{orderError}</p>
                </div>
                <button onClick={clearOrderError} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
              </motion.div>
            )}

            {/* Checkout footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4 shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">Rs. {subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Delivery Fee
                    </span>
                    <span className="font-medium tabular-nums">Rs. {deliveryFee}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="tabular-nums text-orange-600">Rs. {total}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-60 shadow-lg active:scale-95"
                >
                  {busy ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <>
                      Order Place Karo
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  Estimated delivery: 25–35 min 🛵
                </p>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
