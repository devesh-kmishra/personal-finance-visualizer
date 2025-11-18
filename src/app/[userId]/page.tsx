import NewExpense from "@/components/NewExpense";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/currentUser";

export default async function UserPage() {
  await getCurrentUser({ redirectIfNotFound: true });

  return (
    <div className="p-4 w-full">
      <SidebarTrigger className="cursor-pointer" />
      <NewExpense />
    </div>
  );
}
