import { NextRequest, NextResponse } from "next/server"

const GEMINI_MODEL = "gemini-2.5-flash-lite"

type LocationInfo = {
  city: string
  area: string
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function buildLocationLabel(location: LocationInfo) {
  if (location.area) return `${location.area}, ${location.city}`
  return location.city
}

async function reverseGeocode(lat?: number, lng?: number): Promise<LocationInfo | null> {
  if (typeof lat !== "number" || typeof lng !== "number") return null

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
  const response = await fetch(url, {
    headers: {
      "User-Agent": "DastarkhanAI/1.0",
    },
  })

  if (!response.ok) return null
  const data = await response.json()
  const address = data?.address || {}

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.state_district ||
    address.county ||
    "Lahore"
  const area =
    address.suburb ||
    address.neighbourhood ||
    address.city_district ||
    address.state_district ||
    ""

  return {
    city,
    area,
  }
}

function parseResults(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim()
  if (!cleaned) return []

  try {
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    const start = cleaned.indexOf("[")
    const end = cleaned.lastIndexOf("]")
    if (start === -1 || end === -1 || end <= start) return []
    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const cuisine = normalizeText(body.cuisine)
  const cityInput = normalizeText(body.city)
  const lat = typeof body.lat === "number" ? body.lat : undefined
  const lng = typeof body.lng === "number" ? body.lng : undefined

  const geo = await reverseGeocode(lat, lng)
  const location: LocationInfo = geo || { city: cityInput || "Lahore", area: "" }
  const locationLabel = buildLocationLabel(location)

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      results: [],
      location,
      message: "GEMINI_API_KEY missing.",
    })
  }

  const systemPrompt = `You are CuisineGPS, an AI for finding international cuisine restaurants in Pakistan.`
  const userPrompt = `User wants: ${cuisine} cuisine.
User location: ${locationLabel}.

Goal: find the nearest restaurants first. Start from the user's exact area. If you cannot find enough options in that area, expand to nearby neighborhoods, then the wider city. Keep results ordered from closest to farthest.

Rules:
- Use the user's area if available; otherwise use the city.
- Keep suggestions realistic for Pakistan.
- Rating should be between 3.8 and 4.9.
- Tip must be under 10 words.
- Provide a distance estimate in km (integer) from the user's location.
- Respond ONLY as JSON array in this format:
[
  {
    "name": "Restaurant Name",
    "area": "area in ${location.city}",
    "rating": 4.2,
    "specialty": "their best dish",
    "tip": "one insider tip",
    "distance_km": 3
  }
]
No extra text, no markdown.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
          response_mime_type: "application/json",
          response_schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                area: { type: "string" },
                rating: { type: "number" },
                specialty: { type: "string" },
                tip: { type: "string" },
                distance_km: { type: "integer" },
              },
              required: ["name", "area", "rating", "specialty", "tip", "distance_km"],
            },
          },
        },
      }),
    },
  )

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
  const results = parseResults(text)

  return NextResponse.json({ results, location })
}
