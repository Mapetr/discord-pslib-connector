"use client"

import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();

  const oauth = process.env.NEXT_PUBLIC_DISCORD_OAUTH_URL;
  if (!oauth) {
    console.error("Discord OAuth URL not found");
    return;
  }

  return (
    <main>
      <Button onClick={() => router.push(oauth)}>Login with Discord</Button>
    </main>
  );
}
