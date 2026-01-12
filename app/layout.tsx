import type { Metadata } from "next";
import { Geist, Amiri } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "PMSA Arts Fest 2025-26",
  description: "Simplicity, Clarity, and Spiritual Growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${amiri.variable} antialiased selection:bg-white selection:text-pmsa-blue`}>
        {children}
      </body>
    </html>
  );
}