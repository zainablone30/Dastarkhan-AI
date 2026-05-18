import Link from "next/link"
import { ChefHat, ArrowLeft } from "lucide-react"

export const metadata = { title: "Refund Policy — DastarKhan" }

export default function RefundPolicyPage() {
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
          <span className="text-sm font-medium text-foreground">Refund Policy</span>
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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Refund Policy</h1>
        <p className="text-muted-foreground mb-2 text-sm">Last updated: May 18, 2026</p>
        <p className="text-muted-foreground mb-10 text-sm">
          We want every DastarKhan experience to be delicious. If something goes wrong, we are here to make it right.
        </p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-4">Refund Eligibility</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
                <h3 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ Eligible for Refund</h3>
                <ul className="space-y-1.5 text-sm text-green-700 dark:text-green-300">
                  <li>• Order never arrived after 90 minutes</li>
                  <li>• Wrong items delivered</li>
                  <li>• Food was spoiled or unsafe to eat</li>
                  <li>• Duplicate payment charged</li>
                  <li>• Order cancelled before chef accepted</li>
                  <li>• Chef cancelled your order</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
                <h3 className="font-bold text-red-700 dark:text-red-300 mb-2">❌ Not Eligible for Refund</h3>
                <ul className="space-y-1.5 text-sm text-red-700 dark:text-red-300">
                  <li>• Change of mind after order is confirmed</li>
                  <li>• Incorrect delivery address provided</li>
                  <li>• Order already delivered and accepted</li>
                  <li>• Minor taste or presentation preferences</li>
                  <li>• Delivery delays due to traffic or weather</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">How to Request a Refund</h2>
            <div className="space-y-3">
              {[
                { step: "1", title: "Contact Us Within 2 Hours", desc: "Report the issue within 2 hours of the expected delivery time. Email hello@dastarkhan.ai or use Live Chat with your Order ID." },
                { step: "2", title: "Provide Evidence", desc: "Share a photo of the issue (wrong item, damaged food) along with your order ID and a brief description of the problem." },
                { step: "3", title: "Review Process", desc: "Our team reviews your request within 24 hours. We may contact the chef for their account of events." },
                { step: "4", title: "Refund Issued", desc: "Approved refunds are credited back to your Easypaisa account within 3–5 business days." },
              ].map(item => (
                <div key={item.step} className="flex gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Cancellation Policy</h2>
            <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3 text-muted-foreground">
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="font-medium text-foreground">Before chef accepts</span>
                <span className="text-green-600 font-semibold">100% refund</span>
              </div>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="font-medium text-foreground">Within 5 min of chef accepting</span>
                <span className="text-green-600 font-semibold">100% refund</span>
              </div>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="font-medium text-foreground">After chef starts cooking</span>
                <span className="text-amber-600 font-semibold">50% refund</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">After out for delivery</span>
                <span className="text-red-500 font-semibold">No refund</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Refund Timeline</h2>
            <p className="text-muted-foreground leading-relaxed">
              Once approved, refunds are processed to your Easypaisa account within <strong className="text-foreground">3–5 business days</strong>.
              Refunds cannot be issued to a different account or payment method than the one used for the original purchase.
              If you have not received your refund after 7 days, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Contact Us</h2>
            <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-2 text-muted-foreground text-sm">
              <p>📧 <strong className="text-foreground">hello@dastarkhan.ai</strong></p>
              <p>📱 <strong className="text-foreground">+92 300 1234567</strong> (WhatsApp)</p>
              <p>🕐 Support hours: Mon–Sat, 9 AM – 9 PM PKT</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
