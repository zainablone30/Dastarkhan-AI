"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { supabase } from "@/lib/supabase"
import { SearchHeader } from "@/components/dashboard/search-header"
import { MoodSelector } from "@/components/dashboard/mood-selector"
import { QuickCategories } from "@/components/dashboard/quick-categories"
import { PromoBanner } from "@/components/dashboard/promo-banner"
import { AISuggestions } from "@/components/dashboard/ai-suggestions"
import { FoodCard } from "@/components/dashboard/food-card"
import { OrderTracker } from "@/components/dashboard/order-tracker"
import { useLanguage } from "@/components/language-provider"
import { useUserProfile } from "@/lib/user-profile-context"
import Link from "next/link"

type FoodItem = {
  id: string
  name: string
  nameUrdu?: string
  restaurant: string
  restaurantArea?: string
  image: string
  price: number
  rating: number
  deliveryTime: string
  isSpicy?: boolean
  isVeg?: boolean
  isHomemade?: boolean
  aiRecommended?: boolean
  discount?: number
  category?: string
  description?: string
  allergens?: string[]
}

type LocationStatus = "idle" | "locating" | "ready" | "blocked" | "unsupported" | "error"

async function getReadableLocation(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  )

  if (!response.ok) {
    throw new Error("Could not resolve address")
  }

  const data = await response.json()
  const address = data.address || {}
  const area = address.suburb || address.neighbourhood || address.quarter || address.road
  const city = address.city || address.town || address.village || address.county

  return [area, city].filter(Boolean).join(", ") || data.display_name || "Current location"
}

function mapFood(f: any): FoodItem {
  return {
    id: f.id,
    name: f.name,
    nameUrdu: f.name_urdu || undefined,
    restaurant: f.restaurants?.name || "DastarKhan",
    restaurantArea: f.restaurants?.area || "",
    image: f.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
    price: f.price,
    rating: Number(f.rating),
    deliveryTime: f.delivery_time || "30-35 min",
    isSpicy: f.is_spicy,
    isVeg: f.is_veg,
    isHomemade: f.is_homemade,
    aiRecommended: f.is_ai_recommended,
    discount: f.discount || undefined,
    category: f.category || undefined,
    description: f.description || undefined,
    allergens: f.allergens || undefined,
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const userProfile = useUserProfile()
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false)
  const [hasActiveOrder, setHasActiveOrder] = useState(true)
  const [cartCount, setCartCount] = useState(2)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Foodie")
  const [userId, setUserId] = useState<string | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [currentLocation, setCurrentLocation] = useState("")
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle")
  const [trendingFoods, setTrendingFoods] = useState<FoodItem[]>([])
  const [nearbyFoods, setNearbyFoods] = useState<FoodItem[]>([])
  const locationWatchId = useRef<number | null>(null)

  const detectCurrentLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported")
      setCurrentLocation("Location not supported")
      return
    }

    setLocationStatus("locating")
    setCurrentLocation("")

    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current)
    }

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        try {
          const readableLocation = await getReadableLocation(coords.latitude, coords.longitude)
          setCurrentLocation(readableLocation)
          setLocationStatus("ready")
        } catch {
          setLocationStatus("error")
          setCurrentLocation("Location name unavailable")
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("blocked")
          setCurrentLocation("Allow location access")
          return
        }

        setLocationStatus("error")
        setCurrentLocation("Location unavailable")
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 15_000,
      },
    )
    locationWatchId.current = watchId

    return () => {
      navigator.geolocation.clearWatch(watchId)
      if (locationWatchId.current === watchId) {
        locationWatchId.current = null
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
        return
      }
      setUserId(session.user.id)
      // Get user name from profile
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setUserName(data.full_name.split(" ")[0])
        })
    })
  }, [router])

  useEffect(() => {
    if (!userId) return

    let isMounted = true

    const loadNotificationCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)

      if (!error && isMounted) {
        setNotificationCount(count ?? 0)
      }
    }

    loadNotificationCount()

    const ch = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => loadNotificationCount(),
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(ch)
    }
  }, [userId])

  useEffect(() => {
    const stopWatchingLocation = detectCurrentLocation()
    return () => stopWatchingLocation?.()
  }, [detectCurrentLocation])

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true)
      // Trending: AI recommended + high rating
      const { data: trending } = await supabase
        .from("foods")
        .select("*, restaurants(name, area)")
        .order("is_ai_recommended", { ascending: false })
        .order("rating", { ascending: false })
        .limit(6)

      // Nearby: high rating, fast delivery
      const { data: nearby } = await supabase
        .from("foods")
        .select("*, restaurants(name, area)")
        .order("rating", { ascending: false })
        .limit(6)

      if (trending) setTrendingFoods(trending.map(mapFood))
      if (nearby) setNearbyFoods(nearby.filter((f: any) => !f.is_ai_recommended).map(mapFood).slice(0, 3))
      setLoading(false)
    }
    fetchFoods()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="min-h-screen pt-16 lg:ml-72 lg:pt-0">
        <SearchHeader
          userName={userName}
          location={currentLocation}
          locationStatus={locationStatus}
          onLocationClick={detectCurrentLocation}
          cartCount={cartCount}
          notificationCount={notificationCount}
        />

        <div className="space-y-5 px-4 py-4 sm:px-6 lg:space-y-6 lg:pt-6">
          {/* Welcome Pingu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/10 to-accent/10 p-4"
          >
            <div className="flex h-16 w-16 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-primary/10 dark:bg-white/10 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
              <video
                src="/videos/waving.webm"
                className="h-full w-full object-contain"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Pingu waving hello"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground sm:text-lg">
                {t("dashboard_greeting")}, {userName}! 👋
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pingu is ready to help you find something delicious today.
              </p>
            </div>
          </motion.div>

          {/* Profile Completion Banner */}
          {userProfile.loaded && !userProfile.isProfileComplete && !profileBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950/40 dark:to-orange-950/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🐧</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Profile complete karo!
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Health conditions aur allergies add karo — Pingu food safety warnings dikhayega
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                <Link
                  href="/dashboard/profile/setup"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                >
                  Complete
                </Link>
                <button
                  onClick={() => setProfileBannerDismissed(true)}
                  className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          <PromoBanner />
          <MoodSelector />
          <QuickCategories />
          <AISuggestions />

          {/* Trending Foods */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-foreground">{t("dashboard_trending_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard_trending_desc")}</p>
              </div>
              <a href="/dashboard/explore" className="text-sm text-primary font-medium hover:underline">
                {t("dashboard_view_all")}
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingFoods.map((food, index) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FoodCard {...food} />
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Nearby Section */}
          {nearbyFoods.length > 0 && (
            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-foreground">{t("dashboard_nearby_title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard_nearby_desc")}</p>
                </div>
                <a href="/dashboard/explore" className="text-sm text-primary font-medium hover:underline">
                  {t("dashboard_view_all")}
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyFoods.map((food, index) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FoodCard {...food} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  )
}
