"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden px-6 py-6 sm:px-8">{children}</div>
    </div>
  );
}
