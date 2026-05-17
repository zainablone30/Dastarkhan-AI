"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles, Heart, Stethoscope, Globe, ChefHat, ArrowRight } from "lucide-react"
import { PinguChef } from "@/components/pingu-chef"
import { useLanguage } from "@/components/language-provider"

const aiModesMeta = [
  {
    id: "medimenu",
    href: "/dashboard/medimenu",
    icon: Stethoscope,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10",
  },
  {
    id: "cuisinegps",
    href: "/dashboard/cuisinegps",
    icon: Globe,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "tasteofpakistan",
    href: "/dashboard/taste-pakistan",
    icon: Heart,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "smartkitchen",
    href: "/dashboard/smart-kitchen",
    icon: ChefHat,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10",
  },
]

export function AISuggestions() {
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const aiModes = aiModesMeta.map((mode, index) => ({
    ...mode,
    name: t(`ai_mode_${index + 1}_name`),
    description: t(`ai_mode_${index + 1}_desc`),
    quote: t(`ai_mode_${index + 1}_quote`),
    features: [
      t(`ai_mode_${index + 1}_feat_1`),
      t(`ai_mode_${index + 1}_feat_2`),
      t(`ai_mode_${index + 1}_feat_3`),
    ],
  }))

  const currentMode = aiModes.find((m) => m.id === selectedMode)

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-lg sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{t("ai_title")}</h3>
          <p className="text-sm text-muted-foreground">{t("ai_subtitle")}</p>
        </div>
      </div>

      {/* AI Mode Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {aiModes.map((mode, index) => {
          const Icon = mode.icon
          const isSelected = selectedMode === mode.id

          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(mode.href)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? `bg-gradient-to-br ${mode.color} border-transparent text-white`
                  : `${mode.bgColor} border-transparent hover:border-primary/30`
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                  isSelected ? "bg-white/20" : `bg-gradient-to-br ${mode.color}`
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-white"}`} />
              </div>
              <h4 className={`font-bold text-sm mb-1 ${isSelected ? "text-white" : "text-foreground"}`}>
                {mode.name}
              </h4>
              <p className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                {mode.description}
              </p>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected Mode Details */}
      <AnimatePresence>
        {currentMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentMode.color} text-white`}>
              <div className="flex items-start gap-4">
                <PinguChef size="sm" showQuote={false} mood="happy" />
                <div className="flex-1">
                  <p className="font-medium mb-2">{`Pingu: "${currentMode.quote}"`}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentMode.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 rounded-full bg-white/20 text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(currentMode.href)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-foreground font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    {t("ai_start")} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
