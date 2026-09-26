"use client";

import { usePathname, Link } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

export default function AccountNav() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <nav className="card flex flex-row gap-1 overflow-x-auto p-2 md:flex-col md:p-3">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
            pathname === link.href ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {link.label}
        </Link>
      ))}
      <button
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
        className="whitespace-nowrap rounded-lg px-4 py-2 text-start text-sm font-medium text-danger hover:bg-red-50"
      >
        Logout
      </button>
    </nav>
  );
}
