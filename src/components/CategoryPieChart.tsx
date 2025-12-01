"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatExpenseCategory } from "@/lib/utils";
import { Expense } from "./ExpenseList";

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#83a6ed",
  "#8dd1e1",
  "#d084d0",
  "#ffa07a",
];

export default function CategoryPieChart({ userId }: { userId: string }) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function fetchAndProcessExpenses() {
      try {
        const res = await fetch(`/api/${userId}/expenses`);
        const expenses: Expense[] = await res.json();

        const categoryExpenses: Record<string, number> = {};

        expenses.forEach((expense) => {
          const categoryName = formatExpenseCategory(expense.category);

          if (!categoryExpenses[categoryName]) {
            categoryExpenses[categoryName] = 0;
          }
          categoryExpenses[categoryName] += expense.amount;
        });

        const data = Object.entries(categoryExpenses)
          .map(([name, value]) => ({
            name,
            value: Math.round(value * 100) / 100,
          }))
          .sort((a, b) => b.value - a.value);

        setCategoryData(data);
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
        <h3 className="font-semibold mb-2">Expenses by Category</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Expenses by Category</h3>
        <p className="text-gray-500">No expenses found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            fill="#8884d8"
            label={(entry) => `${entry.name}: ₹${entry.value}`}
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
