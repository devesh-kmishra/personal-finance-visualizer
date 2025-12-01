import CategoryPieChart from "@/components/CategoryPieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import ExpenseList from "@/components/ExpenseList";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Expenses</h2>
        <ExpenseList userId={userId} />
      </div>
      <div className="space-y-6">
        <MonthlyBarChart userId={userId} />
        <CategoryPieChart userId={userId} />
      </div>
    </div>
  );
}
