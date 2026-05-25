import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SandboxBanner from "@/app/components/SandboxBanner";
import { getSimulatedUserRole, isSupabaseConnected } from "@/lib/db";

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
    default: "Oferto | Premium Admin-Controlled Online Auctions",
    template: "%s | Oferto Auctions",
  },
  description: "Oferto. Garo. Fito. Bid on authentic, verified products in secure, admin-controlled online auctions. Authentic items, transparent bidding, and fast delivery.",
  metadataBase: new URL("https://oferto.com"),
  keywords: ["online auction", "ankande online", "albania auctions", "bid and win", "oferto", "garo fito"],
  openGraph: {
    title: "Oferto | Premium Admin-Controlled Online Auctions",
    description: "Bid on authentic, verified products in secure, admin-controlled online auctions.",
    url: "https://oferto.com",
    siteName: "Oferto Auctions",
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
  const currentRole = await getSimulatedUserRole();
  const isProdDbConnected = isSupabaseConnected();

  return (
    <html lang="en" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-foreground bg-background transition-colors duration-300 min-h-screen flex flex-col`}
      >
        <SandboxBanner currentRole={currentRole} isProdDbConnected={isProdDbConnected} />
        {children}
      </body>
    </html>
  );
}
