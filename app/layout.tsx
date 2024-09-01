import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import {cookies} from "next/headers";

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
  const {result, error} = JSON.parse(cookies().get("result")?.value ?? "{}");

  return (
    <html lang="en">
    <head>
      <meta name="darkreader-lock"/>
    </head>
    <body className={cn("min-h-screen bg-background antialiased dark", inter.className)}>
    <main className={"max-w-[77ch] pt-8 flex flex-col gap-6 mx-auto items-center text-center"}>
      <p>Welcome to the unofficial role management app for SPŠ and VOŠ students! Sign in with your Microsoft school account and Discord to automatically receive your class role along with the &#34;Verified&#34; role. This system makes it easier to organize and communicate among students on our Discord server. Click the button below to sign in and get your roles!</p>
      <hr className={"w-full"} />
      {children}
      {result ? <p>{result}</p> : <></>}
      <Analytics />
      <SpeedInsights />
    </main>
    </body>
    </html>
  );
}
