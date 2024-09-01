import {redirect} from "next/navigation";
import {
  APIRole,
  OAuth2Routes,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildRolesResult,
  RESTGetAPIUserResult, RESTPatchAPIGuildMemberJSONBody,
  RESTPostOAuth2AccessTokenResult,
  RESTPostOAuth2AccessTokenURLEncodedData,
  RESTPutAPIGuildMemberJSONBody, RouteBases,
  Routes,
} from "discord-api-types/v10";
import {cookies} from "next/headers";
import {SESSION_COOKIE_NAME} from "@/lib/utils";
import {Student} from "@/lib/Student";
import {kv} from "@vercel/kv";
import {getDiscordLoginURL} from "@/lib/urls";

export async function GET(request: Request) {
  const session = cookies().get(SESSION_COOKIE_NAME);
  if (!session) return redirect("/");
  const sessionId = session.value;

  const url = new URL(request.url);
  const request_code = url.searchParams.get("code");
  if (!request_code) {
    return redirect("/");
  }

  // Checking existence of env values
  const guild_id = process.env.DISCORD_GUILD_ID;
  if (!guild_id) {
    console.error(sessionId, "Missing DISCORD_GUILD_ID");
    return end("Missing data in app. Contact admin", true)
  }
  const verified_id = process.env.DISCORD_VERIFIED_ID;
  if (!verified_id) {
    console.error(sessionId, "Missing DISCORD_VERIFIED_ID");
    return end("Missing data in app. Contact admin", true)
  }
  const member_id = process.env.DISCORD_MEMBER_ID;
  if (!member_id) {
    console.error(sessionId, "Missing DISCORD_MEMBER_ID");
    return end("Missing data in app. Contact admin", true)
  }
  const client_id = process.env.DISCORD_CLIENT_ID;
  if (!client_id) {
    console.error(sessionId, "Missing DISCORD_CLIENT_ID");
    return end("Missing data in app. Contact admin", true)
  }
  const client_secret = process.env.DISCORD_SECRET;
  if (!client_secret) {
    console.error(sessionId, "Missing DISCORD_SECRET");
    return end("Missing data in app. Contact admin", true)
  }
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error(sessionId, "Missing DISCORD_TOKEN");
    return end("Missing data in app. Contact admin", true)
  }

  // Getting the access token for the user
  const code_body: RESTPostOAuth2AccessTokenURLEncodedData = {
    client_id: client_id,
    client_secret: client_secret,
    grant_type: "authorization_code",
    code: request_code,
    redirect_uri: `${url.origin}/discord`
  };
  const code: RESTPostOAuth2AccessTokenResult = await fetch(OAuth2Routes.tokenURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(code_body as Record<string, any>)
  }).then(async resp => {
    const json = await resp.json();
    if (resp.status !== 200) {
      console.error(sessionId, json);
      return end("Something went wrong. Try again later", true)
    }
    return json;
  }).catch(err => {
    console.error(sessionId, err);
    return end("Something went wrong. Try again later", true)
  });

  // Getting session data from KV database
  const student = await kv.get<Student>(sessionId).catch(err => {
    console.error(sessionId, err);
    return end("Something went wrong. Try again later", true)
  });
  if (!student) {
    cookies().delete(SESSION_COOKIE_NAME);
    return end("Couldn't get your data. Try again", true);
  }

  // Get info about user
  const user: RESTGetAPIUserResult = await fetch(RouteBases.api + Routes.user(), {
    method: "GET",
    headers: {
      Authorization: `${code.token_type} ${code.access_token}`
    }
  }).then(async resp => {
    const json = await resp.json();
    if (resp.status !== 200) {
      console.error(sessionId, json);
      return end("Couldn't get your user data from discord.", true);
    }
    return json;
  }).catch(err => {
    console.error(sessionId, err);
    return end("Something went wrong. Try again later", true)
  });
  student.DiscordID = user.id;

  // Setup for bot requests
  const api_headers = {
    Authorization: `Bot ${token}`,
    "User-Agent": `DiscordBot (${url.origin}, 1.0.0})`,
    "Content-Type": "application/json"
  }

  // Check if user is not verified
  const member = await fetch(RouteBases.api + Routes.guildMember(guild_id, user.id), {
    method: "GET",
    headers: api_headers
  }).then(async resp => {
    if (resp.status === 404) return null;
    return await resp.json() as RESTGetAPIGuildMemberResult;
  }).catch(err => {
    console.error(sessionId, err);
    return end("Something went wrong. Try again later", true)
  });
  if (member && member.roles.includes(verified_id)) return end("Already assigned", false);

  // Get guilds roles
  const guild_roles: RESTGetAPIGuildRolesResult = await fetch(RouteBases.api + Routes.guildRoles(guild_id), {
    method: "GET",
    headers: api_headers
  }).then(async resp => {
    return await resp.json();
  }).catch(err => {
    console.error(sessionId, err);
    return end("Something went wrong. Try again later", true)
  });
  if (!guild_roles) return end("Couldn't get data from Discord. Try again later", true)

  // Find the one for the class
  const class_role = guild_roles.find(value => value.name === student.Class);
  if (!class_role) {
    // TODO: Add the role if it doesnt exist
    console.error("Role for the class doesnt exist", student, guild_roles);
    return end("Couldn't set the role for you. Contant admin", true);
  }

  if (!member) {
    const params: RESTPutAPIGuildMemberJSONBody = {
      access_token: code.access_token,
      roles: [class_role.id, verified_id, member_id]
    }

    const result = await fetch(RouteBases.api + Routes.guildMember(guild_id, user.id), {
      method: "PUT",
      headers: api_headers,
      body: JSON.stringify(params)
    }).catch(err => {
      console.error(sessionId, err);
      return end("Something went wrong. Try again later", true)
    });
    if (!result) return new Response("", {status: 500});

    return end("Success", false);
  }

  const regexp = new RegExp("^[PESOTL][1-4][ABCT]?$");

  // Merge the arrays
  const roles: APIRole[] = member.roles.map(t1 => ({id: t1, ...guild_roles.find(t2 => t2.id === t1)}) as APIRole)
  roles.forEach((result, index) => {
    if (regexp.test(result.name)) {
      roles.splice(index, 1);
    }
  });
  const merged = roles.map(role => role.id);

  merged.push(verified_id);
  merged.push(class_role.id);
  if (!merged.includes(member_id)) merged.push(member_id);

  const params: RESTPatchAPIGuildMemberJSONBody = {
    roles: merged
  }
  await fetch(RouteBases.api + Routes.guildMember(guild_id, user.id), {
    method: "PATCH",
    headers: api_headers,
    body: JSON.stringify(params)
  }).then(async resp => {
    if (resp.status !== 200) {
      console.error(sessionId, await resp.json());
      return end("Couldn't add the roles. Contact admin", true);
    }
    return resp;
  }).catch(err => {
    console.error(err);
    return end("Something went wrong. Try again later", true)
  });

  return end("Success", false);
}

// TODO: Come up with a better solution
function end(message: string, error: boolean) {
  cookies().set({
    name: "result",
    value: JSON.stringify({
      error: error,
      result: message
    })
  });
  redirect("/");
}
