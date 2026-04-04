import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../providers/WalletProvider";
import { QueryProvider } from "../providers/QueryProvider";

import { AuthProvider } from "../providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZEB | Premium Art Marketplace",
  description: "Secure, blockchain-powered digital art and collectibles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <WalletProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                {children}
              </div>
            </AuthProvider>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
