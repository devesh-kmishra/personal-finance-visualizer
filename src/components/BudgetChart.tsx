"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatExpenseCategory } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

interface ComparisonData {
  category: string;
  budget: number;
  actual: number;
}

export default function BudgetComparisonChart({
  userId,
  selectedMonth,
}: {
  userId: string;
  selectedMonth: string;
}) {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    totalBudget: 0,
    totalSpent: 0,
    overBudgetCount: 0,
    underBudgetCount: 0,
    savingsRate: 0,
  });

  useEffect(() => {
    (async function fetchData() {
      try {
        setLoading(true);

        // Fetch budgets and expenses
        const [budgetsRes, expensesRes] = await Promise.all([
          fetch(`/api/${userId}/budgets`),
          fetch(`/api/${userId}/expenses`),
        ]);

        const budgets: Budget[] = await budgetsRes.json();
        const expenses: Expense[] = await expensesRes.json();

        // Filter budgets for selected month
        const monthBudgets = budgets.filter((b) => b.month === selectedMonth);

        // Calculate actual spending per category for the month
        const categorySpending: Record<string, number> = {};
        expenses.forEach((exp) => {
          const expMonth = exp.date.slice(0, 7);
          if (expMonth === selectedMonth) {
            categorySpending[exp.category] =
              (categorySpending[exp.category] || 0) + exp.amount;
          }
        });

        // Build comparison data
        const data: ComparisonData[] = monthBudgets.map((budget) => ({
          category: formatExpenseCategory(budget.category),
          budget: budget.amount,
          actual: categorySpending[budget.category] || 0,
        }));

        setComparisonData(data);

        // Calculate insights
        const totalBudget = data.reduce((sum, d) => sum + d.budget, 0);
        const totalSpent = data.reduce((sum, d) => sum + d.actual, 0);
        const overBudgetCount = data.filter((d) => d.actual > d.budget).length;
        const underBudgetCount = data.filter(
          (d) => d.actual <= d.budget
        ).length;
        const savingsRate =
          totalBudget > 0
            ? ((totalBudget - totalSpent) / totalBudget) * 100
            : 0;

        setInsights({
          totalBudget,
          totalSpent,
          overBudgetCount,
          underBudgetCount,
          savingsRate,
        });
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, selectedMonth]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const difference = data.actual - data.budget;
      const percentage =
        data.budget > 0 ? (data.actual / data.budget) * 100 : 0;

      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold mb-2">{data.category}</p>
          <p className="text-sm text-blue-600">
            Budget: ₹{data.budget.toFixed(2)}
          </p>
          <p className="text-sm text-green-600">
            Actual: ₹{data.actual.toFixed(2)}
          </p>
          <p
            className={`text-sm font-semibold ${
              difference > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {difference > 0 ? "Over" : "Under"}: ₹
            {Math.abs(difference).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {percentage.toFixed(1)}% of budget
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              No budgets set for{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full h-[80vh] rounded-md border p-4 space-y-6">
      {/* Main Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
          <p className="text-sm text-gray-500">
            {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budget" fill="#6366f1" name="Budget" />
              <Bar dataKey="actual" fill="#10b981" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Spending Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{insights.totalBudget.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{insights.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {insights.savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {insights.savingsRate >= 0 ? "Under budget" : "Over budget"}
                </p>
              </div>
              {insights.savingsRate >= 0 ? (
                <TrendingDown className="h-12 w-12 text-green-500" />
              ) : (
                <TrendingUp className="h-12 w-12 text-red-500" />
              )}
            </div>
          </div>

          {/* Category Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Under Budget</p>
                <p className="text-xl font-bold text-green-600">
                  {insights.underBudgetCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Over Budget</p>
                <p className="text-xl font-bold text-red-600">
                  {insights.overBudgetCount}
                </p>
              </div>
            </div>
          </div>

          {/* Top Spending Categories */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Category Performance</h4>
            <div className="space-y-2">
              {comparisonData
                .sort((a, b) => {
                  const diffA = a.actual - a.budget;
                  const diffB = b.actual - b.budget;
                  return Math.abs(diffB) - Math.abs(diffA);
                })
                .slice(0, 3)
                .map((item, index) => {
                  const difference = item.actual - item.budget;
                  const percentage =
                    item.budget > 0 ? (item.actual / item.budget) * 100 : 0;
                  const isOver = difference > 0;

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.category}</p>
                        <p className="text-xs text-gray-500">
                          {percentage.toFixed(1)}% of budget
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isOver ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isOver ? "+" : ""}₹{difference.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Spending Tip */}
          {insights.overBudgetCount > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Budget Alert
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You&apos;re over budget in {insights.overBudgetCount}{" "}
                    categor
                    {insights.overBudgetCount > 1 ? "ies" : "y"}. Consider
                    reducing spending or adjusting your budget.
                  </p>
                </div>
              </div>
            </div>
          )}

          {insights.savingsRate > 20 && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Great Job!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    You&apos;re doing excellent with a{" "}
                    {insights.savingsRate.toFixed(1)}% savings rate. Keep up the
                    good work!
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
