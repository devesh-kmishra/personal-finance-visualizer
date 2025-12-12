"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { expenseCategories, formatExpenseCategory } from "@/lib/utils";
import { Edit2, Trash2, Plus } from "lucide-react";
import { budgetSchema } from "@/lib/schemas";
import { Expense } from "./ExpenseList";
import { addBudget, deleteBudget, editBudget } from "@/actions/actions";

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // Format: "2025-12"
}

export default function BudgetManager({ userId }: { userId: string }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Current month: "2025-12"
  );

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      id: "",
      category: "ot",
      amount: 0,
      month: selectedMonth,
    },
  });

  useEffect(() => {
    (async function fetchBudgets() {
      try {
        const res = await fetch(`/api/${userId}/budgets`);
        const data = await res.json();
        setBudgets(data);
      } catch (err) {
        console.error("Failed to fetch budgets:", err);
      }
    })();
  }, [userId]);

  useEffect(() => {
    (async function fetchExpenses() {
      try {
        const res = await fetch(`/api/${userId}/expenses`);
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      }
    })();
  }, [userId]);

  // Calculate spent amount for a category in a specific month
  const getSpentAmount = (category: string, month: string) => {
    return expenses
      .filter((exp) => {
        const expMonth = exp.date.slice(0, 7);
        return exp.category === category && expMonth === month;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Filter budgets by selected month
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);

  const onSubmit = async (values: z.infer<typeof budgetSchema>) => {
    try {
      if (editingBudget) {
        const res = await editBudget(values);

        if (res?.error) throw new Error(res.error);

        if (res.budget) {
          const updated = res.budget;
          setBudgets((prev) =>
            prev.map((b) => (b.id === editingBudget.id ? updated : b))
          );
          toast.success("Budget updated successfully!");
        }
      } else {
        const res = await addBudget(values);

        if (res?.error) throw new Error(res.error);

        if (res.budget) {
          const newBudget = res.budget;
          setBudgets((prev) => [...prev, newBudget]);
          toast.success("Budget created successfully!");
        }
      }

      setShowForm(false);
      setEditingBudget(null);
      form.reset();
      window.dispatchEvent(new Event("budgetUpdated"));
    } catch (err) {
      toast.error(
        editingBudget ? "Failed to update budget!" : "Failed to create budget!"
      );
      console.error(err);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    form.reset({
      id: budget.id,
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteBudget(id);

      if (res?.error) throw new Error(res.error);

      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast.success("Budget deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete budget!");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
    form.reset();
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget Manager</h2>
          <p className="text-sm text-gray-500">
            Set and track category budgets
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Month selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Select Month:</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monthBudgets.length > 0 ? (
          monthBudgets.map((budget) => {
            const spent = getSpentAmount(budget.category, budget.month);
            const percentage = (spent / budget.amount) * 100;
            const remaining = budget.amount - spent;

            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {formatExpenseCategory(budget.category)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(budget.month + "-01").toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold">₹{spent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold">
                      ₹{budget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span
                      className={`font-semibold ${
                        remaining >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{Math.abs(remaining).toFixed(2)}
                      {remaining < 0 && " over"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% used</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressColor(
                          spent,
                          budget.amount
                        )}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">
                No budgets set for{" "}
                {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingBudget ? "Edit Budget" : "Add New Budget"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="month"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="budget-month">Month</FieldLabel>
                      <Input
                        {...field}
                        id="budget-month"
                        type="month"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="category"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="budget-category">
                        Category
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="budget-category"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="amount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="budget-amount">
                        Budget Amount
                      </FieldLabel>
                      <Input
                        {...field}
                        id="budget-amount"
                        type="number"
                        step="0.01"
                        placeholder="5000.00"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-[50%]"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="w-[50%]"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {editingBudget ? "Update" : "Create"} Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
