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
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-500">Log in to continue shopping.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="label">Email or Phone</label>
            <input
              {...register("identifier", { required: true })}
              className="input"
              placeholder="you@example.com"
            />
            {errors.identifier && <p className="mt-1 text-sm text-danger">This field is required</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" {...register("password", { required: true })} className="input" />
            {errors.password && <p className="mt-1 text-sm text-danger">Password is required</p>}
          </div>

          {serverError && <p className="text-sm text-danger">{serverError}</p>}

          <button type="submit" disabled={submitting} className="btn-primary mt-1">
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-3 text-sm">
          <Link href="/forgot-password" className="text-primary-600 hover:underline">
            Forgot password?
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/google`}
            className="btn-outline"
          >
            Continue with Google
          </a>
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
