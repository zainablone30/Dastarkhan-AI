import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

type FoodRow = {
  id: number | string
  name: string
  category?: string | null
  price?: number | null
  rating?: number | null
  delivery_time?: string | null
  is_spicy?: boolean | null
  is_veg?: boolean | null
  is_homemade?: boolean | null
  is_ai_recommended?: boolean | null
  description?: string | null
  allergens?: string[] | null
  restaurants?: { name?: string | null; area?: string | null } | { name?: string | null; area?: string | null }[] | null
}

type MediMenuInput = {
  mood?: string
  health?: string[]
  diet?: string[]
  notes?: string
}

type AiPick = {
  id?: string | number
  reason?: string
  calories_kcal?: number | string
  benefits?: string
  ingredients?: string[] | string
}

type SelectionContext = {
  mood: string
  health: string[]
  diet: string[]
  notes: string
}

const GEMINI_MODEL = "gemini-2.5-flash-lite"
const proteinRegex = /chicken|beef|mutton|egg|protein|daal|lentil|kebab|tikka|grilled|fish|prawn|seafood/i
const lightRegex = /soup|khichdi|daal|broth|yogurt|fruit|salad|grilled|boiled/i
const chaiRegex = /chai|paratha|omelet|omelette|samosa|roll|breakfast|nashta|snack|bun|biscuit/i
const carbRegex = /rice|biryani|pulao|bread|paratha|naan|pasta|dessert|sweet|roll|burger|pizza/i

function getRestaurant(food: FoodRow) {
  return Array.isArray(food.restaurants) ? food.restaurants[0] : food.restaurants
}

function normalizeText(value: string) {
  return value.toLowerCase()
}

function foodText(food: FoodRow) {
  return normalizeText(
    [food.name, food.category, food.description].filter(Boolean).join(" ")
  )
}

function hasAllergen(food: FoodRow, allergen: string) {
  const list = Array.isArray(food.allergens) ? food.allergens : []
  return list.some((item) => item.toLowerCase() === allergen.toLowerCase())
}

function notesMatch(notes: string, regex: RegExp) {
  return regex.test(notes)
}

function scoreFood(food: FoodRow, context: SelectionContext) {
  let score = 0
  const text = foodText(food)
  const mood = normalizeText(context.mood || "")
  const notes = normalizeText(context.notes || "")

  if (food.is_ai_recommended) score += 1.5
  if (typeof food.rating === "number") score += Math.min(5, food.rating) / 2

  if (mood.includes("sick")) {
    if (!food.is_spicy) score += 2
    if (lightRegex.test(text)) score += 2
    if (food.is_spicy) score -= 2
  }

  if (mood.includes("gym")) {
    if (proteinRegex.test(text)) score += 3
  }

  if (mood.includes("spicy")) {
    score += food.is_spicy ? 3 : -2
  }

  if (mood.includes("chai")) {
    if (chaiRegex.test(text)) score += 2
  }

  if (mood.includes("celebration")) {
    if ((food.rating ?? 0) >= 4.5) score += 2
  }

  if (mood.includes("hungry")) {
    if (/rice|karahi|biryani|bbq|curry|roll|burger/i.test(text)) score += 2
  }

  if (mood.includes("late")) {
    if ((food.delivery_time || "").includes("15") || (food.delivery_time || "").includes("20")) {
      score += 1
    }
  }

  for (const condition of context.health) {
    const label = normalizeText(condition)
    if (label.includes("diabetes")) {
      if (/dessert|sweet|kheer|halwa|gulab|rabri|falooda/i.test(text)) score -= 3
    }
    if (label.includes("hypertension")) {
      if (food.is_spicy) score -= 2
      if (/fried|karahi|nihari|bbq/i.test(text)) score -= 1
      if (!food.is_spicy) score += 1
    }
    if (label.includes("gastro") || label.includes("post") || label.includes("pregnancy") || label.includes("fever")) {
      if (food.is_spicy) score -= 2
      if (lightRegex.test(text)) score += 1.5
    }
  }

  for (const pref of context.diet) {
    const label = normalizeText(pref)
    if (label.includes("vegetarian")) score += food.is_veg ? 4 : -6
    if (label.includes("high protein")) {
      if (proteinRegex.test(text)) score += 3
    }
    if (label.includes("low carb")) {
      score += carbRegex.test(text) ? -3 : 1
    }
    if (label.includes("low spice")) score += food.is_spicy ? -3 : 2
    if (label.includes("dairy")) score += hasAllergen(food, "Dairy") ? -4 : 1
    if (label.includes("gluten")) score += hasAllergen(food, "Gluten") ? -4 : 1
  }

  if (notes) {
    if (notesMatch(notes, /low spice|mild/i)) score += food.is_spicy ? -2 : 2
    if (notesMatch(notes, /gym|protein|high protein/i) && proteinRegex.test(text)) score += 2
    if (notesMatch(notes, /veggie|vegetarian|veg/i)) score += food.is_veg ? 2 : -2
    if (notesMatch(notes, /dairy[- ]?free/i)) score += hasAllergen(food, "Dairy") ? -3 : 1
    if (notesMatch(notes, /gluten[- ]?free/i)) score += hasAllergen(food, "Gluten") ? -3 : 1
  }

  return score
}

function applyStrictFilters(menu: FoodRow[], context: SelectionContext) {
  const wantsVeg = context.diet.some((item) => item.toLowerCase().includes("vegetarian"))
  const wantsLowSpice = context.diet.some((item) => item.toLowerCase().includes("low spice"))
  const wantsDairyFree = context.diet.some((item) => item.toLowerCase().includes("dairy"))
  const wantsGlutenFree = context.diet.some((item) => item.toLowerCase().includes("gluten"))
  const healthAvoidSpicy = context.health.some((item) =>
    /gastro|post|pregnancy|fever/i.test(item)
  )

  const filtered = menu.filter((food) => {
    if (wantsVeg && !food.is_veg) return false
    if ((wantsLowSpice || healthAvoidSpicy) && food.is_spicy) return false
    if (wantsDairyFree && hasAllergen(food, "Dairy")) return false
    if (wantsGlutenFree && hasAllergen(food, "Gluten")) return false
    return true
  })

  return filtered.length >= 6 ? filtered : menu
}

function rankMenu(menu: FoodRow[], context: SelectionContext) {
  const base = applyStrictFilters(menu, context)
  return [...base].sort((a, b) => {
    const scoreDiff = scoreFood(b, context) - scoreFood(a, context)
    if (scoreDiff !== 0) return scoreDiff
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0)
    if (ratingDiff !== 0) return ratingDiff
    return String(a.name).localeCompare(String(b.name))
  })
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  )
}

function safeText(value: unknown) {
  if (typeof value !== "string") return ""
  return value.replace(/\s+/g, " ").trim()
}

function parseCalories(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value)
  if (typeof value === "string") {
    const match = value.match(/\d{2,4}/)
    if (match) return Number.parseInt(match[0], 10)
  }
  return null
}

function normalizeIngredients(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function extractJsonArray(text: string): string | null {
  const cleaned = text.replace(/```json|```/g, "").trim()
  const start = cleaned.indexOf("[")
  const end = cleaned.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) return null
  return cleaned.slice(start, end + 1)
}

function extractJsonObject(text: string): string | null {
  const cleaned = text.replace(/```json|```/g, "").trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  return cleaned.slice(start, end + 1)
}

function parseJsonInput(input: string): unknown[] | null {
  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).items)) {
      return (parsed as any).items
    }
    return null
  } catch {
    const sanitized = input
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}")

    try {
      const parsed = JSON.parse(sanitized)
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).items)) {
        return (parsed as any).items
      }
      return null
    } catch {
      return null
    }
  }
}

function tryParseJsonArray(text: string): unknown[] | null {
  const cleaned = text.replace(/```json|```/g, "").trim()
  if (!cleaned) return null

  const direct = parseJsonInput(cleaned)
  if (direct) return direct

  const arrayText = extractJsonArray(cleaned)
  if (arrayText) {
    const parsed = parseJsonInput(arrayText)
    if (parsed) return parsed
  }

  const objectText = extractJsonObject(cleaned)
  if (objectText) {
    const parsed = parseJsonInput(objectText)
    if (parsed) return parsed
  }

  return null
}

async function repairJsonArray(rawText: string) {
  const sample = rawText.slice(0, 3500)
  const prompt = `Fix the following text to a valid JSON array.\n\nRules:\n- Output ONLY valid JSON array.\n- Keep the same objects and values.\n- Use double quotes for keys and strings.\n\nINPUT:\n${sample}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `You fix JSON formatting.\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 400,
          response_mime_type: "application/json",
        },
      }),
    },
  )

  if (!response.ok) return null
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null
}

function buildMenuLine(food: FoodRow) {
  const restaurant = getRestaurant(food)
  const tags = [
    food.is_ai_recommended ? "AI pick" : null,
    food.is_homemade ? "homemade" : null,
    food.is_spicy ? "spicy" : "mild",
    food.is_veg ? "veg" : "non-veg",
  ]
    .filter(Boolean)
    .join(", ")

  return [
    `ID: ${food.id}`,
    `Dish: ${food.name}`,
    `Category: ${food.category || "general"}`,
    `Price: Rs.${food.price ?? "N/A"}`,
    `Restaurant: ${restaurant?.name || "Dastarkhan"}`,
    `Area: ${restaurant?.area || "Lahore"}`,
    `Tags: ${tags}`,
    `Allergens: ${(food.allergens || []).join(", ") || "none"}`,
  ].join(" | ")
}

function normalizePick(raw: AiPick, menuById: Map<string, FoodRow>) {
  const id = raw?.id ? String(raw.id) : ""
  const menuItem = menuById.get(id)
  if (!menuItem) return null

  const restaurant = getRestaurant(menuItem)

  return {
    id: String(menuItem.id),
    name: menuItem.name,
    restaurant: restaurant?.name || "Dastarkhan",
    area: restaurant?.area || "Lahore",
    description: menuItem.description || "",
    calories_kcal: parseCalories(raw.calories_kcal),
    benefits: safeText(raw.benefits) || "Balanced pick from the menu.",
    ingredients: normalizeIngredients(raw.ingredients),
    allergens: Array.isArray(menuItem.allergens) ? menuItem.allergens : [],
    reason: safeText(raw.reason) || "Matches your preferences.",
    tags: [
      menuItem.category || null,
      menuItem.is_spicy ? "Spicy" : "Mild",
      menuItem.is_veg ? "Veg" : "Non-veg",
      menuItem.is_homemade ? "Homemade" : null,
      menuItem.is_ai_recommended ? "AI Pick" : null,
    ].filter(Boolean),
    price: menuItem.price ?? null,
    rating: menuItem.rating ?? null,
    delivery_time: menuItem.delivery_time ?? null,
  }
}

function buildFallbackReason(food: FoodRow, context: SelectionContext) {
  const text = foodText(food)
  const reasons: string[] = []

  if (context.diet.some((item) => item.toLowerCase().includes("vegetarian")) && food.is_veg) {
    reasons.push("Vegetarian-friendly")
  }
  if (context.diet.some((item) => item.toLowerCase().includes("low spice")) && !food.is_spicy) {
    reasons.push("Low spice pick")
  }
  if (context.diet.some((item) => item.toLowerCase().includes("high protein")) && proteinRegex.test(text)) {
    reasons.push("High protein")
  }
  if (context.health.some((item) => /gastro|post|pregnancy|fever/i.test(item)) && !food.is_spicy) {
    reasons.push("Mild for sensitive stomach")
  }
  if (context.mood.toLowerCase().includes("sick") && lightRegex.test(text)) {
    reasons.push("Light and soothing")
  }

  return reasons.length ? reasons.slice(0, 2).join(" - ") : "Top menu pick from live Supabase data."
}

function buildFallback(menu: FoodRow[], context: SelectionContext) {
  const picks = rankMenu(menu, context).slice(0, 5)
  return picks.map((food) => {
    const restaurant = getRestaurant(food)
    return {
      id: String(food.id),
      name: food.name,
      restaurant: restaurant?.name || "Dastarkhan",
      area: restaurant?.area || "Lahore",
      description: food.description || "",
      calories_kcal: null,
      benefits: "Menu-based suggestion. AI nutrition details unavailable.",
      ingredients: [],
      allergens: Array.isArray(food.allergens) ? food.allergens : [],
      reason: buildFallbackReason(food, context),
      tags: [
        food.category || null,
        food.is_spicy ? "Spicy" : "Mild",
        food.is_veg ? "Veg" : "Non-veg",
        food.is_homemade ? "Homemade" : null,
        food.is_ai_recommended ? "AI Pick" : null,
      ].filter(Boolean),
      price: food.price ?? null,
      rating: food.rating ?? null,
      delivery_time: food.delivery_time ?? null,
    }
  })
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as MediMenuInput
  const mood = typeof body.mood === "string" ? body.mood.trim() : ""
  const health = normalizeList(body.health)
  const diet = normalizeList(body.diet)
  const notes = typeof body.notes === "string" ? body.notes.trim() : ""
  const context: SelectionContext = { mood, health, diet, notes }

  const db = createServerSupabase()
  const { data: foods, error } = await db
    .from("foods")
    .select(`
      id,
      name,
      category,
      price,
      rating,
      delivery_time,
      is_spicy,
      is_veg,
      is_homemade,
      is_ai_recommended,
      description,
      allergens,
      restaurants(name, area)
    `)
    .order("is_ai_recommended", { ascending: false })
    .order("rating", { ascending: false })
    .limit(30)

  if (error) {
    console.error("MediMenu foods error:", error.message)
    return NextResponse.json({ items: [], message: "Supabase menu load failed." }, { status: 500 })
  }

  const menu = (foods || []) as FoodRow[]
  if (menu.length === 0) {
    return NextResponse.json({ items: [], message: "No menu items found in Supabase." }, { status: 404 })
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      items: buildFallback(menu, context),
      message: "GEMINI_API_KEY missing. Showing ranked menu picks.",
    })
  }

  const candidateMenu = rankMenu(menu, context).slice(0, 18)
  const menuContext = candidateMenu.map(buildMenuLine).join("\n")
  const systemPrompt = `You are MediMenu AI for Dastarkhan, a Pakistani food app.

You must recommend dishes ONLY from the live Supabase menu provided. Never invent dishes or restaurants.`

  const userPrompt = `User preferences:
Mood: ${mood || "not specified"}
Health conditions: ${health.join(", ") || "none"}
Diet preferences: ${diet.join(", ") || "none"}
Notes: ${notes || "none"}

Pick 4 to 6 dishes that best match. Return ONLY JSON array in this exact schema:
[
  {
    "id": "menu id",
    "reason": "short match reason",
    "calories_kcal": 520,
    "benefits": "short benefit line tied to mood/health/diet",
    "ingredients": ["ingredient", "ingredient", "ingredient"]
  }
]

Rules:
- Use only ids from the menu.
- calories_kcal must be an integer estimate.
- ingredients should be 4-8 common items; if unsure keep it short.
- No extra text, no markdown.

LIVE SUPABASE MENU:
${menuContext}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
          response_mime_type: "application/json",
          response_schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                reason: { type: "string" },
                calories_kcal: { type: "integer" },
                benefits: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
              },
              required: ["id", "reason", "calories_kcal", "benefits", "ingredients"],
            },
          },
        },
      }),
    },
  )

  const data = await response.json()
  if (!response.ok || data.error) {
    const errorMessage = data?.error?.message || `Status ${response.status}`
    console.error("MediMenu Gemini error:", JSON.stringify(data))
    return NextResponse.json({
      items: buildFallback(menu, context),
      message: `AI response failed (${errorMessage}). Showing ranked menu picks.`,
    })
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
  let raw = tryParseJsonArray(text)

  if (!raw) {
    const repaired = await repairJsonArray(text)
    if (repaired) raw = tryParseJsonArray(repaired)
  }

  if (!raw) {
    return NextResponse.json({
      items: buildFallback(menu, context),
      message: "AI output parse error. Showing ranked menu picks.",
    })
  }

  const menuById = new Map(menu.map((item) => [String(item.id), item]))
  const picks = raw
    .map((item) => normalizePick(item as AiPick, menuById))
    .filter(Boolean)

  if (picks.length === 0) {
    return NextResponse.json({
      items: buildFallback(menu, context),
      message: "AI returned no valid menu ids. Showing ranked menu picks.",
    })
  }

  return NextResponse.json({ items: picks })
}
