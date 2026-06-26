import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepSeek App Studio — AI Kod Üretici",
  description:
    "DeepSeek API ile kurumsal standartlarda AI kod üretim stüdyosu. TOGAF, ISO 27001, SOC 2, GDPR uyumlu. Çoklu model (deepseek-chat, reasoner, V4 Pro, V4 Flash).",
  keywords: [
    "DeepSeek",
    "AI Code Generator",
    "TOGAF",
    "ISO 27001",
    "SOC 2",
    "GDPR",
    "Enterprise Architecture",
    "ReAct Agent",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "DeepSeek Studio",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#007acc",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="dark" data-theme="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Service worker cache'i temizle
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(regs => {
                  regs.forEach(r => r.unregister());
                });
                caches.keys().then(keys => {
                  keys.forEach(k => caches.delete(k));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
