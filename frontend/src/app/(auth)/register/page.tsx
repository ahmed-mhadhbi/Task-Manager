"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormFeedback } from "@/components/form-feedback";
import { useAuth } from "@/context/auth-context";

const schema = z
  .object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { name, email, password } = values;
      await registerUser({ name, email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
            Name
          </label>
          <Input id="name" placeholder="Jane Doe" {...register("name")} />
          {errors.name?.message && <FormFeedback message={errors.name.message} />}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
          {errors.email?.message && <FormFeedback message={errors.email.message} />}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password?.message && <FormFeedback message={errors.password.message} />}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword?.message && <FormFeedback message={errors.confirmPassword.message} />}
        </div>
      </div>
      <FormFeedback message={error ?? undefined} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-medium text-blue-600 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}

