"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Expense } from "./ExpenseList";

interface MonthlyData {
  month: string;
  amount: number;
}

export default function MonthlyBarChart({ userId }: { userId: string }) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function fetchAndProcessExpenses() {
      try {
        const res = await fetch(`/api/${userId}/expenses`);
        const expenses: Expense[] = await res.json();

        const monthlyExpenses: Record<string, number> = {};

        expenses.forEach((expense) => {
          const date = new Date(expense.date);
          const monthKey = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          if (!monthlyExpenses[monthKey]) {
            monthlyExpenses[monthKey] = 0;
          }
          monthlyExpenses[monthKey] += expense.amount;
        });

        const data = Object.entries(monthlyExpenses)
          .map(([month, amount]) => ({
            month,
            amount: Math.round(amount * 100) / 100,
          }))
          .sort((a, b) => {
            const dateA = new Date(a.month + " 1");
            const dateB = new Date(b.month + " 1");
            return dateA.getTime() - dateB.getTime();
          });

        setMonthlyData(data);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Monthly Expenses</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Monthly Expenses</h3>
        <p className="text-gray-500">No expenses found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">Monthly Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Bar dataKey="amount" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
