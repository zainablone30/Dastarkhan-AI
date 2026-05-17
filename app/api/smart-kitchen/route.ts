import { NextRequest, NextResponse } from "next/server"

const GEMINI_MODEL = "gemini-2.5-flash-lite"

type SmartKitchenInput = {
  ingredients: string[]
  servings?: number
  mealType?: string
  dietPrefs?: string[]
  cookTime?: string
}

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

function extractJson(text: string): string | null {
  const cleaned = text.replace(/```json|```/g, "").trim()
  const start = cleaned.indexOf("[")
  const end = cleaned.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) return null
  return cleaned.slice(start, end + 1)
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SmartKitchenInput
  const ingredients = (body.ingredients || []).map((i) => i.trim()).filter(Boolean)

  if (ingredients.length === 0) {
    return NextResponse.json({ recipes: [], message: "Koi ingredient nahi diya." }, { status: 400 })
  }

  const servings = body.servings || 2
  const mealType = body.mealType || "Any"
  const dietPrefs = (body.dietPrefs || []).join(", ") || "None"
  const cookTime = body.cookTime || "Any"

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ recipes: [], message: "AI key missing." }, { status: 500 })
  }

  const prompt = `You are Smart Kitchen AI for Dastarkhan, helping Pakistani home cooks make delicious meals from whatever they have at home.

USER'S AVAILABLE INGREDIENTS: ${ingredients.join(", ")}
SERVINGS: ${servings}
MEAL TYPE: ${mealType}
DIET PREFERENCES: ${dietPrefs}
MAX COOK TIME: ${cookTime}

Generate 3 Pakistani/desi recipes (can include fusion) that primarily use the listed ingredients. Minimize waste — use as many listed ingredients as possible. Only suggest 1-2 extra ingredients per recipe maximum.

Return ONLY a JSON array of exactly 3 recipes:
[
  {
    "name": "Recipe Name",
    "description": "2-sentence description of the dish",
    "ingredients_used": ["ingredient1 - qty", "ingredient2 - qty"],
    "ingredients_extra": ["optional extra ingredient - qty"],
    "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "cook_time": "20 mins",
    "servings": 2,
    "difficulty": "Easy",
    "calories_est": 350,
    "tags": ["Quick", "Budget Friendly"],
    "tip": "One useful cooking tip"
  }
]

Rules:
- difficulty must be exactly "Easy", "Medium", or "Hard"
- steps should be 4-7 clear steps
- tags should be 2-3 items from: Quick, Budget Friendly, Waste Less, High Protein, Vegetarian, Kid Friendly, One Pot, Healthy
- calories_est is per serving integer or null
- Use common Pakistani pantry items (oil, salt, zeera, etc.) without listing them in ingredients_extra
- No extra text outside the JSON array`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          response_mime_type: "application/json",
        },
      }),
    },
  )

  if (!response.ok) {
    const err = await response.json()
    console.error("Smart Kitchen Gemini error:", err)
    return NextResponse.json({ recipes: [], message: "AI service error." }, { status: 500 })
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

  let recipes: Recipe[] = []
  try {
    const parsed = JSON.parse(text)
    recipes = Array.isArray(parsed) ? parsed : []
  } catch {
    const extracted = extractJson(text)
    if (extracted) {
      try {
        recipes = JSON.parse(extracted)
      } catch {
        recipes = []
      }
    }
  }

  if (recipes.length === 0) {
    return NextResponse.json({ recipes: [], message: "AI ne recipe generate nahi ki. Dobara try karo." })
  }

  return NextResponse.json({ recipes })
}
