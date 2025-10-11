"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { signInSchema } from "@/lib/schemas";
import { oAuthSignIn, signIn } from "@/actions/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { oAuthProviders } from "@/lib/utils";

export function SignInForm() {
  const [error, setError] = useState<string>();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const res = await signIn(values);

    setError(res.error);

    if (res.success) {
      router.push("/");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 max-w-md mx-auto'
      >
        {error && <p className='text-red-600'>{error}</p>}
        <div className='flex gap-4'>
          <Button
            type='button'
            onClick={async () => await oAuthSignIn(oAuthProviders[0])}
          >
            Google
          </Button>
          <Button
            type='button'
            onClick={async () => await oAuthSignIn(oAuthProviders[1])}
          >
            GitHub
          </Button>
        </div>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full'>
          Sign In
        </Button>
      </form>
    </Form>
  );
}
