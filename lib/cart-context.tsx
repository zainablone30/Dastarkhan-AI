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
}

const CartContext = createContext<CartContextType | null>(null)
const DELIVERY_FEE = 50
const STORAGE_KEY = "dk-cart"

const NOOP_CART: CartContextType = {
  items: [], restaurantName: "", restaurantArea: "",
  isOpen: false,
  openCart: () => {}, closeCart: () => {},
  addItem: () => {}, removeItem: () => {}, updateQty: () => {}, clearCart: () => {},
  subtotal: 0, deliveryFee: 0, total: 0,
  placeOrder: async () => null,
  isPlacingOrder: false, lastOrderId: null,
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
      try {
        const { data: { session } } = await supabase.auth.getSession()

        const restaurantCoords = getAreaCoordinates(restaurantArea)

        // Store restaurant_name inside each item — the orders table has no restaurant_name column
        const orderItems = items.map(i => ({
          food_id: i.foodId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          restaurant_name: i.restaurantName,
        }))

        // Build payload using only columns confirmed in the actual DB schema
        const payload: Record<string, unknown> = {
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

        // user_id is uuid type in DB — only include for authenticated users
        if (session?.user?.id) payload.user_id = session.user.id
        if (customerLat != null) payload.customer_lat = customerLat
        if (customerLng != null) payload.customer_lng = customerLng

        let { data, error } = await supabase
          .from("orders")
          .insert(payload)
          .select("id")
          .single()

        // PGRST204 = column not found → fall back to bare minimum
        if (error?.code === "PGRST204") {
          const minPayload: Record<string, unknown> = {
            items: orderItems,
            status: "pending",
            restaurant_name: restaurantName,
            total,
          }
          if (session?.user?.id) minPayload.user_id = session.user.id
          ;({ data, error } = await supabase
            .from("orders")
            .insert(minPayload)
            .select("id")
            .single())
        }

        if (error) throw error
        const orderId: string = data.id
        setLastOrderId(orderId)
        clearCart()
        return orderId
      } catch (err) {
        console.error("Order placement failed:", err)
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
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
