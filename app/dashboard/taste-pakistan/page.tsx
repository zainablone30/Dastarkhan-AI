"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

const cities = ["Lahore", "Karachi", "Peshawar", "Islamabad", "Quetta"]
const vibes = [
  { id: "street", label: "Street legends", emoji: "🌶️" },
  { id: "heritage", label: "Heritage classics", emoji: "🏺" },
  { id: "bbq", label: "BBQ & grills", emoji: "🔥" },
  { id: "royal", label: "Royal & rich", emoji: "👑" },
  { id: "sweet", label: "Sweet trail", emoji: "🍯" },
]
const spiceLevels = ["Mild", "Medium", "Spicy"]
const diets = ["Any", "Vegetarian", "Non-veg"]
const timeOptions = ["Breakfast", "Lunch", "Dinner", "Late night"]
const budgets = ["Budget", "Mid", "Premium"]

function optionClass(active: boolean) {
  return `rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
    active
      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
      : "border-border bg-card text-foreground hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
  }`
}

function pillClass(active: boolean) {
  return `rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
    active
      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
      : "border-border bg-card text-foreground hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
  }`
}

type TasteDish = {
  name: string
  story: string
  spice: string
  best_time: string
  must_try: string
  area: string
  price_hint?: string
  cultural_note?: string
}

type TasteTrail = {
  stop: string
  area: string
  why: string
  order: number
  safety?: string
}

type TasteResponse = {
  overview: string
  hero_dish: {
    name: string
    story: string
    spice: string
    best_time: string
    pairing: string
    area: string
  }
  dishes: TasteDish[]
  trail: TasteTrail[]
  tips: string[]
  beverages: string[]
  etiquette?: string[]
  phrases?: {
    roman_urdu: string
    english: string
  }[]
  safety_notes?: string[]
  estimated_cost?: string
  map_query?: string
}

const fallback: Record<string, TasteResponse> = {
  Lahore: {
    overview: "Lahore is Pakistan's food capital with bold spices and late-night feasts.",
    hero_dish: {
      name: "Lahori Chargha",
      story: "Marinated whole chicken, deep fried to perfection. A wedding staple.",
      spice: "Spicy",
      best_time: "Dinner",
      pairing: "Raita + naan",
      area: "Gawalmandi",
    },
    dishes: [
      { name: "Paye", story: "Slow-cooked trotters since Mughal era.", spice: "Medium", best_time: "Breakfast", must_try: "Nalli pieces", area: "Data Darbar" },
      { name: "Phajja Siri Paye", story: "Soul-warming Lahori dawn ritual.", spice: "Medium", best_time: "Breakfast", must_try: "Siri broth", area: "Bhatti Gate" },
      { name: "Gawalmandi BBQ", story: "Smoky grills with street energy.", spice: "Spicy", best_time: "Dinner", must_try: "Chicken tikka", area: "Gawalmandi" },
    ],
    trail: [
      { stop: "Siri Paye", area: "Bhatti Gate", why: "Start with Lahori breakfast", order: 1 },
      { stop: "BBQ Street", area: "Gawalmandi", why: "Smoke + spices", order: 2 },
      { stop: "Kheer", area: "Anarkali", why: "Sweet finish", order: 3 },
    ],
    tips: ["Go after 8pm for the full vibe", "Ask for fresh naan", "Keep cash for street stalls"],
    beverages: ["Doodh Patti", "Sattu", "Mint lemonade"],
  },
  Karachi: {
    overview: "Karachi blends coastal flavors with street-food hustle.",
    hero_dish: {
      name: "Burns Road Nihari",
      story: "The original nihari with 250 years of legacy.",
      spice: "Medium",
      best_time: "Breakfast",
      pairing: "Khamiri roti",
      area: "Burns Road",
    },
    dishes: [
      { name: "Bun Kebab", story: "Karachi's working-class burger icon.", spice: "Medium", best_time: "Late night", must_try: "Chutney heavy", area: "Burns Road" },
      { name: "Seafood Grill", story: "Coastal spice with smoke.", spice: "Spicy", best_time: "Dinner", must_try: "Charcoal pomfret", area: "Do Darya" },
    ],
    trail: [
      { stop: "Nihari", area: "Burns Road", why: "Historic start", order: 1 },
      { stop: "Bun Kebab", area: "Saddar", why: "Street energy", order: 2 },
      { stop: "Seafood", area: "Do Darya", why: "Ocean finish", order: 3 },
    ],
    tips: ["Avoid rush hours", "Carry water", "Try green chutney"],
    beverages: ["Sugarcane juice", "Rooh Afza"],
  },
  Peshawar: {
    overview: "Peshawar is all about smoke, meat, and hospitality.",
    hero_dish: {
      name: "Chapli Kebab",
      story: "Flat, spiced kebab cooked on huge tawaas.",
      spice: "Spicy",
      best_time: "Lunch",
      pairing: "Naan + chutney",
      area: "Qissa Khwani",
    },
    dishes: [
      { name: "Peshawari Ice Cream", story: "Thick, rich, and served with naan.", spice: "Mild", best_time: "Dinner", must_try: "Kulfi twist", area: "Khyber Bazaar" },
    ],
    trail: [
      { stop: "Chapli Kebab", area: "Qissa Khwani", why: "The signature", order: 1 },
      { stop: "Ice Cream", area: "Khyber Bazaar", why: "Cool down", order: 2 },
    ],
    tips: ["Go with friends", "Try fresh naan", "Tea after kebab"],
    beverages: ["Kehwa", "Cold lassi"],
  },
  Islamabad: {
    overview: "Islamabad offers clean flavors and modern desi classics.",
    hero_dish: {
      name: "Sajji",
      story: "Whole lamb roasted on open wood fire.",
      spice: "Medium",
      best_time: "Dinner",
      pairing: "Rice + chutney",
      area: "F-7",
    },
    dishes: [
      { name: "Kabuli Pulao", story: "Afghan-inspired rice with raisins.", spice: "Mild", best_time: "Lunch", must_try: "Tender lamb", area: "F-10" },
    ],
    trail: [
      { stop: "Sajji", area: "F-7", why: "Iconic grill", order: 1 },
      { stop: "Pulao", area: "F-10", why: "Hearty finish", order: 2 },
    ],
    tips: ["Reserve on weekends", "Try green chutney"],
    beverages: ["Mint lemonade"],
  },
  Quetta: {
    overview: "Quetta is the heart of Balochi slow-roast traditions.",
    hero_dish: {
      name: "Quetta Sajji",
      story: "Original Balochi saji, slow-roasted over coals.",
      spice: "Medium",
      best_time: "Dinner",
      pairing: "Roti + chutney",
      area: "Mezan Chowk",
    },
    dishes: [
      { name: "Namkeen Rosh", story: "Salted lamb cooked in its own fat.", spice: "Mild", best_time: "Dinner", must_try: "Bone marrow", area: "Brewery Road" },
    ],
    trail: [
      { stop: "Sajji", area: "Mezan Chowk", why: "Balochi classic", order: 1 },
      { stop: "Rosh", area: "Brewery Road", why: "Deep flavors", order: 2 },
    ],
    tips: ["Go early evening", "Ask for fresh roti"],
    beverages: ["Green tea"],
  },
}

export default function TasteOfPakistanPage() {
  const [city, setCity] = useState("Lahore")
  const [vibe, setVibe] = useState(vibes[0].id)
  const [spice, setSpice] = useState(spiceLevels[1])
  const [diet, setDiet] = useState(diets[0])
  const [time, setTime] = useState(timeOptions[2])
  const [budget, setBudget] = useState(budgets[1])
  const [result, setResult] = useState<TasteResponse>(fallback.Lahore)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const generate = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/taste-pakistan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          vibe,
          spice,
          diet,
          time,
          budget,
        }),
      })
      const data = await res.json()
      if (res.ok && data.result) {
        setResult(data.result)
      } else {
        setResult(fallback[city])
      }
      if (data.message) setMessage(data.message)
    } catch {
      setResult(fallback[city])
      setMessage("AI unavailable. Showing city spotlight.")
    }
    setLoading(false)
  }

  const currentVibe = vibes.find((item) => item.id === vibe)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-6 pt-20 lg:pt-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                  Taste Trail
                </div>
                <h1 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
                  🇵🇰 Taste of Pakistan
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Curate a food journey that matches your vibe, spice, and time of day. Pingu will
                  craft a city-specific trail with heritage, stories, and must-try bites.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {cities.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => {
                        setCity(c)
                        setResult(fallback[c])
                      }}
                      className={pillClass(city === c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground">Flavor Settings</h2>
                <p className="text-xs text-muted-foreground">Dial the experience you want.</p>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Vibe</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {vibes.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setVibe(item.id)}
                          className={optionClass(vibe === item.id)}
                        >
                          {item.emoji} {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Spice</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {spiceLevels.map((level) => (
                          <button
                            type="button"
                            key={level}
                            onClick={() => setSpice(level)}
                            className={optionClass(spice === level)}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Diet</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {diets.map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => setDiet(option)}
                            className={optionClass(diet === option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Time</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {timeOptions.map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => setTime(option)}
                            className={optionClass(time === option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Budget</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {budgets.map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => setBudget(option)}
                            className={optionClass(budget === option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={generate}
                    disabled={loading}
                    className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:shadow-sm"
                  >
                    {loading
                      ? "AI taste trail bana raha hai..."
                      : `Generate ${currentVibe?.label || "taste"} trail`}
                  </button>
                  {message && <p className="text-xs text-amber-700">{message}</p>}
                  {result.estimated_cost && (
                    <div className="rounded-xl border border-border bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">AI Budget</p>
                      <p className="text-sm font-semibold text-foreground">{result.estimated_cost}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">City Spotlight</h2>
                  <p className="text-sm text-foreground/80">{result.overview}</p>
                </div>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  {city}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-orange-200 bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Hero Dish</p>
                    <h3 className="text-lg font-bold text-foreground">{result.hero_dish.name}</h3>
                    <p className="text-sm text-foreground/80">{result.hero_dish.story}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground shadow-sm">
                    <p><span className="font-semibold">Spice:</span> {result.hero_dish.spice}</p>
                    <p><span className="font-semibold">Best time:</span> {result.hero_dish.best_time}</p>
                    <p><span className="font-semibold">Area:</span> {result.hero_dish.area}</p>
                    <p><span className="font-semibold">Pairing:</span> {result.hero_dish.pairing}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {result.dishes.map((dish, index) => (
                  <div key={`${dish.name}-${index}`} className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Must try</p>
                    <h4 className="text-base font-semibold text-foreground">{dish.name}</h4>
                    <p className="text-sm text-foreground/80">{dish.story}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-border bg-secondary px-3 py-1 font-medium text-secondary-foreground">{dish.spice}</span>
                      <span className="rounded-full border border-border bg-secondary px-3 py-1 font-medium text-secondary-foreground">{dish.best_time}</span>
                      <span className="rounded-full border border-border bg-secondary px-3 py-1 font-medium text-secondary-foreground">{dish.area}</span>
                      {dish.price_hint && (
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700">{dish.price_hint}</span>
                      )}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-foreground">Try: {dish.must_try}</p>
                    {dish.cultural_note && (
                      <p className="mt-2 text-xs text-foreground/75">{dish.cultural_note}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground">Taste Trail</h3>
                <p className="text-sm text-foreground/80">Follow this order to build flavor.</p>
                <div className="mt-4 space-y-3">
                  {result.trail.map((stop) => (
                    <div key={`${stop.stop}-${stop.order}`} className="rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {stop.order}. {stop.stop}
                        </p>
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">{stop.area}</span>
                      </div>
                      <p className="text-xs text-foreground/75 mt-1">{stop.why}</p>
                      {stop.safety && (
                        <p className="mt-2 text-xs font-medium text-foreground">Safety: {stop.safety}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground">Culture Tips</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.tips.map((tip) => (
                    <span key={tip} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {tip}
                    </span>
                  ))}
                </div>
                <h4 className="mt-6 text-sm font-semibold text-foreground">Signature Drinks</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.beverages.map((bev) => (
                    <span key={bev} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                      {bev}
                    </span>
                  ))}
                </div>
              </div>

              {((result.etiquette?.length || 0) > 0 || (result.safety_notes?.length || 0) > 0) && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground">Traveler Guide</h3>
                  {result.etiquette && result.etiquette.length > 0 && (
                    <>
                      <h4 className="mt-3 text-sm font-semibold text-foreground">Etiquette</h4>
                      <div className="mt-2 space-y-2">
                        {result.etiquette.map((tip) => (
                          <p key={tip} className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground">
                            {tip}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                  {result.safety_notes && result.safety_notes.length > 0 && (
                    <>
                      <h4 className="mt-4 text-sm font-semibold text-foreground">Food Safety</h4>
                      <div className="mt-2 space-y-2">
                        {result.safety_notes.map((note) => (
                          <p key={note} className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground">
                            {note}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {result.phrases && result.phrases.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground">Order Like a Local</h3>
                  <div className="mt-3 space-y-2">
                    {result.phrases.map((phrase) => (
                      <div key={`${phrase.roman_urdu}-${phrase.english}`} className="rounded-xl border border-border bg-background px-3 py-2 transition-all hover:border-orange-200 hover:bg-card">
                        <p className="text-sm font-semibold text-foreground">{phrase.roman_urdu}</p>
                        <p className="text-xs text-foreground/75">{phrase.english}</p>
                      </div>
                    ))}
                  </div>
                  {result.map_query && (
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(result.map_query)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    >
                      Open trail in Maps
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  )
}
