import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";

import { FloatingAiAssistant } from "@/components/chat/floating-ai-assistant";
import { FloatingChat } from "@/components/chat/floating-chat";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} bg-background text-foreground antialiased`}
      >
        <Script
          id="remove-extension-hydration-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const clean = () => {
                  document.querySelectorAll('[fdprocessedid]').forEach((element) => {
                    element.removeAttribute('fdprocessedid');
                  });
                };
                clean();
                new MutationObserver(clean).observe(document.documentElement, {
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['fdprocessedid']
                });
              })();
            `,
          }}
        />
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="bg-background flex-1">{children}</main>
            <Footer />
            <FloatingAiAssistant />
            <FloatingChat />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
