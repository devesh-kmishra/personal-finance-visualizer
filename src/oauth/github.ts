import { z } from "zod";
import { OAuthClient } from "./base";

export function createGitHubOAuthClient() {
  return new OAuthClient({
    provider: "github",
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    scopes: ["read:user", "user:email"],
    urls: {
      auth: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      user: "https://api.github.com/user",
    },
    userInfo: {
      schema: z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string().nullable(),
        login: z.string(),
      }),
      parser: (user) => ({
        id: user.id.toString(),
        email: user.email,
        name: user.name ?? "Unknown",
        login: user.login,
      }),
    },
  });
}
