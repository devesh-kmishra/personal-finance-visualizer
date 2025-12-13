"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import BudgetManager from "./BudgetManager";
import BudgetComparisonChart from "./BudgetChart";

export default function BudgetPageContent({ userId }: { userId: string }) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Current month: "2025-12"
  );
  return (
    <div>
      {/* Month selector */}
      <Card className="max-w-md m-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BudgetManager userId={userId} selectedMonth={selectedMonth} />
        <BudgetComparisonChart userId={userId} selectedMonth={selectedMonth} />
      </div>
    </div>
  );
}
