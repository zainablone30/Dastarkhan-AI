"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { getAreaCoordinates } from "@/lib/astar"

export type CartItem = {
  foodId: string
  name: string
  price: number
  quantity: number
  image: string
  restaurantName: string
  restaurantArea: string
}

type CartContextType = {
  items: CartItem[]
  restaurantName: string
  restaurantArea: string
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (foodId: string) => void
  updateQty: (foodId: string, qty: number) => void
  clearCart: () => void
  subtotal: number
  deliveryFee: number
  total: number
  placeOrder: (customerLat?: number, customerLng?: number) => Promise<string | null>
  isPlacingOrder: boolean
  lastOrderId: string | null
  orderError: string | null
  clearOrderError: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const DELIVERY_FEE = 50
const STORAGE_KEY = "dk-cart"

/** Generate a human-friendly order number like `DK-260518-A7K3F`.
 *  - DK = DastarKhan prefix
 *  - YYMMDD = today's date
 *  - 5-char random base36 suffix for uniqueness
 */
function generateOrderNumber(): string {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `DK-${yy}${mm}${dd}-${rand}`
}

const NOOP_CART: CartContextType = {
  items: [], restaurantName: "", restaurantArea: "",
  isOpen: false,
  openCart: () => {}, closeCart: () => {},
  addItem: () => {}, removeItem: () => {}, updateQty: () => {}, clearCart: () => {},
  subtotal: 0, deliveryFee: 0, total: 0,
  placeOrder: async () => null,
  isPlacingOrder: false, lastOrderId: null,
  orderError: null, clearOrderError: () => {},
}

/** Safe to call outside CartProvider — returns no-ops so FoodCard works anywhere. */
export function useCart(): CartContextType {
  return useContext(CartContext) ?? NOOP_CART
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const restaurantName = items[0]?.restaurantName ?? ""
  const restaurantArea = items[0]?.restaurantArea ?? ""
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      // Different restaurant → replace entire cart (single-restaurant ordering)
      if (prev.length > 0 && prev[0].restaurantName !== item.restaurantName) {
        return [{ ...item, quantity: 1 }]
      }
      const existing = prev.find(i => i.foodId === item.foodId)
      if (existing) {
        return prev.map(i =>
          i.foodId === item.foodId ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((foodId: string) => {
    setItems(prev => prev.filter(i => i.foodId !== foodId))
  }, [])

  const updateQty = useCallback((foodId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.foodId !== foodId))
    } else {
      setItems(prev => prev.map(i => i.foodId === foodId ? { ...i, quantity: qty } : i))
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const placeOrder = useCallback(
    async (customerLat?: number, customerLng?: number): Promise<string | null> => {
      if (items.length === 0) return null
      setIsPlacingOrder(true)
      setOrderError(null)
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user?.id) {
          setOrderError("Order place karne ke liye pehle login karo.")
          return null
        }

        const restaurantCoords = getAreaCoordinates(restaurantArea)

        const orderItems = items.map(i => ({
          food_id: i.foodId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          restaurant_name: i.restaurantName,
        }))

        // Generate a human-friendly order number (table has NOT NULL constraint)
        const orderNumber = generateOrderNumber()

        // Full payload — includes optional columns that may or may not exist
        const fullPayload: Record<string, unknown> = {
          user_id: session.user.id,
          order_number: orderNumber,
          items: orderItems,
          status: "pending",
          restaurant_name: restaurantName,
          total,
          subtotal,
          delivery_fee: deliveryFee,
          restaurant_area: restaurantArea,
          restaurant_lat: restaurantCoords.lat,
          restaurant_lng: restaurantCoords.lng,
          estimated_minutes: 30,
        }
        if (customerLat != null) fullPayload.customer_lat = customerLat
        if (customerLng != null) fullPayload.customer_lng = customerLng

        let { data, error } = await supabase
          .from("orders")
          .insert(fullPayload)
          .select("id")
          .single()

        // PGRST204 = column not found in schema cache → retry without optional extras
        if (error?.code === "PGRST204") {
          const reducedPayload: Record<string, unknown> = {
            user_id: session.user.id,
            order_number: orderNumber,
            items: orderItems,
            status: "pending",
            total,
            restaurant_area: restaurantArea,
            restaurant_lat: restaurantCoords.lat,
            restaurant_lng: restaurantCoords.lng,
            estimated_minutes: 30,
          }
          if (customerLat != null) reducedPayload.customer_lat = customerLat
          if (customerLng != null) reducedPayload.customer_lng = customerLng
          ;({ data, error } = await supabase
            .from("orders")
            .insert(reducedPayload)
            .select("id")
            .single())
        }

        // Second PGRST204 → try absolute minimum (still keep order_number — it's NOT NULL)
        if (error?.code === "PGRST204") {
          ;({ data, error } = await supabase
            .from("orders")
            .insert({
              user_id: session.user.id,
              order_number: orderNumber,
              items: orderItems,
              total,
              status: "pending",
            })
            .select("id")
            .single())
        }

        if (error || !data) {
          const msg = (error as any)?.message || "Order place nahi hua. Dobara try karo."
          console.error("Order placement failed:", error)
          setOrderError(msg)
          return null
        }

        const orderId: string = data.id
        setLastOrderId(orderId)
        clearCart()
        return orderId
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Order place nahi hua. Dobara try karo."
        console.error("Order placement failed:", err)
        setOrderError(msg)
        return null
      } finally {
        setIsPlacingOrder(false)
      }
    },
    [items, restaurantName, restaurantArea, subtotal, deliveryFee, total, clearCart],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantName,
        restaurantArea,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQty,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        placeOrder,
        isPlacingOrder,
        lastOrderId,
        orderError,
        clearOrderError: () => setOrderError(null),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
