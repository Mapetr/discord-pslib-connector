import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "SPS Discord Login",
  description: "Login with Microsoft account to Discord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased dark", inter.className)}>
      {children}
      </body>
    </html>
  );
}
