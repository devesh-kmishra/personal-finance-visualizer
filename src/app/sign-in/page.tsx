import { SignInForm } from "@/components/SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ oAuthError?: string }>;
}) {
  const { oAuthError } = await searchParams;

  return (
    <div className="w-full sm:max-w-sm mx-auto mt-20">
      {oAuthError && <div className="text-red-600">{oAuthError}</div>}
      <SignInForm />
    </div>
  );
}
