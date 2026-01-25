import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { BackToTop } from '@/components/BackToTop';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'Viral Articles on X',
  description: 'Discover the most viral articles shared on X in the last 7 days.',
  openGraph: {
    title: 'Viral Articles on X',
    description: 'Most shared articles on Twitter/X - updated hourly',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viral Articles on X',
    description: 'Most shared articles on Twitter/X - updated hourly',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen bg-background text-text-primary">
        <main className="relative-z max-w-5xl mx-auto px-6 py-8">{children}</main>

        <footer className="relative-z border-t border-border-subtle mt-16">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-meta text-text-muted">
                Data collected from public posts on X. Updated hourly.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-meta text-text-muted hover:text-accent transition-colors"
                >
                  View on X
                </a>
              </div>
            </div>
          </div>
        </footer>

        <BackToTop />
      </body>
    </html>
  );
}
