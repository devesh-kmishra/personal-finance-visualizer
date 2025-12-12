import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const newExpenseSchema = z.object({
  userId: z.string(),
  amount: z.coerce
    .number({
      message: "Amount must be a number.",
    })
    .min(1, {
      message: "Amount must be greater than 0.",
    }),
  date: z.coerce.date(),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
});

export const editingExpSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.date(),
  description: z.string().optional(),
  category: z.string(),
});

export const budgetSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  month: z.string().min(1, "Month is required"),
});
