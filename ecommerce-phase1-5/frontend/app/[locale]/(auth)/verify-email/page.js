"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import api from "@/lib/axios";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success" && (
        <>
          <p className="mb-4 text-green-600">Your email has been verified!</p>
          <Link href="/login" className="text-primary hover:underline">
            Go to login
          </Link>
        </>
      )}
      {status === "error" && <p className="text-red-600">This verification link is invalid or has expired.</p>}
    </main>
  );
}
