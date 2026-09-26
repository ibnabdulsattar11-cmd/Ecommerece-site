"use client";

import { useEffect, useState } from "react";
import { adminGetInventory, adminAdjustStock } from "@/lib/api/admin";

export default function AdminInventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(null);
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");

  const load = () => {
    setLoading(true);
    adminGetInventory({ sort: "stock_asc", limit: 50 })
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submitAdjustment = async (productId) => {
    const value = parseInt(delta);
    if (!value) return;
    await adminAdjustStock(productId, {
      delta: value,
      changeType: value > 0 ? "restock" : "correction",
      note,
    });
    setAdjusting(null);
    setDelta("");
    setNote("");
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inventory</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-start">Product</th>
              <th className="px-4 py-3 text-start">SKU</th>
              <th className="px-4 py-3 text-start">Stock</th>
              <th className="px-4 py-3 text-start">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nameEn}</td>
                  <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? "font-semibold text-danger" : "text-gray-700"}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    {adjusting === p.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={delta}
                          onChange={(e) => setDelta(e.target.value)}
                          placeholder="±qty"
                          className="input w-24 !py-1"
                        />
                        <input
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Note"
                          className="input w-32 !py-1"
                        />
                        <button onClick={() => submitAdjustment(p.id)} className="text-primary-600 hover:underline">Save</button>
                        <button onClick={() => setAdjusting(null)} className="text-gray-500 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setAdjusting(p.id)} className="text-primary-600 hover:underline">
                        Adjust stock
                      </button>
                    )}
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
