import { z } from "zod";
import { OAuthClient } from "./base";

export function createGoogleOAuthClient() {
  return new OAuthClient({
    provider: "google",
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    scopes: ["openid", "email", "profile"],
    urls: {
      auth: "https://accounts.google.com/o/oauth2/auth",
      token: "https://oauth2.googleapis.com/token",
      user: "https://openidconnect.googleapis.com/v1/userinfo",
    },
    userInfo: {
      schema: z.object({
        sub: z.string(),
        email: z.string().email(),
        name: z.string(),
        given_name: z.string().nullable(),
      }),
      parser: (user) => ({
        id: user.sub,
        email: user.email,
        name: user.name ?? "Unknown",
        given_name: user.given_name ?? "Unknown",
      }),
    },
  });
}
