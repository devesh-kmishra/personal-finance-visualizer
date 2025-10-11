import NewExpense from "@/components/NewExpense";
import { getCurrentUser } from "@/lib/currentUser";

export default async function Home() {
  await getCurrentUser({ redirectIfNotFound: true });

  return (
    <div className='p-4'>
      <NewExpense />
    </div>
  );
}
