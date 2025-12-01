import ExpenseDashboard from "@/components/Dashboard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/currentUser";

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await getCurrentUser({ redirectIfNotFound: true });
  const { userId } = await params;

  return (
    <div className="p-4 w-full">
      <SidebarTrigger className="cursor-pointer" />
      <ExpenseDashboard userId={userId} />
    </div>
  );
}
