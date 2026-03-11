import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RevFlo — Product Intelligence System",
  description: "AI that analyzes your product signals and decides what you should build next.",
  keywords: ["product management", "AI", "roadmap", "product analytics"],
};

import { PostHogProvider } from "@/components/providers/PostHogProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={`${inter.className} bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
