"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatExpenseCategory, formatExpenseDate } from "@/lib/utils";
import { IndianRupee, TrendingUp, Grid3x3 } from "lucide-react";
import { Expense } from "./ExpenseList";

interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export default function ExpenseDashboard({ userId }: { userId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function fetchExpenses() {
      try {
        const res = await fetch(`/api/${userId}/expenses`);
        const data: Expense[] = await res.json();
        setExpenses(data);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    const category = formatExpenseCategory(exp.category);
    categoryTotals[category] = (categoryTotals[category] || 0) + exp.amount;
  });

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Top 5 categories

  // Get most recent transactions
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Top Category Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Category
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryBreakdown[0]?.category || "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {categoryBreakdown[0]
                ? `₹${categoryBreakdown[0].total.toFixed(
                    2
                  )} (${categoryBreakdown[0].percentage.toFixed(1)}%)`
                : "No expenses yet"}
            </p>
          </CardContent>
        </Card>

        {/* Total Categories Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories Used
            </CardTitle>
            <Grid3x3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(categoryTotals).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {categoryBreakdown.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-gray-600">
                      ₹{cat.total.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No expenses found.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((exp) => (
                <div
                  key={exp.id}
                  className="flex justify-between items-start border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{exp.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatExpenseCategory(exp.category)} •{" "}
                      {formatExpenseDate(exp.date)}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    ₹{exp.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent transactions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
