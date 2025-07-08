import type { Metadata } from 'next';
import { inter, robotoMono } from '@/lib/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EnhancedCommandPalette } from '@/components/core/EnhancedCommandPalette';
import { AuthModal } from '@/components/auth/AuthModal';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SettingsProvider } from '@/components/providers/SettingsProvider';
import { Toaster } from 'sonner';
import './globals.css';
import '@/styles/themes.css';

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
        <AuthProvider>
          <SettingsProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="container mx-auto flex-1 px-6 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <EnhancedCommandPalette />
            <AuthModal />
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
