import React from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/actions/actions";
import { Expense } from "@/components/ExpenseList";

export function useOptimisticDelete(
  expenses: Expense[],
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>
) {
  async function handleDelete(expenseId: string) {
    const oldExpenses = expenses;
    const updated = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updated);

    let undoCalled = false;

    const t = toast(
      <div className="flex items-center justify-between w-full">
        <span>Expense deleted</span>
        <button
          onClick={() => {
            undoCalled = true;
            toast.dismiss(t);
            setExpenses(oldExpenses);
          }}
          className="underline text-blue-600 ml-4"
        >
          Undo
        </button>
      </div>,
      { duration: 5000 }
    );

    setTimeout(async () => {
      if (!undoCalled) {
        try {
          await deleteExpense(expenseId);
        } catch (err) {
          console.error(err);
          setExpenses(oldExpenses);
          toast.error("Failed to delete expense");
        }
      }
    }, 5000);
  }

  return { handleDelete };
}
