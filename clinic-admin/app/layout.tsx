import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConfigureAmplify } from "@/lib/config/ConfigureAmplify";
import { DevBfNavGuard } from "@/shared/ui/dev-bfnav-guard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DevBfNavGuard />
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
