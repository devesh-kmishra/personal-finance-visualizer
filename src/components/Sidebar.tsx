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
        <h3>Hello {currentUser?.name}</h3>
        <Link href='/' className='px-4 py-2 hover:bg-gray-200'>
          New Transaction
        </Link>
        <Link href='/transactions' className='px-4 py-2 hover:bg-gray-200'>
          My Transactions
        </Link>
        <Link href='/' className='px-4 py-2 hover:bg-gray-200'>
          Expense Charts
        </Link>
        <SignOutButton />
      </SidebarContent>
    </Sidebar>
  );
}
