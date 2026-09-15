"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import api from "@/lib/axios";

export default function ResetPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setMessage("");
    try {
      await api.post("/auth/reset-password", { token, password: values.password });
      setMessage("Password reset! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <p className="text-red-600">Missing or invalid reset link.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-bold text-primary">Set a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="New password"
          {...register("password", { required: true, minLength: 8 })}
          className="w-full rounded border px-3 py-2"
        />
        {errors.password && <p className="text-sm text-red-600">Minimum 8 characters</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Resetting..." : "Reset password"}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>
    </main>
  );
}
