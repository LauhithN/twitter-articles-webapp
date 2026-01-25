import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/Sidebar';
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
  title: 'Viral Articles',
  description: 'Most shared articles on X, updated hourly',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Sidebar />

        <main className="min-h-screen px-6 py-12 lg:pl-32">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
