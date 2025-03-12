import { serialize } from "cookie";

const CLIENT_ID = process.env.EVE_CLIENT_ID!;
const CLIENT_SECRET = process.env.EVE_CLIENT_SECRET!;
const CALLBACK_URL = process.env.EVE_CALLBACK_URL!;
const TOKEN_URL = "https://login.eveonline.com/v2/oauth/token";
const EVE_AUTH_URL = "https://login.eveonline.com/v2/oauth/authorize";


export function getEveAuthUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: CALLBACK_URL,
    client_id: CLIENT_ID,
    scope: "publicData esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1", // Добавил нужный scope
    state: Math.random().toString(36).substring(7), // CSRF защита
  });

  return `${EVE_AUTH_URL}/?${params.toString()}`;
}

export async function getEveToken(code: string) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch EVE token");
  }

  return response.json();
}

export function setAuthCookie(token: string) {
  return serialize("eve_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 день
  });
}

