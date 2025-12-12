"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signInSchema } from "@/lib/schemas";
import { oAuthSignIn, signIn } from "@/actions/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { oAuthProviders } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import Link from "next/link";

export function SignInForm() {
  const [error, setError] = useState<string>();
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const res = await signIn(values);

    setError(res.error);

    if (res.success) {
      router.push(`/${res.userId}/`);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
        <CardAction>
          <Link href={"/sign-up"}>
            <Button variant="link">Sign Up</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          id="sign-in"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 mx-auto"
        >
          {error && <p className="text-red-600">{error}</p>}
          <Field orientation="horizontal" className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={async () => await oAuthSignIn(oAuthProviders[0])}
            >
              <FcGoogle />
              Google
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={async () => await oAuthSignIn(oAuthProviders[1])}
            >
              <FaGithub />
              GitHub
            </Button>
          </Field>

          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="sign-in-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="example@email.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="sign-in-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" className="w-full" form="sign-in">
            Sign In
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
