import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Versatile — Synthetic Data Platform",
  description: "Versatile: Enterprise high-performance synthetic data generation platform powered by Gemini AI, relational integrity, and differential privacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white selection:bg-cyan-500/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
