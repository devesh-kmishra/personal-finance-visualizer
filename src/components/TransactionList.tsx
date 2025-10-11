"use client";

const dummyTransactions = [
  {
    id: 1,
    date: "2025-07-01",
    amount: 500,
    category: "Groceries",
    description: "Walmart",
  },
  {
    id: 2,
    date: "2025-07-02",
    amount: 1200,
    category: "Rent",
    description: "Monthly rent",
  },
];

export default function TransactionList() {
  return (
    <div className='border rounded-lg p-4 max-h-[70vh] overflow-y-auto'>
      {dummyTransactions.map((tx) => (
        <div key={tx.id} className='border-b pb-2 mb-2'>
          <p className='text-sm text-muted-foreground'>{tx.date}</p>
          <p className='text-base font-medium'>{tx.description}</p>
          <p className='text-sm text-right text-green-600'>₹{tx.amount}</p>
          <p className='text-xs italic text-gray-500'>{tx.category}</p>
        </div>
      ))}
    </div>
  );
}
