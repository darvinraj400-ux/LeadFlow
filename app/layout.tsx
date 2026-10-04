import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
