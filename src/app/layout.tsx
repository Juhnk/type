import type { Metadata } from 'next';
import { inter, robotoMono } from '@/lib/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'TypeAmp - Typing Practice Game',
  description: 'Frictionless skill amplification through typing practice',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="container mx-auto flex-1 px-6 py-8">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
