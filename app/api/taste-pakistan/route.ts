import { NextRequest, NextResponse } from "next/server"

const GEMINI_MODEL = "gemini-2.5-flash-lite"

type TasteRequest = {
  city: string
  vibe: string
  spice: string
  diet: string
  time: string
  budget: string
}

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim()
  if (!cleaned) return null

  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start === -1 || end === -1 || end <= start) return null

    try {
      return JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

function buildPrompt(input: TasteRequest) {
  return `Create a personalized Taste of Pakistan food trail.

User settings:
- City: ${input.city}
- Food vibe: ${input.vibe}
- Preferred spice: ${input.spice}
- Diet: ${input.diet}
- Time: ${input.time}
- Budget: ${input.budget}

Make it practical for a tourist or first-time visitor in Pakistan. Keep areas realistic for the selected city. If diet is Vegetarian, do not recommend meat dishes. Match spice, time, and budget closely.

Return ONLY JSON in this exact shape:
{
  "overview": "2 sentence city food overview",
  "hero_dish": {
    "name": "dish name",
    "story": "short cultural story",
    "spice": "Mild | Medium | Spicy",
    "best_time": "Breakfast | Lunch | Dinner | Late night",
    "pairing": "best side or drink",
    "area": "realistic area"
  },
  "dishes": [
    {
      "name": "dish",
      "story": "why it matters",
      "spice": "Mild | Medium | Spicy",
      "best_time": "Breakfast | Lunch | Dinner | Late night",
      "must_try": "specific bite or style",
      "area": "realistic area",
      "price_hint": "Budget | Mid | Premium",
      "cultural_note": "short note"
    }
  ],
  "trail": [
    {
      "order": 1,
      "stop": "dish or stop",
      "area": "area",
      "why": "reason",
      "safety": "short street-food safety tip"
    }
  ],
  "tips": ["short practical tip"],
  "beverages": ["local drink"],
  "etiquette": ["short cultural etiquette tip"],
  "phrases": [
    { "roman_urdu": "phrase", "english": "meaning" }
  ],
  "safety_notes": ["tourist-safe food note"],
  "estimated_cost": "PKR range for one person",
  "map_query": "search query for this food trail"
}

Use 3 dishes, 3 trail stops, 3 tips, 2 beverages, 3 etiquette tips, 3 phrases, and 3 safety notes.`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const input: TasteRequest = {
    city: normalizeText(body.city, "Lahore"),
    vibe: normalizeText(body.vibe, "street"),
    spice: normalizeText(body.spice, "Medium"),
    diet: normalizeText(body.diet, "Any"),
    time: normalizeText(body.time, "Dinner"),
    budget: normalizeText(body.budget, "Mid"),
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { result: null, message: "GEMINI_API_KEY missing. Showing city spotlight." },
      { status: 200 },
    )
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text:
                  "You are Taste of Pakistan, a culturally careful Pakistani food guide. Prefer accurate local food context, practical tourist safety, and concise recommendations.",
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
          generationConfig: {
            temperature: 0.55,
            maxOutputTokens: 1200,
            response_mime_type: "application/json",
          },
        }),
      },
    )

    if (!response.ok) {
      return NextResponse.json({
        result: null,
        message: "AI request failed. Showing city spotlight.",
      })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const result = parseJsonObject(text)

    if (!result || typeof result !== "object") {
      return NextResponse.json({
        result: null,
        message: "AI response was incomplete. Showing city spotlight.",
      })
    }

    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({
      result: null,
      message: "AI unavailable. Showing city spotlight.",
    })
  }
}
