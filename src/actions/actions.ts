"use server";

import { getCurrentUser } from "@/lib/currentUser";
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from "@/lib/passwordHasher";
import { prisma } from "@/lib/prisma";
import {
  editingExpSchema,
  newExpenseSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/schemas";
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

  if (!success) return { error: "Sign up failed!" };

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

    if (!user) return { error: "Sign up failed!" };

    await createUserSession(user);
    return { success: true };
  } catch {
    return { error: "Sign up failed!" };
  }
}

export async function signIn(formData: z.infer<typeof signInSchema>) {
  const { success, data } = signInSchema.safeParse(formData);

  if (!success) return { error: "Sign in failed!" };

  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (user == null || user.password == null || user.salt == null) {
    return { error: "Sign in failed!" };
  }

  const isCorrectPassword = await verifyPassword({
    hashedPassword: user.password,
    password: data.password,
    salt: user.salt,
  });

  if (!isCorrectPassword) return { error: "Sign in failed!" };

  await createUserSession(user);
  await updateUserSessionExpiration();

  return { success: true, userId: user.id };
}

export async function signOut() {
  await removeUserFromSession();
  return { success: true };
}

export async function oAuthSignIn(provider: OAuthProvider) {
  const oAuthClient = getOAuthClient(provider);

  redirect(await oAuthClient.createAuthUrl());
}

export async function addExpense(formData: z.infer<typeof newExpenseSchema>) {
  const { success, data } = newExpenseSchema.safeParse(formData);

  if (!success) return { error: "Failed to add expense" };

  const user = await getCurrentUser({ redirectIfNotFound: true });

  const expense = await prisma.expense.create({
    data: {
      userId: user.id,
      amount: data.amount,
      date: data.date,
      description: data.description ?? "",
      category: data.category,
    },
  });

  if (!expense) return { error: "Failed to add expense" };
}

export async function editExpense(formData: z.infer<typeof editingExpSchema>) {
  const { success, data } = editingExpSchema.safeParse(formData);

  if (!success) return { error: "Failed to edit expense" };

  const expense = await prisma.expense.update({
    where: {
      id: data.id,
    },
    data: {
      amount: data.amount,
      date: data.date,
      description: data.description ?? "",
      category: data.category,
    },
  });

  if (!expense) return { error: "Failed to edit expense" };
}

export async function deleteExpense(expenseId: string) {
  const deletedExpense = await prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });

  if (!deletedExpense) return { error: "Failed to delete expense" };
}
