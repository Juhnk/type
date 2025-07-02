import type { Metadata } from "next";
import { inter, robotoMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "TypeAmp - Typing Practice Game",
  description: "Frictionless skill amplification through typing practice",
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
        {children}
      </body>
    </html>
  );
}
