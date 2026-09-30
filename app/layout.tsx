import type { Metadata } from "next";
import { Geist, Amiri, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const MontserratSans = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const stapelBold = localFont({
  src: "./fonts/stapel-bold.ttf",
  variable: "--font-bold-font",
});
const stapelRegular = localFont({
  src: "./fonts/stapel-regular.ttf",
  variable: "--font-regular-font",
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "AAWA - PMSA Arts Fest 26-27",
  description: "When Values Speak • AAWA '26 PMSA Arts Fest 26-27",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${MontserratSans.variable} ${amiri.variable} ${stapelBold.variable} ${stapelRegular.variable} antialiased selection:bg-[#caa02f] selection:text-[#0b0904]`}
      >
        {children}
      </body>
    </html>
  );
}
