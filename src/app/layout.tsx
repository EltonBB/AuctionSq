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
    default: "AuctionSq | Ankande te kontrolluara online",
    template: "%s | AuctionSq",
  },
  description: "AuctionSq eshte platforme ankandesh per produkte te kontrolluara, ofertim transparent dhe dergese te qarte.",
  metadataBase: new URL("https://auctionsq.com"),
  keywords: ["online auction", "ankande online", "albania auctions", "bid and win", "AuctionSq"],
  openGraph: {
    title: "AuctionSq | Ankande te kontrolluara online",
    description: "Shfleto produkte te verifikuara, oferto me siguri dhe ndiq Cdo fitore nga nje platforme e paster.",
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
    <html lang="sq" className="scroll-smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-foreground bg-background transition-colors duration-300 min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}

