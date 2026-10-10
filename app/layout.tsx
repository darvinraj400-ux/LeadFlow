import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  weight: ["500", "600", "700"],
  variable: "--font-display-next",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  weight: ["400", "500"],
  variable: "--font-mono-next",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: (() => {
    const raw = process.env.APP_URL;
    if (!raw) return new URL('http://localhost:3000');
    try {
      return new URL(raw);
    } catch {
      return new URL(`https://${raw}`);
    }
  })(),
  title: {
    default: "Relay — Turn every inquiry into a qualified lead",
    template: "%s · Relay",
  },
  description:
    "Relay is a fictional CRM product that scores and routes inbound leads with AI-assisted qualification.",
  openGraph: {
    title: "Relay — Turn every inquiry into a qualified lead",
    description:
      "Relay qualifies, scores, and routes every inbound lead — so your team only sees the ones worth their time.",
    type: "website",
    url: "/",
    siteName: "Relay",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relay — Turn every inquiry into a qualified lead",
    description:
      "Relay qualifies, scores, and routes every inbound lead — so your team only sees the ones worth their time.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <noscript>
          <style>{'.reveal{opacity:1 !important;transform:none !important;visibility:visible !important;}'}</style>
        </noscript>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
