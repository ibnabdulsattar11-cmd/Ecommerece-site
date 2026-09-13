"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";
import api from "@/lib/axios";
import Navbar from "@/components/Navbar";

export default function AccountPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const loadAddresses = async () => {
    const { data } = await api.get("/users/me/addresses");
    setAddresses(data.data);
  };

  useEffect(() => {
    if (isAuthenticated) loadAddresses();
  }, [isAuthenticated]);

  const onAddAddress = async (values) => {
    await api.post("/users/me/addresses", values);
    reset();
    setShowForm(false);
    loadAddresses();
  };

  const onDelete = async (id) => {
    await api.delete(`/users/me/addresses/${id}`);
    loadAddresses();
  };

  const onSetDefault = async (id) => {
    await api.patch(`/users/me/addresses/${id}/default`);
    loadAddresses();
  };

  if (isLoading || !user) return <main className="p-8">Loading...</main>;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-primary">My Account</h1>
        <p className="mb-6 text-gray-600">
          {user.name} — {user.email || user.phone}
        </p>

        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="mb-8 rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Logout
        </button>

        <h2 className="mb-4 text-xl font-semibold">Addresses</h2>

        <div className="mb-6 flex flex-col gap-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {addr.label} {addr.isDefault && <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Default</span>}
                </span>
                <div className="flex gap-3 text-sm">
                  {!addr.isDefault && (
                    <button onClick={() => onSetDefault(addr.id)} className="text-primary hover:underline">
                      Set default
                    </button>
                  )}
                  <button onClick={() => onDelete(addr.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {addr.houseNo}, {addr.street}, {addr.area}, {addr.city}, {addr.country}
              </p>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-sm text-gray-500">No addresses added yet.</p>}
        </div>

        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="rounded border px-4 py-2 text-sm hover:bg-gray-50">
            + Add address
          </button>
        ) : (
          <form onSubmit={handleSubmit(onAddAddress)} className="flex flex-col gap-3 rounded border p-4">
            <select {...register("label")} className="rounded border px-3 py-2">
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
            <input {...register("country", { required: true })} placeholder="Country" className="rounded border px-3 py-2" />
            <input {...register("city", { required: true })} placeholder="City" className="rounded border px-3 py-2" />
            <input {...register("area", { required: true })} placeholder="Area" className="rounded border px-3 py-2" />
            <input {...register("street", { required: true })} placeholder="Street" className="rounded border px-3 py-2" />
            <input {...register("houseNo")} placeholder="House / Building No." className="rounded border px-3 py-2" />
            <input {...register("postalCode")} placeholder="Postal Code" className="rounded border px-3 py-2" />
            <div className="flex gap-3">
              <button type="submit" className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark">
                Save address
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded border px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
