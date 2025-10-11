import { cache } from "react";
import { getUserFromSession } from "./session";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

type User = Exclude<
  Awaited<ReturnType<typeof getUserFromDb>>,
  undefined | null
>;

function _getCurrentUser(options: { redirectIfNotFound: true }): Promise<User>;
function _getCurrentUser(options?: {
  redirectIfNotFound?: false;
}): Promise<User | null>;

async function _getCurrentUser({ redirectIfNotFound = false } = {}) {
  const user = await getUserFromSession();

  if (user == null) {
    if (redirectIfNotFound) redirect("/sign-in");
    return null;
  }

  const fullUser = await getUserFromDb(user.id);

  // This should never happen
  if (fullUser == null) throw new Error("User not found in database");

  return fullUser;
}

export const getCurrentUser = cache(_getCurrentUser);

function getUserFromDb(id: string) {
  return prisma.user.findFirst({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}
