"use server";

import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from "@/lib/passwordHasher";
import { prisma } from "@/lib/prisma";
import { expenseSchema, signInSchema, signUpSchema } from "@/lib/schemas";
import {
  createUserSession,
  removeUserFromSession,
  updateUserSessionExpiration,
} from "@/lib/session";
import { OAuthProvider } from "@/lib/utils";
import { getOAuthClient } from "@/oauth/base";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function signUp(formData: z.infer<typeof signUpSchema>) {
  const { success, data } = signUpSchema.safeParse(formData);

  if (!success) return { error: "Sign up failed" };

  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (existingUser) return { error: "Email already in use" };

  try {
    const salt = generateSalt();
    const hashedPassword = await hashPassword(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salt: salt,
      },
    });

    if (!user) return { error: "Sign up failed" };

    await createUserSession(user);
    return { success: true };
  } catch {
    return { error: "Sign up failed" };
  }
}

export async function signIn(formData: z.infer<typeof signInSchema>) {
  const { success, data } = signInSchema.safeParse(formData);

  if (!success) return { error: "Sign in failed" };

  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (user == null || user.password == null || user.salt == null) {
    return { error: "Sign in failed" };
  }

  const isCorrectPassword = await verifyPassword({
    hashedPassword: user.password,
    password: data.password,
    salt: user.salt,
  });

  if (!isCorrectPassword) return { error: "Sign in failed" };

  await createUserSession(user);
  await updateUserSessionExpiration();

  return { success: true };
}

export async function signOut() {
  await removeUserFromSession();
  return { success: true };
}

export async function oAuthSignIn(provider: OAuthProvider) {
  const oAuthClient = getOAuthClient(provider);

  redirect(await oAuthClient.createAuthUrl());
}

export async function addExpense(data: z.infer<typeof expenseSchema>) {
  await prisma.expense.create({
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description ?? "",
      category: data.category,
    },
  });
}
