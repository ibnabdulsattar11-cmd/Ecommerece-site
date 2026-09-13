"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { Link, useRouter } from "@/lib/i18n/navigation";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await login(values.identifier, values.password);
      router.push("/account");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-bold text-primary">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email or Phone</label>
          <input
            {...register("identifier", { required: true })}
            className="w-full rounded border px-3 py-2"
            placeholder="you@example.com"
          />
          {errors.identifier && <p className="mt-1 text-sm text-red-600">This field is required</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password", { required: true })}
            className="w-full rounded border px-3 py-2"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">Password is required</p>}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2 text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/google`}
          className="rounded border py-2 text-center hover:bg-gray-50"
        >
          Continue with Google
        </a>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
