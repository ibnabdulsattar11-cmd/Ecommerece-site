"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", values);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-bold text-primary">Forgot your password?</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="email"
          {...register("email", { required: true })}
          placeholder="you@example.com"
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>
    </main>
  );
}
