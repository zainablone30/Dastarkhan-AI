import Link from "next/link"
import { ChefHat, ArrowLeft } from "lucide-react"

export const metadata = { title: "Terms of Service — DastarKhan" }

export default function TermsOfServicePage() {
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
          <span className="text-sm font-medium text-foreground">Terms of Service</span>
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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: May 18, 2026</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using DastarKhan AI ("Platform"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Platform. These terms apply to all visitors,
              customers, home chefs, and any other users of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Services Provided</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              DastarKhan AI provides an online marketplace connecting customers with registered home chefs.
              Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>AI-powered meal recommendations (MediMenu, CuisineGPS, Taste of Pakistan, Smart Kitchen)</li>
              <li>Online food ordering and delivery coordination</li>
              <li>DastarkhanGPT — conversational AI for food and health queries</li>
              <li>Home chef registration and profile management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>You must be at least 16 years old to create an account</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You must provide accurate and truthful information during registration</li>
              <li>One account per person — duplicate accounts may be terminated</li>
              <li>You are responsible for all activity that occurs under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Ordering & Payment</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Orders are placed through our Platform and payment is processed via Easypaisa.
                Your order is confirmed only after payment verification by our team.
              </p>
              <p>
                Prices displayed include GST where applicable. Delivery fees are calculated
                based on your distance from the chef's location. DastarKhan reserves the right
                to change prices without prior notice.
              </p>
              <p>
                In case of payment failure, your order will not be processed. Contact support
                at <strong className="text-foreground">hello@dastarkhan.ai</strong> for assistance.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Home Chef Terms</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>Chefs must maintain a clean, hygienic kitchen that meets local health standards</li>
              <li>Chefs are responsible for the quality, accuracy, and safety of food they prepare</li>
              <li>DastarKhan takes a 15% commission on each completed order</li>
              <li>Chefs must fulfil accepted orders within the agreed timeframe</li>
              <li>We reserve the right to suspend chef accounts with poor ratings (below 3.0)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Health Information Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              MediMenu AI and health-related meal recommendations are for informational purposes only and
              do not constitute medical advice. Always consult a qualified healthcare professional before
              making significant dietary changes, especially if you have a medical condition.
              DastarKhan is not liable for any health outcomes resulting from following AI-generated
              meal suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Prohibited Activities</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>Placing fraudulent, false, or test orders</li>
              <li>Harassing or abusing chefs, delivery partners, or support staff</li>
              <li>Using the Platform to distribute spam or illegal content</li>
              <li>Attempting to reverse-engineer or scrape our AI systems</li>
              <li>Creating accounts with false identity information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              DastarKhan AI shall not be liable for any indirect, incidental, or consequential damages
              arising from the use of our Platform, including but not limited to food quality issues,
              delivery delays, or AI recommendation outcomes. Our maximum liability shall not exceed
              the amount paid for the specific order in dispute.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the Islamic Republic of Pakistan.
              Any disputes shall be resolved in the courts of Lahore, Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Contact</h2>
            <p className="text-muted-foreground">
              Questions about these terms? Contact us at{" "}
              <strong className="text-foreground">hello@dastarkhan.ai</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
