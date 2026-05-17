"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ChefHat,
  Plus,
  X,
  Sparkles,
  Clock,
  Users,
  Flame,
  Leaf,
  Tag,
  Lightbulb,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

type Recipe = {
  name: string
  description: string
  ingredients_used: string[]
  ingredients_extra: string[]
  steps: string[]
  cook_time: string
  servings: number
  difficulty: "Easy" | "Medium" | "Hard"
  calories_est: number | null
  tags: string[]
  tip: string
}

const mealTypes = ["Any", "Breakfast", "Lunch", "Dinner", "Snack"]
const cookTimes = ["Any", "Under 15 mins", "Under 30 mins", "Under 1 hour"]
const dietOptions = ["Vegetarian", "High Protein", "Low Spice", "Kid Friendly"]
const servingOptions = [1, 2, 3, 4, 6]

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
}

const tagColors: Record<string, string> = {
  "Quick": "bg-blue-100 text-blue-700",
  "Budget Friendly": "bg-green-100 text-green-700",
  "Waste Less": "bg-teal-100 text-teal-700",
  "High Protein": "bg-orange-100 text-orange-700",
  "Vegetarian": "bg-emerald-100 text-emerald-700",
  "Kid Friendly": "bg-pink-100 text-pink-700",
  "One Pot": "bg-purple-100 text-purple-700",
  "Healthy": "bg-lime-100 text-lime-700",
}

const suggestedIngredients = [
  "Chicken", "Eggs", "Daal", "Rice", "Aloo", "Tomatoes", "Onions",
  "Yogurt", "Bread", "Flour", "Paneer", "Spinach", "Chickpeas", "Pasta",
]

export default function SmartKitchenPage() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [servings, setServings] = useState(2)
  const [mealType, setMealType] = useState("Any")
  const [cookTime, setCookTime] = useState("Any")
  const [dietPrefs, setDietPrefs] = useState<string[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function addIngredient(value: string) {
    const trimmed = value.trim()
    if (!trimmed || ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) return
    setIngredients((prev) => [...prev, trimmed])
    setInputValue("")
    inputRef.current?.focus()
  }

  function removeIngredient(item: string) {
    setIngredients((prev) => prev.filter((i) => i !== item))
  }

  function toggleDiet(pref: string) {
    setDietPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  async function generateRecipes() {
    if (ingredients.length === 0) {
      setMessage("Pehle kuch ingredients add karo!")
      return
    }
    setLoading(true)
    setMessage("")
    setRecipes([])
    setExpandedStep(null)

    try {
      const res = await fetch("/api/smart-kitchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, servings, mealType, dietPrefs, cookTime }),
      })
      const data = await res.json()
      setRecipes(data.recipes || [])
      if (data.message) setMessage(data.message)
    } catch {
      setMessage("Network masla. Thori dair baad try karo.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-background to-background dark:from-purple-950/20">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-4 pt-20 lg:pt-6 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-white via-white to-purple-50 dark:from-card dark:via-card dark:to-purple-950/20 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-sm">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Smart Kitchen</h1>
                  <p className="text-muted-foreground text-sm">
                    Ghar ke ingredients batao — Pingu recipe banayega!
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">Waste Less</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Budget Friendly</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Quick Recipes</span>
              </div>
            </div>
          </div>

          {/* Ingredient Input */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Ghar mein kya hai?</h2>
              <p className="text-sm text-muted-foreground">Ingredients add karo — AI inhi se recipe banayega</p>
            </div>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    addIngredient(inputValue)
                  }
                }}
                placeholder="Ingredient type karo (Enter press karo)"
                className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={() => addIngredient(inputValue)}
                className="flex items-center gap-1.5 rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Quick suggestions */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Common ingredients:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedIngredients
                  .filter((s) => !ingredients.some((i) => i.toLowerCase() === s.toLowerCase()))
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => addIngredient(s)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            </div>

            {/* Added ingredients */}
            {ingredients.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {ingredients.length} ingredient{ingredients.length > 1 ? "s" : ""} added:
                </p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {ingredients.map((item) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                      >
                        {item}
                        <button onClick={() => removeIngredient(item)}>
                          <X className="w-3.5 h-3.5 hover:text-rose-600" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Servings & Meal Type */}
            <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-foreground">Preferences</h2>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Servings</p>
                <div className="flex gap-2 flex-wrap">
                  {servingOptions.map((n) => (
                    <button
                      key={n}
                      onClick={() => setServings(n)}
                      className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                        servings === n
                          ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/40"
                          : "border-border text-foreground hover:border-purple-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Meal Type</p>
                <div className="flex gap-2 flex-wrap">
                  {mealTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                        mealType === type
                          ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/40"
                          : "border-border text-foreground hover:border-purple-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cook Time & Diet */}
            <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-foreground">Filters</h2>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Max Cook Time</p>
                <div className="flex gap-2 flex-wrap">
                  {cookTimes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setCookTime(t)}
                      className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                        cookTime === t
                          ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/40"
                          : "border-border text-foreground hover:border-purple-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Diet (optional)</p>
                <div className="flex gap-2 flex-wrap">
                  {dietOptions.map((pref) => (
                    <button
                      key={pref}
                      onClick={() => toggleDiet(pref)}
                      className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                        dietPrefs.includes(pref)
                          ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/40"
                          : "border-border text-foreground hover:border-purple-300"
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateRecipes}
            disabled={loading || ingredients.length === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-white font-bold text-base shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">🐧</span>
                Pingu recipes dhundh raha hai…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Meri Recipes Banao!
              </>
            )}
          </button>

          {/* Message */}
          {message && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
              {message}
            </div>
          )}

          {/* Recipes */}
          <AnimatePresence>
            {recipes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-purple-600" />
                  {recipes.length} Recipes Ready!
                </h2>

                {recipes.map((recipe, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden"
                  >
                    {/* Recipe header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold">{recipe.name}</h3>
                          <p className="text-white/80 text-sm mt-1">{recipe.description}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          difficultyColors[recipe.difficulty] || "bg-white/20 text-white"
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-white/90">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> {recipe.cook_time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> {recipe.servings} servings
                        </span>
                        {recipe.calories_est && (
                          <span className="flex items-center gap-1.5">
                            <Flame className="w-4 h-4" /> ~{recipe.calories_est} kcal/serving
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {recipe.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {recipe.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                tagColors[tag] || "bg-white/20 text-white"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-5">
                      {/* Ingredients grid */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            You have ({recipe.ingredients_used?.length || 0})
                          </p>
                          <ul className="space-y-1">
                            {(recipe.ingredients_used || []).map((ing) => (
                              <li key={ing} className="text-sm text-foreground flex items-start gap-1.5">
                                <Leaf className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {recipe.ingredients_extra?.length > 0 && (
                          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Needed ({recipe.ingredients_extra.length})
                            </p>
                            <ul className="space-y-1">
                              {recipe.ingredients_extra.map((ing) => (
                                <li key={ing} className="text-sm text-foreground flex items-start gap-1.5">
                                  <Tag className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                  {ing}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Steps */}
                      <div>
                        <button
                          onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                          className="flex w-full items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          <span>Tarika ({recipe.steps?.length || 0} steps)</span>
                          <span className="text-muted-foreground">{expandedStep === idx ? "▲ Hide" : "▼ Show"}</span>
                        </button>

                        <AnimatePresence>
                          {expandedStep === idx && (
                            <motion.ol
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-3 space-y-2"
                            >
                              {(recipe.steps || []).map((step, stepIdx) => (
                                <li key={stepIdx} className="flex gap-3 rounded-xl bg-muted/40 px-4 py-3 text-sm">
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                                    {stepIdx + 1}
                                  </span>
                                  <span className="text-foreground">{step.replace(/^Step \d+:\s*/i, "")}</span>
                                </li>
                              ))}
                            </motion.ol>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Tip */}
                      {recipe.tip && (
                        <div className="flex items-start gap-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 px-4 py-3">
                          <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            <strong>Tip:</strong> {recipe.tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  )
}
