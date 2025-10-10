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
  title: "AI Restaurant Assistant - Революция в сфере общественного питания",
  description: "Умная система бронирования с голосовым AI, которая принимает заказы столиков, обрабатывает заказы и обеспечивает исключительное обслуживание клиентов 24/7. Riley - ваш AI-ассистент для ресторана.",
  keywords: "AI, искусственный интеллект, ресторан, бронирование столиков, голосовой ассистент, Vapi AI, управление рестораном, Riley",
  openGraph: {
    title: "AI Restaurant Assistant - Революция в сфере общественного питания",
    description: "Умная система бронирования с голосовым AI для ресторанов",
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
