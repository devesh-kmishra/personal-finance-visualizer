import Link from "next/link";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";
import { getCurrentUser } from "@/lib/currentUser";
import { SignOutButton } from "./SignOutButton";

export default async function AppSidebar() {
  const currentUser = await getCurrentUser();

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <h3>Hello {currentUser?.name.split(" ")[0]}</h3>
        <Link href="/" className="px-4 py-2 hover:bg-gray-200">
          Dashboard
        </Link>
        <Link
          href={`/${currentUser?.id}/expenses`}
          className="px-4 py-2 hover:bg-gray-200"
        >
          My Expenses
        </Link>
        <Link href="/" className="px-4 py-2 hover:bg-gray-200">
          Expense Charts
        </Link>
        <SignOutButton />
      </SidebarContent>
    </Sidebar>
  );
}
