"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

const cuisines = [
  { name: "Italian", emoji: "🍝" },
  { name: "Chinese", emoji: "🥢" },
  { name: "Japanese", emoji: "🍱" },
  { name: "Turkish", emoji: "🥙" },
  { name: "Lebanese", emoji: "🧆" },
  { name: "Korean", emoji: "🍜" },
  { name: "Thai", emoji: "🍛" },
  { name: "Mexican", emoji: "🌮" },
]

type Restaurant = {
  name: string
  area: string
  rating: number
  specialty: string
  tip: string
  distance_km?: number
}

type LocationInfo = {
  city: string
  area: string
}

function buildMapQuery(restaurant: Restaurant, location: LocationInfo) {
  return `${restaurant.name}, ${restaurant.area}, ${location.city || "Pakistan"}, Pakistan`
}

function googleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function googleMapsDirectionsUrl(query: string, coords: { lat: number; lng: number } | null) {
  const origin = coords ? `&origin=${coords.lat},${coords.lng}` : ""
  return `https://www.google.com/maps/dir/?api=1${origin}&destination=${encodeURIComponent(query)}`
}

function googleMapsEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

export default function CuisineGPSPage() {
  const [cuisine, setCuisine] = useState("")
  const [results, setResults] = useState<Restaurant[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [location, setLocation] = useState<LocationInfo>({ city: "", area: "" })
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [locationError, setLocationError] = useState("")
  const [locationRequested, setLocationRequested] = useState(false)

  const requestLocation = async () => {
    setLocationRequested(true)
    if (!navigator.geolocation) {
      setLocationStatus("error")
      setLocationError("Location not supported. ")
      return
    }

    setLocationStatus("loading")
    setLocationError("")

    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" })
        if (status.state === "denied") {
          setLocationStatus("error")
          setLocationError("Location is blocked in browser settings.")
          return
        }
      } catch {
        // Ignore permission query issues; fallback to prompt.
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationStatus("ready")
        setLocationError("")
      },
      (error) => {
        setLocationStatus("error")
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Select 'Allow while using' in the prompt.")
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError("Location unavailable. Check GPS or network.")
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location timed out. Try again.")
        } else {
          setLocationError("Location error. Try again.")
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const permission = window.sessionStorage.getItem("cuisinegps_permission")
    const coordsRaw = window.sessionStorage.getItem("cuisinegps_coords")

    if (permission === "granted" && coordsRaw) {
      try {
        const parsed = JSON.parse(coordsRaw) as { lat: number; lng: number }
        if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          setCoords({ lat: parsed.lat, lng: parsed.lng })
          setLocationStatus("ready")
          setLocationRequested(true)
        }
      } catch {
        // Ignore malformed stored coords.
      }
    } else if (permission === "denied") {
      setLocationStatus("error")
      setLocationError("Location permission denied. Select 'Allow while using' in the prompt.")
      setLocationRequested(true)
    } else if (permission === "unsupported") {
      setLocationStatus("error")
      setLocationError("Location not supported.")
      setLocationRequested(true)
    } else if (permission === "error") {
      setLocationStatus("error")
      setLocationError("Location error. Try again.")
      setLocationRequested(true)
    }

    window.sessionStorage.removeItem("cuisinegps_permission")
    window.sessionStorage.removeItem("cuisinegps_coords")
  }, [])

  const search = async () => {
    if (!cuisine) return
    setLoading(true)
    try {
      const res = await fetch("/api/cuisinegps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuisine,
          city: location.city,
          lat: coords?.lat,
          lng: coords?.lng,
        }),
      })
      const data = await res.json()
      setResults(data.results || [])
      setSelectedIndex(0)
      if (data.location?.city) {
        setLocation({
          city: data.location.city,
          area: data.location.area || "",
        })
      }
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const selectedCuisine = cuisines.find((c) => c.name === cuisine)
  const selectedRestaurant = results[selectedIndex]
  const selectedMapQuery = selectedRestaurant ? buildMapQuery(selectedRestaurant, location) : ""

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-6 pt-20 lg:pt-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">🗺️ CuisineGPS</h1>
            <p className="text-muted-foreground">
              Apni location ke qareeb international cuisine dhundo — AI ki madad se
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {locationStatus === "ready" && location.city && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  {location.area ? `${location.area}, ${location.city}` : location.city}
                </span>
              )}
              {locationStatus === "loading" && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Detecting location...</span>
              )}
              {locationStatus === "error" && locationRequested && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">{locationError}</span>
              )}
              {locationStatus !== "ready" && (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="rounded-full bg-foreground px-3 py-1 font-semibold text-background"
                >
                  {locationStatus === "loading" ? "Requesting..." : "Allow location"}
                </button>
              )}
            </div>
          </div>

          {/* Cuisine Buttons */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cuisines.map((c) => (
              <button
                key={c.name}
                onClick={() => setCuisine(c.name)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  cuisine === c.name
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                    : "border-border hover:border-orange-300 text-foreground"
                }`}
              >
                <span className="block text-xl mb-1">{c.emoji}</span>
                {c.name}
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button
            onClick={search}
            disabled={!cuisine || loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 mb-6 hover:bg-orange-600 transition-colors"
          >
            {loading
              ? "Restaurants dhoondh raha hoon..."
              : cuisine
              ? `${selectedCuisine?.emoji} ${cuisine} restaurants ${location.area || location.city || "apne shehar"} mein dhundo`
              : "Pehle cuisine select karo"}
          </button>

          {/* Results */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 lg:grid-cols-[1fr_0.9fr]"
            >
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider lg:col-span-2">
                {location.area || location.city || "Apne shehar"} mein {cuisine} restaurants
              </p>
              {results.map((r, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`p-5 rounded-2xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 lg:col-start-1 ${
                    selectedIndex === i ? "border-orange-500 shadow-sm" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground text-lg">{r.name}</h3>
                    <span className="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
                      ★ {r.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {r.area}
                    {typeof r.distance_km === "number" ? ` · ~${r.distance_km} km` : ""}
                  </p>
                  <p className="text-sm text-foreground mb-2">🍽️ Best: {r.specialty}</p>
                  <p className="text-xs text-orange-600 font-medium">💡 {r.tip}</p>
                </button>
              ))}
              {selectedRestaurant && (
                <div className="h-fit rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-6 lg:col-start-2 lg:row-start-2 lg:row-span-6">
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Google Map</p>
                    <h2 className="text-lg font-bold text-foreground">{selectedRestaurant.name}</h2>
                    <p className="text-sm text-foreground/75">{selectedRestaurant.area}</p>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <iframe
                      title={`${selectedRestaurant.name} map`}
                      src={googleMapsEmbedUrl(selectedMapQuery)}
                      className="h-72 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href={googleMapsSearchUrl(selectedMapQuery)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                    >
                      Open Maps
                    </a>
                    <a
                      href={googleMapsDirectionsUrl(selectedMapQuery, coords)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-border bg-background px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      Directions
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Select a restaurant to update the map preview.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
