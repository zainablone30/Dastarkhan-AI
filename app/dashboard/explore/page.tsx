"use client"

import { Suspense, useState, useEffect } from "react"
import { motion } from "motion/react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { FoodCard } from "@/components/dashboard/food-card"
import { PinguChef } from "@/components/pingu-chef"
import { Search, SlidersHorizontal, X, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

type FoodItem = {
  id: string
  name: string
  nameUrdu?: string
  restaurant: string
  restaurantArea?: string
  image: string
  price: number
  rating: number
  deliveryTime: string
  isSpicy?: boolean
  isVeg?: boolean
  isHomemade?: boolean
  aiRecommended?: boolean
  discount?: number
  category: string
  description?: string
  allergens?: string[]
}

function mapFood(f: any): FoodItem {
  return {
    id: f.id,
    name: f.name,
    nameUrdu: f.name_urdu || undefined,
    restaurant: f.restaurants?.name || "DastarKhan",
    restaurantArea: f.restaurants?.area || "",
    image: f.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
    price: f.price,
    rating: Number(f.rating),
    deliveryTime: f.delivery_time || "30-35 min",
    isSpicy: f.is_spicy,
    isVeg: f.is_veg,
    isHomemade: f.is_homemade,
    aiRecommended: f.is_ai_recommended,
    discount: f.discount || undefined,
    category: f.category || "Other",
    description: f.description || undefined,
    allergens: f.allergens || undefined,
  }
}

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Rating", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
]

function ExplorePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allFoods, setAllFoods] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<{ name: string; emoji: string }[]>([
    { name: "All", emoji: "🍽️" },
  ])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("recommended")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ veg: false, spicy: false, homemade: false, discount: false })

  const categoryEmojis: Record<string, string> = {
    Biryani: "🍛", BBQ: "🍖", Karahi: "🍜", Nihari: "🥘", Paratha: "🫓",
    Burger: "🍔", Pizza: "🍕", Daal: "🥣", Breakfast: "🍳", Other: "🍽️",
  }

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true)
      const { data } = await supabase
        .from("foods")
        .select("*, restaurants(name, area)")
        .order("rating", { ascending: false })

      if (data) {
        const mapped = data.map(mapFood)
        setAllFoods(mapped)

        // Build unique category list from real data
        const uniqueCats = [...new Set(mapped.map((f) => f.category).filter(Boolean))]
        setCategories([
          { name: "All", emoji: "🍽️" },
          ...uniqueCats.map((c) => ({ name: c, emoji: categoryEmojis[c] || "🍽️" })),
        ])
      }
      setLoading(false)
    }
    fetchFoods()
  }, [])

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const filteredFoods = allFoods
    .filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || food.category === selectedCategory
      const matchesFilters =
        (!filters.veg || food.isVeg) &&
        (!filters.spicy || food.isSpicy) &&
        (!filters.homemade || food.isHomemade) &&
        (!filters.discount || food.discount)
      return matchesSearch && matchesCategory && matchesFilters
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating
        case "price_asc": return a.price - b.price
        case "price_desc": return b.price - a.price
        default: return (b.aiRecommended ? 1 : 0) - (a.aiRecommended ? 1 : 0)
      }
    })

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <main className="lg:ml-72 min-h-screen p-6 pt-20 lg:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-foreground mb-1">Explore Khana</h1>
            <p className="text-muted-foreground">Dhundo apna favorite khana</p>
          </div>
          <PinguChef size="sm" showQuote={false} mood="happy" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search biryani, burger, restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-muted border-2 border-transparent focus:border-primary outline-none transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-colors ${showFilters ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-card rounded-2xl border border-border/50"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { key: "veg", label: "🥬 Veg Only" },
                { key: "spicy", label: "🌶️ Spicy" },
                { key: "homemade", label: "🏠 Homemade" },
                { key: "discount", label: "🏷️ Discounts" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key as keyof typeof filters]}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Sort By</p>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${sortBy === option.value ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedCategory === category.name ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}
            >
              <span>{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredFoods.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filteredFoods.length} items mili</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map((food, index) => (
                <motion.div key={food.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <FoodCard {...food} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <PinguChef size="lg" showQuote={false} mood="waiting" />
            <p className="mt-4 text-lg font-medium text-foreground">Kuch nahi mila! 😔</p>
            <p className="text-muted-foreground">Filters change karke dekho</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExplorePageInner />
    </Suspense>
  )
}
