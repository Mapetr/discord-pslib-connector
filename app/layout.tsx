import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
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
    <body className={cn("min-h-screen bg-background antialiased dark", inter.className)}>
    <main className={"max-w-fit pt-8 flex flex-col gap-6 mx-2 md:mx-auto text-center"}>
      {children}
    </main>
    </body>
    </html>
  );
}
