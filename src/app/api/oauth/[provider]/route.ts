import { OAuthProviderEnum } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/session";
import { OAuthProvider, oAuthProviders } from "@/lib/utils";
import { getOAuthClient } from "@/oauth/base";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const provider = z.enum(oAuthProviders).parse(rawProvider);

  if (typeof code !== "string" || typeof state !== "string") {
    return NextResponse.redirect(
      new URL(
        `/sign-in?oAuthError=${encodeURIComponent(
          "Failed to connect. Please try again."
        )}`,
        request.url
      )
    );
  }

  const oAuthClient = getOAuthClient(provider);

  try {
    const oAuthUser = await oAuthClient.fetchUser(code, state);
    const user = await connectUserToAccount(oAuthUser, provider);

    await createUserSession(user);
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      new URL(
        `/sign-in?oAuthError=${encodeURIComponent(
          "Failed to connect. Please try again."
        )}`,
        request.url
      )
    );
  }
}

function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider
) {
  return prisma.$transaction(async (trx) => {
    let user = await trx.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      const newUser = await trx.user.create({
        data: { email, name },
      });
      user = newUser;
    }

    const providerEnum =
      provider === "google"
        ? OAuthProviderEnum.GOOGLE
        : OAuthProviderEnum.GITHUB;

    await trx.oAuthAccount.upsert({
      where: {
        providerAccountId: id,
      },
      update: {},
      create: {
        userId: user.id,
        providerAccountId: id,
        provider: providerEnum,
      },
    });

    return user;
  });
}
