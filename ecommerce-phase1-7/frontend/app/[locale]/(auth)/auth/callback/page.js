"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { setAccessToken } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = searchParams.get("accessToken");
    if (!token) {
      router.push("/login?error=google");
      return;
    }
    setAccessToken(token);
    api
      .get("/users/me")
      .then((res) => {
        setUser(res.data.data);
        router.push("/account");
      })
      .catch(() => router.push("/login?error=google"));
  }, [searchParams, router, setUser]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Signing you in...</p>
    </main>
  );
}
