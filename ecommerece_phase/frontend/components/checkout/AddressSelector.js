"use client";

import { useEffect, useState } from "react";
import { getAddresses, createAddress } from "@/lib/api/users";

export default function AddressSelector({ selectedId, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddresses()
      .then((res) => {
        const list = res.data || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) onSelect(def.id);
        else setShowForm(true);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading addresses…</p>;

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((addr) => (
        <label
          key={addr.id}
          className={`card flex cursor-pointer items-start gap-3 p-4 ${
            selectedId === addr.id ? "border-primary-500 ring-1 ring-primary-500" : ""
          }`}
        >
          <input
            type="radio"
            name="address"
            checked={selectedId === addr.id}
            onChange={() => onSelect(addr.id)}
            className="mt-1"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-900">{addr.label}</p>
            <p className="text-gray-600">
              {addr.street}, {addr.area}, {addr.city}, {addr.country}
            </p>
          </div>
        </label>
      ))}

      {showForm ? (
        <NewAddressForm
          onCreated={(addr) => {
            setAddresses((prev) => [...prev, addr]);
            onSelect(addr.id);
            setShowForm(false);
          }}
        />
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-outline self-start text-sm">
          + Add a new address
        </button>
      )}
    </div>
  );
}

function NewAddressForm({ onCreated }) {
  const [form, setForm] = useState({
    label: "Home",
    country: "Pakistan",
    city: "",
    area: "",
    street: "",
    houseNo: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await createAddress(form);
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save this address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="card flex flex-col gap-3 p-4">
      <div className="grid grid-cols-2 gap-3">
        <input value={form.label} onChange={update("label")} placeholder="Label (Home/Office)" className="input" />
        <input value={form.country} onChange={update("country")} placeholder="Country" className="input" required />
        <input value={form.city} onChange={update("city")} placeholder="City" className="input" required />
        <input value={form.area} onChange={update("area")} placeholder="Area" className="input" required />
        <input value={form.street} onChange={update("street")} placeholder="Street" className="input" required />
        <input value={form.houseNo} onChange={update("houseNo")} placeholder="House / Flat No." className="input" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary self-start">
        {saving ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
