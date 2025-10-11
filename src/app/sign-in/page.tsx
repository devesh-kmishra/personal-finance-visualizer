import { SignInForm } from "@/components/SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ oAuthError?: string }>;
}) {
  const { oAuthError } = await searchParams;

  return (
    <div className='mx-auto p-4 max-w-[750px] border rounded-lg shadow-md'>
      <h2 className='mb-4 font-semibold'>Sign In</h2>
      {oAuthError && <div className='text-red-600'>{oAuthError}</div>}
      <SignInForm />
    </div>
  );
}
