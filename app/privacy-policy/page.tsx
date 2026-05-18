import Link from "next/link"
import { ChefHat, ArrowLeft } from "lucide-react"

export const metadata = { title: "Privacy Policy — DastarKhan" }

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">DastarKhan</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Privacy Policy</span>
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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: May 18, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to DastarKhan AI ("we," "our," or "us"). We are Pakistan's first AI-powered food platform,
              connecting health-conscious customers with home chefs across Lahore, Karachi, and Islamabad.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
              you use our website and mobile application (collectively,  the "Platform").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Full name, email address, and phone number (provided at registration)</li>
                  <li>Delivery address and location data (GPS coordinates for order delivery)</li>
                  <li>Health profile data you voluntarily provide (medical conditions, dietary preferences)</li>
                  <li>Payment information — we store only the last 4 digits; full card details are processed by Easypaisa</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Automatically Collected Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Device type, browser, and operating system</li>
                  <li>IP address and approximate geographic location</li>
                  <li>Pages visited, time spent, and interaction data</li>
                  <li>Order history and food preference patterns used to train our AI recommendations</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed ml-2">
              <li>Process and deliver your food orders</li>
              <li>Power AI-driven meal recommendations through MediMenu, CuisineGPS, and Smart Kitchen</li>
              <li>Send order status notifications and service updates via SMS and in-app alerts</li>
              <li>Improve platform performance and personalise your experience</li>
              <li>Prevent fraud and ensure account security</li>
              <li>Comply with legal obligations under Pakistani law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Sharing Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal data. We may share it with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li><strong className="text-foreground">Home Chefs:</strong> Your first name and delivery area are shared with the chef fulfilling your order</li>
              <li><strong className="text-foreground">Payment Partners:</strong> Easypaisa receives transaction details necessary to process payments</li>
              <li><strong className="text-foreground">AI Services:</strong> Anonymised food preference data is sent to Gemini AI for recipe and meal suggestions</li>
              <li><strong className="text-foreground">Legal Authorities:</strong> When required by Pakistani law, court order, or government request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account data for as long as your account is active or as needed to provide services.
              Order history is retained for 3 years for legal and tax purposes. Health profile data is deleted
              immediately upon account deletion request. Location data from delivered orders is anonymised
              after 90 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information in your profile</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw consent for location tracking (this will limit delivery functionality)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise these rights, email us at <strong className="text-foreground">hello@dastarkhan.ai</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use Supabase with Row Level Security (RLS), HTTPS encryption, and industry-standard
              authentication practices. However, no digital transmission is 100% secure. We encourage
              you to use a strong password and not share your login credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related queries, contact our Data Protection Officer at:<br />
              <strong className="text-foreground">hello@dastarkhan.ai</strong><br />
              DastarKhan AI, Lahore, Pakistan
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
