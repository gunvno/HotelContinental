import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingChat } from "@/components/chat/floating-chat";
import { AppProviders } from "@/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Continental Hotel",
    template: "%s | Continental Hotel",
  },
  description:
    "Khách sạn Continental chuẩn 5 sao với phòng suite sang trọng, tiện nghi spa cao cấp và dịch vụ concierge 24/7.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
    { color: "#fcfaf5" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} bg-background text-foreground antialiased`}
      >
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="bg-background flex-1">{children}</main>
            <Footer />
            <FloatingChat />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
