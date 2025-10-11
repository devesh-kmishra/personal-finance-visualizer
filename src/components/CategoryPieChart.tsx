"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Food", value: 1000 },
  { name: "Rent", value: 5000 },
  { name: "Travel", value: 2000 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function CategoryPieChart() {
  return (
    <div className='bg-white rounded-xl shadow p-4'>
      <h3 className='font-semibold mb-2'>Expenses by Category</h3>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey='value'
            nameKey='name'
            outerRadius={100}
            fill='#8884d8'
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
