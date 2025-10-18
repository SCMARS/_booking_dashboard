import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import LayoutContent from './components/LayoutContent';
import { LanguageProvider } from './contexts/LanguageContext';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BMP Book My Place - AI Restaurant Assistant",
  description: "Smart reservation system with voice AI that handles table bookings, takes orders, and provides exceptional customer service 24/7. Riley - your AI assistant for restaurants.",
  keywords: "BMP, Book My Place, AI, restaurant, table booking, voice assistant, Vapi AI, restaurant management, Riley, reservations",
  openGraph: {
    title: "BMP Book My Place - AI Restaurant Assistant",
    description: "Smart reservation system with voice AI for restaurants",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
