import {redirect} from "next/navigation";
import {getClassName, Student} from "@/lib/Student";
import {randomUUID} from "node:crypto";
import {kv} from "@vercel/kv";
import {cookies} from "next/headers";
import {SESSION_COOKIE_NAME} from "@/lib/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return redirect("/");

  const tenant = process.env.MSAL_TENANT_ID;
  if (!tenant) {
    console.error("Missing MSAL_TENANT_ID");
    return redirect("/");
  }

  const client_id = process.env.MSAL_CLIENT_ID;
  if (!client_id) {
    console.error("Missing MSAL_CLIENT_ID");
    return redirect("/");
  }

  const client_secret = process.env.MSAL_CLIENT_SECRET;
  if (!client_secret) {
    console.error("Missing MSAL_CLIENT_SECRET");
    return redirect("/");
  }

  const request_body = {
    client_id: client_id,
    scope: "user.read",
    code: code,
    redirect_uri: `${url.origin}/msal`,
    grant_type: "authorization_code",
    client_secret: client_secret
  };

  const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(request_body)
  }).then(async resp => {
    if (resp.status !== 200) return null;
    return await resp.json()
  }).catch(err => {
    console.error(err);
    return null;
  });
  if (!resp) return redirect("/");

  const profile = await fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,department,jobTitle", {
    headers: {
      Authorization: `${resp.token_type} ${resp.access_token}`
    }
  }).then(async resp => {
    if (resp.status !== 200) return null;
    return await resp.json();
  }).catch(err => {
    console.error(err);
    return null;
  });
  if (!profile) return redirect("/");

  const name = profile.displayName.split(" ");
  name.pop();

  const student: Student = {
    MicrosoftID: profile.id,
    DiscordID: "",
    Class: getClassName(profile.department),
    Name: name.join(" ")
  }

  const id = randomUUID();
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: id,
    httpOnly: true,
    path: "/",
    expires: Date.now() + 24 * 60 * 60 * 1000
  });
  await kv.set(id, student, {ex: 86400}).catch(err => {
    console.error(err);
  });

  return redirect("/");
}
