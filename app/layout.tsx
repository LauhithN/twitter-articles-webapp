import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/Sidebar';
import { BackgroundOrbs } from '@/components/BackgroundOrbs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const viewport: Viewport = {
  themeColor: '#0b0d10',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: "Viral Articles – Discover What's Trending on X",
  description:
    'Discover the most viral articles being shared on X (Twitter) right now. Updated hourly with engagement metrics, author insights, and trending topics.',
  metadataBase: new URL('https://viralarticles.app'),
  openGraph: {
    title: "Viral Articles – Discover What's Trending on X",
    description:
      'Discover the most viral articles being shared on X (Twitter) right now. Updated hourly with engagement metrics and trending topics.',
    url: 'https://viralarticles.app',
    siteName: 'Viral Articles',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Viral Articles – Discover What's Trending on X",
    description: 'Discover the most viral articles being shared on X right now. Updated hourly.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <BackgroundOrbs />
        <Sidebar />

        <main className="min-h-screen px-6 py-12 lg:pl-32 relative z-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
