import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const oAuthProviders = ["google", "github"] as const;
export type OAuthProvider = (typeof oAuthProviders)[number];

export const expenseCategories = [
  { label: "Food & Drinks", value: "fd" },
  { label: "Entertainment", value: "en" },
  { label: "Utilities", value: "ut" },
  { label: "Home", value: "hm" },
  { label: "Life", value: "lf" },
  { label: "Transportation", value: "tp" },
  { label: "Others", value: "ot" },
] as const;

export function formatExpenseDate(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatExpenseCategory(category: string) {
  const foundCategory = expenseCategories.find((cat) => cat.value === category);
  return foundCategory ? foundCategory.label : "Unknown";
}
