"use client";

import Link from "next/link";
import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function AuthLayout({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Blue Matrix
          </Link>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your projects</p>
        </div>
        {children}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Need help?{" "}
        <a href="mailto:support@example.com" className="font-medium text-blue-600 underline-offset-2 hover:underline">
          Contact support
        </a>
      </p>
    </main>
  );
}

