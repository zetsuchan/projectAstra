import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { MobileNav } from '@/components/layout/nav-bar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Astra | Cosmic Companion',
  description: 'AI astrologer that remembers your history.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden selection:bg-[var(--rose-900)] selection:text-white">
        <div className="grain" />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
