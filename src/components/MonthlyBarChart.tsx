"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", amount: 3000 },
  { month: "Feb", amount: 2500 },
  { month: "Mar", amount: 4000 },
  { month: "Apr", amount: 2000 },
];

export default function MonthlyBarChart() {
  return (
    <div className='bg-white rounded-xl shadow p-4'>
      <h3 className='font-semibold mb-2'>Monthly Expenses</h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data}>
          <XAxis dataKey='month' />
          <YAxis />
          <Tooltip />
          <Bar dataKey='amount' fill='#6366f1' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
