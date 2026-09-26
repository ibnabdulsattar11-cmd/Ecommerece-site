"use client";

import { usePathname, Link } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/inventory", label: "Inventory", icon: "📈" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-e border-white/10 bg-primary-900 text-gray-200">
      <div className="px-5 py-5 text-lg font-bold text-white">Admin Panel</div>
      <nav className="flex-1 overflow-y-auto px-3">
        {LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                active ? "bg-primary-700 text-white" : "text-gray-300 hover:bg-primary-800"
              }`}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" className="block px-3 py-2 text-sm text-gray-300 hover:text-white">
          ← Back to store
        </Link>
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="block w-full rounded-lg px-3 py-2 text-start text-sm text-gray-300 hover:bg-primary-800 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
