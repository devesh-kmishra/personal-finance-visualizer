import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redisClient } from "./redis/redis";
import { sessionSchema } from "./lib/session";

const SESSION_COOKIE = "session-id";
const publicRoutes = ["/sign-in", "/sign-up"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionId && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionId) {
    const rawUser: string | null = await redisClient.get(
      `session:${sessionId}`
    );

    if (!rawUser) {
      const res = NextResponse.redirect(new URL("/sign-in", req.url));
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }

    const { success, data: user } = sessionSchema.safeParse(rawUser);

    if (success) {
      if (pathname === "/" || publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(`/${user.id}`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up"],
};
