"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, MapPin, Bell, ShoppingBag, Mic, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/language-provider"
import { Spinner } from "@/components/ui/spinner"

interface SearchHeaderProps {
  userName?: string
  location?: string
  locationStatus?: "idle" | "locating" | "ready" | "blocked" | "unsupported" | "error"
  onLocationClick?: () => void
  cartCount?: number
  notificationCount?: number
}

export function SearchHeader({
  userName = "Foodie",
  location = "",
  locationStatus = "idle",
  onLocationClick,
  cartCount = 0,
  notificationCount = 2,
}: SearchHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const speechRef = useRef<any>(null)

  const greetings = [
    t("search_greeting_1", { name: userName }),
    t("search_greeting_2", { name: userName }),
    t("search_greeting_3", { name: userName }),
    t("search_greeting_4", { name: userName }),
  ]

  const greetingIndex =
    userName
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % greetings.length
  const greeting = greetings[greetingIndex]

  const quickSearches = [
    t("quick_search_biryani"),
    t("quick_search_burger"),
    t("quick_search_pizza"),
    t("quick_search_nihari"),
    t("quick_search_chai"),
    t("quick_search_paratha"),
  ]

  const isLocating = locationStatus === "locating"
  const locationLabel = location || "Detect location"
  const locationTitle =
    locationStatus === "blocked"
      ? "Location permission is blocked. Enable it in your browser settings, then try again."
      : "Use your current location"

  function submitSearch(query: string) {
    const cleaned = query.trim()
    if (!cleaned) return
    const target = `/dashboard/explore?search=${encodeURIComponent(cleaned)}`

    if (pathname !== "/dashboard/explore") {
      router.push(target)
    } else {
      router.replace(target)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || "en-US"
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || "")
        .join(" ")
        .trim()

      if (transcript) {
        setSearchQuery(transcript)

        const last = event.results[event.results.length - 1]
        if (last?.isFinal) {
          submitSearch(transcript)
        }
      }
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    speechRef.current = recognition
    setSpeechSupported(true)

    return () => {
      try {
        recognition.abort()
      } catch {
        // Ignore cleanup errors from unsupported implementations.
      }
    }
  }, [])

  const toggleVoiceSearch = () => {
    if (!speechSupported || !speechRef.current) return

    if (isListening) {
      speechRef.current.stop()
      return
    }

    try {
      setIsListening(true)
      speechRef.current.start()
    } catch {
      setIsListening(false)
    }
  }

  return (
    <div className="sticky top-14 z-30 border-b border-border/50 bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:top-0">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
        {/* Location & Greeting */}
        <div className="min-w-0">
          <button
            type="button"
            onClick={onLocationClick}
            title={locationTitle}
            className="flex max-w-[58vw] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:max-w-none"
          >
            {isLocating ? (
              <Spinner className="w-4 h-4 text-primary" />
            ) : (
              <MapPin className="w-4 h-4 text-primary" />
            )}
            <span className="truncate">{isLocating ? "Detecting location..." : locationLabel}</span>
            {!isLocating && <span className="text-xs">v</span>}
          </button>
          <h2 className="mt-1 truncate text-lg font-bold text-foreground sm:text-xl">{greeting}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <Link
            href="/dashboard/notifications"
            className="relative hidden rounded-xl bg-muted p-3 transition-colors hover:bg-muted/80 sm:block"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/orders"
            className="relative rounded-xl bg-primary p-3 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <motion.div
          animate={{
            boxShadow: isSearchFocused
              ? "0 10px 40px -10px rgba(255, 107, 53, 0.3)"
              : "none",
          }}
          className={`relative flex items-center gap-2 rounded-2xl border-2 px-3 py-3 transition-colors sm:gap-3 sm:px-4 ${
            isSearchFocused
              ? "border-primary bg-card"
              : "border-transparent bg-muted"
          }`}
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                submitSearch(searchQuery)
              }
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            title={speechSupported ? "Voice search" : "Voice search not supported"}
            className={`p-2 rounded-xl transition-colors ${
              isListening
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            } ${!speechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!speechSupported}
          >
            <Mic className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Quick Searches Dropdown */}
        <AnimatePresence>
          {isSearchFocused && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-4 bg-card rounded-2xl border border-border/50 shadow-xl z-50"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("search_popular")}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearchQuery(item)
                      submitSearch(item)
                    }}
                    className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
