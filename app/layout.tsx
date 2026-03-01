import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AgencyProvider } from "@/context/AgencyContext";
import { FetchProvider } from "@/context/FetchContext";
import { SearchProvider } from "@/context/SearchContext";
import { TrackingProvider } from "@/context/TrackingContext";
import { Provider } from "@/components/ui/provider";
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
  title: "岡山バス位置情報NEXT",
  description:
    "Bus-Visionオープンデータを利用したバス位置情報表示アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <Provider>
            <AgencyProvider>
              <FetchProvider>
                <TrackingProvider>
                  <SearchProvider>
                    <Toaster />
                    {children}
                  </SearchProvider>
                </TrackingProvider>
              </FetchProvider>
            </AgencyProvider>
          </Provider>
        </Suspense>
      </body>
    </html>
  );
}
