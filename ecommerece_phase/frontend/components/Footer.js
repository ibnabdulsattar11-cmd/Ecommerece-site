import { Link } from "@/lib/i18n/navigation";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-gray-100 bg-primary-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Shop</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/products">All Products</Link></li>
            <li><Link href="/products?category=men">Men</Link></li>
            <li><Link href="/products?category=women">Women</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Account</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/account/orders">Orders</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Get in touch</h3>
          <p className="text-sm">support@shop.example</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-gray-400">
        © {year} Shop. All rights reserved.
      </div>
    </footer>
  );
}
