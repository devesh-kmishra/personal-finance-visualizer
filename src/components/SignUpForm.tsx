"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { oAuthSignIn, signUp } from "@/actions/actions";
import { signUpSchema } from "@/lib/schemas";
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
import Link from "next/link";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

export function SignUpForm() {
  const [error, setError] = useState<string>();
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    const res = await signUp(values);

    setError(res.error);

    if (res.success) {
      router.push("/");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account now</CardDescription>
        <CardAction>
          <Link href={"/sign-in"}>
            <Button variant="link">Sign In</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          id="sign-up"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-md mx-auto"
        >
          {error && <p className="text-red-600">{error}</p>}
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={async () => await oAuthSignIn(oAuthProviders[0])}
            >
              <FcGoogle />
              Google
            </Button>
            <Button
              type="button"
              onClick={async () => await oAuthSignIn(oAuthProviders[1])}
            >
              <FaGithub />
              GitHub
            </Button>
          </Field>

          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="sign-up-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="sign-up-email"
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
                  <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="sign-up-password"
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
          <Button type="submit" className="w-full" form="sign-up">
            Sign Up
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
