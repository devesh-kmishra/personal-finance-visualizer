import { z } from "zod";
import crypto from "crypto";
import { redisClient } from "@/redis/redis";
import { cookies } from "next/headers";

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = "session-id";

export const sessionSchema = z.object({
  id: z.string(),
});

type UserSession = z.infer<typeof sessionSchema>;

export async function getUserFromSession() {
  const sessionId = (await cookies()).get(COOKIE_SESSION_KEY)?.value;

  if (!sessionId) return null;

  return getUserSessionById(sessionId);
}

export async function createUserSession(user: UserSession) {
  const sessionId = crypto.randomBytes(32).toString("hex").normalize();

  await redisClient.set(
    `session:${sessionId}`,
    JSON.stringify(sessionSchema.parse(user)),
    {
      ex: SESSION_EXPIRATION_SECONDS,
    }
  );

  (await cookies()).set({
    name: COOKIE_SESSION_KEY,
    value: sessionId,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_EXPIRATION_SECONDS,
  });
}

export async function updateUserSessionExpiration() {
  const sessionId = (await cookies()).get(COOKIE_SESSION_KEY)?.value;

  if (!sessionId) return null;

  const user = await getUserSessionById(sessionId);

  if (!user) return null;

  redisClient.set(`session:${sessionId}`, JSON.stringify(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  (await cookies()).set({
    name: COOKIE_SESSION_KEY,
    value: sessionId,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_EXPIRATION_SECONDS,
  });
}

export async function removeUserFromSession() {
  const sessionId = (await cookies()).get(COOKIE_SESSION_KEY)?.value;

  if (!sessionId) return null;

  await redisClient.del(`session:${sessionId}`);
  (await cookies()).delete(COOKIE_SESSION_KEY);
}

async function getUserSessionById(sessionId: string) {
  const rawUser: string | null = await redisClient.get(`session:${sessionId}`);

  const { success, data: user } = sessionSchema.safeParse(rawUser);

  return success ? user : null;
}
