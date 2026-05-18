"use client"

import { motion } from "motion/react"
import { Sparkles, Heart, Leaf, ShoppingBag, Utensils, ArrowRight, Play } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/components/language-provider"

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { t } = useLanguage()
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)

  const stats = [
    { icon: Heart, label: t("hero_stat_1"), color: "text-accent" },
    { icon: Leaf, label: t("hero_stat_2"), color: "text-green-500" },
    { icon: Sparkles, label: t("hero_stat_3"), color: "text-primary" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/dv0stxj1g/video/upload/v1776965370/WhatsApp_Video_2026-04-23_at_8.28.18_PM_kwxr5f.mp4"
            type="video/mp4"
          />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-white/90 text-sm font-medium">
              {t("hero_badge")}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            <span className="block text-balance">{t("hero_title_line1")}</span>
            <span className="block mt-2">
              <span className="text-primary">{t("hero_title_line2_primary")}</span>
              <span className="text-white">{t("hero_title_line2_amp")}</span>
              <span className="text-accent">{t("hero_title_line2_secondary")}</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 text-pretty"
          >
            {t("hero_subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 20px 50px rgba(217, 119, 6, 0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="group flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-2xl shadow-primary/30 transition-all sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              {t("hero_cta_primary")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("chefs")?.scrollIntoView({ behavior: "smooth" })}
              className="flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-md transition-all sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
            >
              <Utensils className="w-5 h-5" />
              {t("hero_cta_secondary")}
            </motion.button>
          </motion.div>

          {/* Stats/Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10"
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-white/90 text-sm font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
