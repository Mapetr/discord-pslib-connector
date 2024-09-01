import {redirect} from "next/navigation";
import {
  OAuth2Routes,
  RESTPostOAuth2AccessTokenResult,
  RESTPostOAuth2AccessTokenURLEncodedData,
} from "discord-api-types/v10";
import {cookies} from "next/headers";
import {SESSION_COOKIE_NAME} from "@/lib/utils";
import {Student} from "@/lib/Student";
import {kv} from "@vercel/kv";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionId) return redirect("/");

  const url = new URL(request.url);
  const request_code = url.searchParams.get("code");
  if (!request_code) {
    return redirect("/");
  }

  const code_body: RESTPostOAuth2AccessTokenURLEncodedData = {
    client_id: process.env.DISCORD_ID ?? "",
    client_secret: process.env.DISCORD_SECRET ?? "",
    grant_type: "authorization_code",
    code: request_code,
    redirect_uri: `${url.origin}/discord`
  };

  const code: RESTPostOAuth2AccessTokenResult | null = await fetch(OAuth2Routes.tokenURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(code_body as Record<string, any>)
  }).then(async resp => {
    const json = await resp.json();
    if (resp.status !== 200) {
      console.error(json);
      return null;
    }
    return json;
  }).catch(err => {
    console.error(err);
    return null;
  });

  if (!code) {
    console.error("No response from getting code");
    return new Response("", {status: 500});
  }

  const session = await kv.get<Student>(sessionId.value).catch(err => {
    console.error(err);
    return null;
  });
  if (!session) {
    return new Response("", {status: 500});
  }


}
