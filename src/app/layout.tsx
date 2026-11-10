import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { PWASetup } from "@/components/PWASetup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "SchoolOS — The operating system for modern schools",
  description:
    "One beautifully animated platform for owners, principals, teachers, accountants, wardens and parents.",
};

export const viewport: Viewport = {
  themeColor: "#eef4ff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body><PWASetup />{children}</body>
    </html>
  );
}
