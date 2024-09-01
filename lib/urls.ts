import {OAuth2Routes} from "discord-api-types/v10";

export function getMicrosoftLoginURL(origin: string): string {
  const tenant = process.env.MSAL_TENANT_ID ?? "";
  const client_id = process.env.MSAL_CLIENT_ID ?? "";
  if (!tenant) console.error("Missing MSAL_TENANT_ID");
  if (!client_id) console.error("Missing MSAL_CLIENT_ID");
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(origin)}%2Fmsal&scope=user.read`;
}

export function getDiscordLoginURL(origin: string): string {
  const client_id = process.env.DISCORD_CLIENT_ID ?? "";
  if (!client_id) console.error("Missing DISCORD_CLIENT_ID");
  return `https://discord.com/oauth2/authorize?response_type=code&client_id=${client_id}&scope=identify%20guilds.join&redirect_uri=${encodeURIComponent(origin)}%2Fdiscord&prompt=consent`
}
