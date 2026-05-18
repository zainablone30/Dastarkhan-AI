import Link from "next/link"
import { ChefHat, ArrowLeft } from "lucide-react"

export const metadata = { title: "Cookie Policy — DastarKhan" }

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">DastarKhan</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Cookie Policy</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Cookie Policy</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: May 18, 2026</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files placed on your device by websites you visit. They are widely used
              to make websites work efficiently and to provide information to site owners. DastarKhan AI
              uses cookies and similar technologies (such as localStorage and sessionStorage) to enhance
              your experience on our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Cookies</h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground mb-1">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Required for the Platform to function. These include authentication tokens (Supabase session),
                  cart data stored in localStorage, and admin session keys. You cannot opt out of these.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground mb-1">Preference Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Remember your settings such as dark/light theme preference, selected language (Urdu/English),
                  and dismissed notifications. Stored in localStorage.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground mb-1">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Help us understand how users interact with our Platform — which features are used most,
                  where users drop off in the order flow, and overall performance metrics.
                  We do not use third-party analytics trackers.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground mb-1">AI Personalisation</h3>
                <p className="text-sm text-muted-foreground">
                  Store your food preferences, health conditions, and dietary restrictions locally to power
                  MediMenu AI and Smart Kitchen recommendations without requiring a server round-trip each time.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. localStorage vs Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              DastarKhan primarily uses browser localStorage (not traditional HTTP cookies) to store
              user preferences, cart items, and dismissed notifications. This data lives only in your
              browser and is never transmitted to third parties. You can clear it at any time via your
              browser settings → "Clear site data."
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Third-Party Cookies</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>
                <strong className="text-foreground">Supabase:</strong> Sets authentication cookies necessary
                for maintaining your login session
              </li>
              <li>
                <strong className="text-foreground">Cloudinary:</strong> May set cookies when serving
                video content on our homepage
              </li>
              <li>
                <strong className="text-foreground">Unsplash:</strong> May set cookies when loading
                chef and food images
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>View all cookies stored by a website</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all third-party cookies</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Note: Disabling essential cookies will break login and cart functionality on DastarKhan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Contact</h2>
            <p className="text-muted-foreground">
              Questions about our use of cookies? Email{" "}
              <strong className="text-foreground">hello@dastarkhan.ai</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
