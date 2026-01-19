import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Popular on X - Most Shared Articles',
  description: 'Discover the most shared articles on Twitter/X in the last 24 hours. No algorithms, just popular content.',
  openGraph: {
    title: 'Popular on X',
    description: 'Most shared articles on Twitter/X',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Popular on X',
    description: 'Most shared articles on Twitter/X',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen">
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t-2 border-black mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <p className="text-meta text-muted">
              Data collected from public tweets. Updated hourly.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
