import type { Metadata } from "next";
import { Geist, Amiri } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure the local font with your specific file and variable name
const stapelBold = localFont({
  src: "./fonts/stapel-bold.ttf", // Updated filename
  variable: "--font-bold-font",
  // weight: "700",
});
const stapelRegular = localFont({
  src: "./fonts/stapel-regular.ttf", 
  variable: "--font-regular-font",
  // weight: "400",
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
      <body
        className={`${geistSans.variable} ${amiri.variable} ${stapelBold.variable} ${stapelRegular.variable} antialiased selection:bg-white selection:text-pmsa-blue`}
      >
        {children}
      </body>
    </html>
  );
}