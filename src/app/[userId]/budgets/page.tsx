import BudgetManager from "@/components/BudgetManager";

export default async function BudgetsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <div>
      <BudgetManager userId={userId} />
    </div>
  );
}
