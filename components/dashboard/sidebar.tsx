"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "motion/react"
import {
  Home,
  Search,
  Heart,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  ChefHat,
  Sparkles,
  MapPin,
  Utensils,
  Clock,
  Bell,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PinguChef } from "@/components/pingu-chef"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/components/language-provider"
import { useUnreadCount } from "@/lib/use-notifications"

export function DashboardSidebar() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleCuisineGpsClick = (event: React.MouseEvent) => {
    event.preventDefault()
    setIsMobileOpen(false)

    if (typeof window === "undefined") {
      router.push("/dashboard/cuisinegps")
      return
    }

    const storage = window.sessionStorage
    storage.removeItem("cuisinegps_permission")
    storage.removeItem("cuisinegps_coords")

    if (!navigator.geolocation) {
      storage.setItem("cuisinegps_permission", "unsupported")
      router.push("/dashboard/cuisinegps")
      return
    }

    storage.setItem("cuisinegps_permission", "requested")

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        storage.setItem("cuisinegps_permission", "granted")
        storage.setItem(
          "cuisinegps_coords",
          JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        )
        router.push("/dashboard/cuisinegps")
      },
      (error) => {
        storage.setItem(
          "cuisinegps_permission",
          error.code === error.PERMISSION_DENIED ? "denied" : "error",
        )
        router.push("/dashboard/cuisinegps")
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  const mainNavItems = [
    { icon: Home, label: t("sidebar_home"), href: "/dashboard" },
    { icon: Search, label: t("sidebar_explore"), href: "/dashboard/explore" },
    { icon: Sparkles, label: t("sidebar_ai_suggest"), href: "/dashboard/ai-suggest" },
    { icon: Heart, label: t("sidebar_favorites"), href: "/dashboard/favorites" },
    { icon: ShoppingBag, label: t("sidebar_orders"), href: "/dashboard/orders" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  ]

  const aiFeatures = [
    { icon: Utensils, label: t("sidebar_medimenu"), href: "/dashboard/medimenu", badge: t("sidebar_badge_health") },
    { icon: MapPin, label: t("sidebar_cuisinegps"), href: "/dashboard/cuisinegps", badge: t("sidebar_badge_tourist") },
    { icon: ChefHat, label: t("sidebar_taste"), href: "/dashboard/taste-pakistan", badge: t("sidebar_badge_desi") },
  ]

  const bottomNavItems = [
    { icon: User, label: t("sidebar_profile"), href: "/dashboard/profile" },
    { icon: Settings, label: t("sidebar_settings"), href: "/dashboard/settings" },
  ]

  const handleLogout = async () => {
    setIsMobileOpen(false)
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const { count: unreadCount } = useUnreadCount()

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">DastarKhan</h1>
            <p className="text-xs text-muted-foreground">{t("sidebar_logo_subtitle")}</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          {t("sidebar_menu")}
        </p>
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          const isBell = item.href === "/dashboard/notifications"
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="relative">
                <item.icon className="w-5 h-5" />
                {isBell && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span className="font-medium">{item.label}</span>
              {isBell && unreadCount > 0 && !isActive && (
                <span className="ml-auto rounded-full bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-white"
                />
              )}
            </Link>
          )
        })}

        {/* AI Features */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            {t("sidebar_ai_features")}
          </p>
          {aiFeatures.map((item) => {
            const isActive = pathname === item.href
            const className = cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )

            if (item.href === "/dashboard/cuisinegps") {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={handleCuisineGpsClick}
                  className={className}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  <span
                    className={cn(
                      "ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium",
                      isActive ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                    )}
                  >
                    {item.badge}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={className}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                <span
                  className={cn(
                    "ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium",
                    isActive ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                  )}
                >
                  {item.badge}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Pingu Chef Mini */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <PinguChef size="sm" showQuote={false} />
          <div>
            <p className="text-sm font-semibold text-foreground">{t("sidebar_pingu_title")}</p>
            <p className="text-xs text-muted-foreground">{t("sidebar_pingu_subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border/50 space-y-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t("sidebar_logout")}</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground">DastarKhan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/notifications" className="relative p-2 rounded-xl bg-muted">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-muted"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isMobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-background border-r border-border/50 flex flex-col pt-16"
      >
        <NavContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border/50 flex-col">
        <NavContent />
      </aside>
    </>
  )
}
