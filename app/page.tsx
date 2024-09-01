"use server"

import {cookies, headers} from "next/headers";
import {kv} from "@vercel/kv";
import {getDiscordLoginURL, getMicrosoftLoginURL} from "@/lib/urls";
import {Student} from "@/lib/Student";
import {SESSION_COOKIE_NAME} from "@/lib/utils";

export default async function Home() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);
  let session: Student | null = null;

  if (sessionId) {
    session = await kv.get<Student>(sessionId.value);
  }

  const headerList = headers();
  const url = new URL(headerList.get("x-current-path") ?? "http://localhost:3000");

  if (!session?.MicrosoftID) {
    const msURL= getMicrosoftLoginURL(url.origin);
    return (
      <main>
        <a href={msURL}>Login with Microsoft AD</a>
      </main>
    )
  }

  if (!session?.DiscordID) {
    const discordURL = getDiscordLoginURL(url.origin);
    return (
      <main>
        <a href={discordURL}>Login with Discord</a>
      </main>
    )
  }
}
