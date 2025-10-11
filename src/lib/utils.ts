import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const oAuthProviders = ["google", "github"] as const;
export type OAuthProvider = (typeof oAuthProviders)[number];
