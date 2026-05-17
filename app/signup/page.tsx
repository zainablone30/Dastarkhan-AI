"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Utensils, Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PinguChef } from "@/components/pingu-chef"
import { supabase } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords match nahi ho rahe! Dobara check karo.")
      return
    }
    if (formData.password.length < 6) {
      setError("Password kam az kam 6 characters ka hona chahiye.")
      return
    }

    setIsLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
      },
    })

    setIsLoading(false)

    if (error) {
      setError(error.message === "User already registered"
        ? "Yeh email pehle se registered hai. Login karo."
        : error.message)
      return
    }

    if (data.user && !data.session) {
      setSuccess("Account ban gaya! Email confirm karo phir login karo.")
      return
    }

    router.replace("/dashboard/profile/setup")
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile/setup` },
    })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary" />
        <Image
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
          alt="Home chef cooking"
          fill
          className="object-cover mix-blend-overlay opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-4xl font-bold mb-4">Start Your Food Journey</h2>
              <p className="text-lg text-white/80">
                Discover AI-powered meals tailored to your mood and health from Lahore&apos;s finest restaurants
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Utensils className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">DastarKhan</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">AI</span>
            </div>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <PinguChef size="sm" showQuote={false} mood="celebrating" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Naya Account!</h1>
                <p className="text-muted-foreground">DastarKhan family mein aao</p>
              </div>
            </div>
          </motion.div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              ✅ {success}
            </div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-input rounded-xl focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-input rounded-xl focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password (min 6 chars)"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-input rounded-xl focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-input rounded-xl focus:border-primary focus:outline-none transition-colors bg-background text-foreground"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="w-4 h-4 rounded border-input text-primary mt-0.5" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <a href="#" className="text-primary hover:text-accent font-medium">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:text-accent font-medium">Privacy Policy</a>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-70 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <> Create Account <ArrowRight className="w-5 h-5" /> </>
              )}
            </motion.button>
          </motion.form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleSignup}
            disabled={isLoading}
            type="button"
            className="w-full py-4 border-2 border-input rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-semibold text-foreground flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </motion.button>

          <p className="text-center mt-8 text-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">Sign in here</Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Secure</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Easy</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Fast</span>
          </div>
        </div>
      </div>
    </div>
  )
}
