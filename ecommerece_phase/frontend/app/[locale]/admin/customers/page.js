"use client";

import { useEffect, useState } from "react";
import { adminGetCustomers, adminSetCustomerBlocked } from "@/lib/api/admin";
import { formatDate } from "@/lib/format";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminGetCustomers(search ? { search } : {})
      .then((res) => setCustomers(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleBlock = async (customer) => {
    await adminSetCustomerBlocked(customer.id, !customer.isBlocked);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Customers</h1>

      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search by name or email…"
          className="input max-w-sm"
        />
        <button onClick={load} className="btn-outline">Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Joined</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.isBlocked ? "bg-danger-light text-danger" : "bg-success-light text-success"}`}>
                      {c.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleBlock(c)} className="text-primary-600 hover:underline">
                      {c.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
