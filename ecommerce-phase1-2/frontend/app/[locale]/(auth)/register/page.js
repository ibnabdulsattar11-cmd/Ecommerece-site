"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { Link, useRouter } from "@/lib/i18n/navigation";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const doRegister = useAuthStore((s) => s.register);
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await doRegister(values);
      router.push("/account");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-bold text-primary">Create an account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input {...register("name", { required: true })} className="w-full rounded border px-3 py-2" />
          {errors.name && <p className="mt-1 text-sm text-red-600">Name is required</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" {...register("email")} className="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
          <input {...register("phone")} className="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 8 })}
            className="w-full rounded border px-3 py-2"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">Minimum 8 characters</p>}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}
