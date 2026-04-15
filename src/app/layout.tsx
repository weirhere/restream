import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "@/components/ui/toast";
import { HintProvider } from "@/components/ui/hint";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans-runtime",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono-runtime",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Restream Playground",
  description:
    "A design-engineering prototype approximating the restream.io design language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-base text-fg-primary font-sans">
        <MotionConfig reducedMotion="user">
          <HintProvider>
            <ToastProvider>{children}</ToastProvider>
          </HintProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
