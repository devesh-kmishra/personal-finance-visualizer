import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/", "/transactions", "/charts"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const sessionId = req.cookies.get("session-id")?.value;

    if (!sessionId) {
      const loginUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/transactions/:path*", "/charts/:path*"],
};
