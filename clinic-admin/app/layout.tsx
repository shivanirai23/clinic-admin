import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfigureAmplify } from "@/lib/config/ConfigureAmplify";
import { DevBfNavGuard } from "@/shared/ui/dev-bfnav-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HIKIGAI Clinic Admin",
  description: "Manage clinics, staff, and operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DevBfNavGuard />
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
