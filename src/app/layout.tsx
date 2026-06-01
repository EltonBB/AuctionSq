import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AuctionSq | Premium Admin-Controlled Online Auctions",
    template: "%s | AuctionSq",
  },
  description: "AuctionSq is a trusted auction platform for verified products, transparent bidding, and clear delivery tracking.",
  metadataBase: new URL("https://auctionsq.com"),
  keywords: ["online auction", "ankande online", "albania auctions", "bid and win", "AuctionSq"],
  openGraph: {
    title: "AuctionSq | Premium Admin-Controlled Online Auctions",
    description: "Browse verified products, bid with confidence, and track every win from one clean platform.",
    url: "https://auctionsq.com",
    siteName: "AuctionSq",
    locale: "sq_AL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-foreground bg-background transition-colors duration-300 min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
