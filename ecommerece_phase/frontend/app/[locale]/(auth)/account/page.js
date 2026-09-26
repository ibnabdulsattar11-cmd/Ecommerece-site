"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";
import AccountNav from "@/components/account/AccountNav";

export default function AccountPage() {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) return <main className="p-8 text-gray-500">Loading…</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Account</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="card p-6 md:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{user.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email verified</dt>
              <dd className="font-medium text-gray-900">{user.isVerified ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
