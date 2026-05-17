import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/components/language-provider'
import { LanguageSelector } from '@/components/language-selector'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'DastarKhan AI | Pakistan\'s Intelligent Food Discovery Platform',
  description: 'AI-powered personalized meals crafted by home chefs, tailored to your health conditions, mood, and dietary needs. Experience Pakistan\'s first health-intelligent food delivery ecosystem.',
  keywords: ['food delivery', 'AI food', 'healthy meals', 'Pakistan', 'home chefs', 'personalized nutrition', 'health food'],
  authors: [{ name: 'DastarKhan AI' }],
  openGraph: {
    title: 'DastarKhan AI | Eat According to Your Mood & Health',
    description: 'AI-powered personalized meals crafted by home chefs, tailored to your health conditions, mood, and dietary needs.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#d97706',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system" enableSystem>
          <LanguageProvider>
            <LanguageSelector />
            {children}
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </body>
    </html>
  )
}
