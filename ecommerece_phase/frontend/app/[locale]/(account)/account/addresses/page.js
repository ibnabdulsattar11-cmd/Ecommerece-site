"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";
import { getAddresses, createAddress, deleteAddress, setDefaultAddress } from "@/lib/api/users";
import AccountNav from "@/components/account/AccountNav";

export default function AddressesPage() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  const load = async () => {
    const res = await getAddresses();
    setAddresses(res.data || []);
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const onAdd = async (values) => {
    await createAddress(values);
    reset();
    setShowForm(false);
    load();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Account</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Addresses</h2>

          <div className="mb-6 flex flex-col gap-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {addr.label}
                    {addr.isDefault && <span className="badge ms-2 bg-success-light text-success">Default</span>}
                  </span>
                  <div className="flex gap-3 text-sm">
                    {!addr.isDefault && (
                      <button onClick={() => setDefaultAddress(addr.id).then(load)} className="text-primary-600 hover:underline">
                        Set default
                      </button>
                    )}
                    <button onClick={() => deleteAddress(addr.id).then(load)} className="text-danger hover:underline">
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
            <button onClick={() => setShowForm(true)} className="btn-outline">
              + Add address
            </button>
          ) : (
            <form onSubmit={handleSubmit(onAdd)} className="card flex flex-col gap-3 p-4">
              <select {...register("label")} className="input">
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
              <input {...register("country", { required: true })} placeholder="Country" className="input" />
              <input {...register("city", { required: true })} placeholder="City" className="input" />
              <input {...register("area", { required: true })} placeholder="Area" className="input" />
              <input {...register("street", { required: true })} placeholder="Street" className="input" />
              <input {...register("houseNo")} placeholder="House / Building No." className="input" />
              <input {...register("postalCode")} placeholder="Postal Code" className="input" />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Save address</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
