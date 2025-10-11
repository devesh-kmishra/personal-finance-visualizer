import CategoryPieChart from "@/components/CategoryPieChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import TransactionList from "@/components/TransactionList";

export default function TransactionsPage() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6'>
      <div className='space-y-4'>
        <h2 className='text-xl font-bold'>Your Transactions</h2>
        <TransactionList />
      </div>
      <div className='space-y-6'>
        <MonthlyBarChart />
      </div>
      <div className='space-y-6'>
        <CategoryPieChart />
      </div>
    </div>
  );
}
