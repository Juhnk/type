import { Inter, Roboto_Mono } from 'next/font/google';

// UI Font - Inter for general interface
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Typing Text Font - Roboto Mono for typing practice
export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});
