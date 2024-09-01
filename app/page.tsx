"use server"

import {cookies, headers} from "next/headers";
import {kv} from "@vercel/kv";
import {getDiscordLoginURL, getMicrosoftLoginURL} from "@/lib/urls";
import {Student} from "@/lib/Student";
import {SESSION_COOKIE_NAME} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);
  let session: Student | null = null;

  if (sessionId) {
    session = await kv.get<Student>(sessionId.value);
  }

  const {result, error} = JSON.parse(cookieStore.get("result")?.value ?? "{}");

  const headerList = headers();
  const url = new URL(headerList.get("x-current-path") ?? "http://localhost:3000");

  if (!session?.MicrosoftID) {
    const msURL= getMicrosoftLoginURL(url.origin);
    return (
      <>
        {result ? <p>{result}</p> : <></>}
        <Button className={""} asChild>
          <Link href={msURL}>Login with Microsoft</Link>
        </Button>
      </>
    )
  }

  if (!session?.DiscordID) {
    const discordURL = getDiscordLoginURL(url.origin);
    return (
      <>
        {result ? <p>{result}</p> : <></>}
        <Button className={"max-w-fit"} asChild>
          <Link href={discordURL}>Login with Discord</Link>
        </Button>
      </>
    )
  }

  return (
    <>
      <p>{result ?? "All done"}</p>
    </>
  )
}
