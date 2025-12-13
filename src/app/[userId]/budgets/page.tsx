import BudgetPageContent from "@/components/BudgetPageContent";

export default async function BudgetsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <BudgetPageContent userId={userId} />;
}
