"use client";

import { signOut } from "@/actions/actions";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const res = await signOut();

    if (res.success) {
      router.push("/sign-in");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className='px-4 py-2 hover:bg-gray-200 w-full text-left'
    >
      Sign out
    </button>
  );
}
