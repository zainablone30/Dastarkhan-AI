"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

const moodOptions = [
  { id: "hungry", label: "Hungry", emoji: "😋", hint: "Filling and satisfying" },
  { id: "tired", label: "Tired", emoji: "😴", hint: "Comfort and warm" },
  { id: "celebrate", label: "Celebration", emoji: "🥳", hint: "Special and shareable" },
  { id: "sick", label: "Feeling sick", emoji: "🤒", hint: "Light and mild" },
  { id: "gym", label: "Gym mode", emoji: "💪", hint: "Protein-focused" },
  { id: "late", label: "Late night", emoji: "🌙", hint: "Quick cravings" },
  { id: "chai", label: "Chai time", emoji: "☕", hint: "Snacks and nashta" },
  { id: "spicy", label: "Spicy mood", emoji: "🔥", hint: "Bold, spicy picks" },
]

const healthOptions = [
  { label: "Fever", emoji: "🤒" },
  { label: "Diabetes", emoji: "🩸" },
  { label: "Hypertension", emoji: "💊" },
  { label: "Gastro", emoji: "🤢" },
  { label: "Post-Surgery", emoji: "🏥" },
  { label: "Pregnancy", emoji: "🤰" },
]

const dietOptions = [
  { label: "Vegetarian", emoji: "🥗" },
  { label: "High Protein", emoji: "🏋️" },
  { label: "Low Carb", emoji: "🥦" },
  { label: "Low Spice", emoji: "🧂" },
  { label: "Dairy-Free", emoji: "🥛" },
  { label: "Gluten-Free", emoji: "🌾" },
]

type MediMenuItem = {
  id: string
  name: string
  restaurant: string
  area: string
  description: string
  calories_kcal: number | null
  benefits: string
  ingredients: string[]
  allergens: string[]
  reason: string
  tags: string[]
  price: number | null
  rating: number | null
  delivery_time: string | null
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

function formatList(values: string[]) {
  if (!values.length) return "None"
  return values.join(", ")
}

export default function MediMenuPage() {
  const [selectedMood, setSelectedMood] = useState<(typeof moodOptions)[number] | null>(null)
  const [health, setHealth] = useState<string[]>([])
  const [diet, setDiet] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [results, setResults] = useState<MediMenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const hasSelection = Boolean(selectedMood || health.length || diet.length || notes.trim())

  const analyze = async () => {
    if (!hasSelection) {
      setMessage("Select mood, health, diet, ya notes add karo.")
      return
    }
    setLoading(true)
    setMessage("")
    setResults([])
    try {
      const res = await fetch("/api/medimenu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood?.label || "",
          health,
          diet,
          notes: notes.trim(),
        }),
      })
      const data = await res.json()
      setResults(data.items || [])
      if (data.message) setMessage(data.message)
      if (!data.items || data.items.length === 0) {
        setMessage(data.message || "No picks returned. Try another selection.")
      }
    } catch (err) {
      console.error(err)
      setMessage("Network masla lag raha hai. Thori dair baad try karo.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-background to-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-6 pt-20 lg:pt-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-white via-white to-orange-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                  🩺
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">MediMenu AI</h1>
                  <p className="text-muted-foreground">
                    Mood, health, ya diet select karo. Personalized menu picks milen.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-foreground">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">Mood-aware</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Health-aware</span>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">Diet-aware</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-2">Mood</h2>
                <p className="text-sm text-muted-foreground mb-4">Pick one mood for smarter picks.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {moodOptions.map((mood) => {
                    const active = selectedMood?.id === mood.id
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(active ? null : mood)}
                        className={`rounded-2xl border-2 p-3 text-left transition-all ${
                          active
                            ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                            : "border-transparent bg-muted/60 hover:border-orange-200"
                        }`}
                      >
                        <div className="text-2xl">{mood.emoji}</div>
                        <p className="mt-2 text-sm font-semibold">{mood.label}</p>
                        <p className="text-xs text-muted-foreground">{mood.hint}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-2">Health</h2>
                <p className="text-sm text-muted-foreground mb-4">Select health conditions (multi).</p>
                <div className="flex flex-wrap gap-2">
                  {healthOptions.map((option) => {
                    const active = health.includes(option.label)
                    return (
                      <button
                        key={option.label}
                        onClick={() => setHealth(toggleValue(health, option.label))}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          active
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-border bg-background hover:border-emerald-200"
                        }`}
                      >
                        {option.emoji} {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-2">Diet</h2>
                <p className="text-sm text-muted-foreground mb-4">Select diet preferences (multi).</p>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map((option) => {
                    const active = diet.includes(option.label)
                    return (
                      <button
                        key={option.label}
                        onClick={() => setDiet(toggleValue(diet, option.label))}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          active
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-border bg-background hover:border-indigo-200"
                        }`}
                      >
                        {option.emoji} {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-2">Extra Notes</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Example: lactose intolerant, low spice, gym cut, heart friendly.
                </p>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes for AI..."
                  className="min-h-[110px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-1">Your Selection</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Mood: {selectedMood?.label || "None"} · Health: {formatList(health)} · Diet: {formatList(diet)}
                </p>
                <button
                  onClick={analyze}
                  disabled={!hasSelection || loading}
                  className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-white font-semibold shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? "AI menu analyze kar raha hai..." : "Mere liye MediMenu banao 🐧"}
                </button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Calories and ingredients are AI estimates. Allergens come from Supabase tags.
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {message}
            </div>
          )}

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">AI Picks</h2>
                <p className="text-xs text-muted-foreground">{results.length} dishes matched</p>
              </div>

              {results.map((item) => (
                <div key={item.id} className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.restaurant} · {item.area}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-3 py-1 text-foreground">
                          {tag}
                        </span>
                      ))}
                      {item.price !== null && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                          Rs.{item.price}
                        </span>
                      )}
                      {item.rating !== null && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                          {item.rating}★
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-foreground">{item.reason}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-muted/50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">Calories (est.)</p>
                      <p className="text-sm font-semibold text-foreground">
                        {item.calories_kcal ? `${item.calories_kcal} kcal` : "Not available"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-3 sm:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground">Benefits</p>
                      <p className="text-sm text-foreground">{item.benefits}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-muted/50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">Ingredients (est.)</p>
                      {item.ingredients.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.ingredients.map((ingredient) => (
                            <span key={ingredient} className="rounded-full bg-background px-3 py-1 text-xs text-foreground">
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">Not available</p>
                      )}
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">Allergens</p>
                      {item.allergens.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.allergens.map((allergen) => (
                            <span key={allergen} className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">No allergen tags</p>
                      )}
                    </div>
                  </div>

                  {item.delivery_time && (
                    <p className="mt-3 text-xs text-muted-foreground">Delivery: {item.delivery_time}</p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
