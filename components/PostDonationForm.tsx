"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const HYDERABAD_BOUNDS = {
  lat: { min: 17.2, max: 17.6 },
  lng: { min: 78.3, max: 78.65 },
};

function randomCoord() {
  const lat = HYDERABAD_BOUNDS.lat.min + Math.random() * (HYDERABAD_BOUNDS.lat.max - HYDERABAD_BOUNDS.lat.min);
  const lng = HYDERABAD_BOUNDS.lng.min + Math.random() * (HYDERABAD_BOUNDS.lng.max - HYDERABAD_BOUNDS.lng.min);
  return { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
}

interface Props {
  onPosted?: () => void;
}

export default function PostDonationForm({ onPosted }: Props) {
  const { appUser } = useAuth();
  const [form, setForm] = useState({ foodItem: "", quantity: "", pickupWindow: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "donations"), {
        restaurantName: appUser.name,
        restaurantId: appUser.id,
        foodItem: form.foodItem.trim(),
        quantity: form.quantity.trim(),
        pickupWindow: form.pickupWindow.trim(),
        status: "available",
        ...randomCoord(),
        createdAt: Date.now(),
        claimedBy: null,
      });
      setForm({ foodItem: "", quantity: "", pickupWindow: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onPosted?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Food Item</label>
        <input
          name="foodItem"
          value={form.foodItem}
          onChange={handle}
          placeholder="e.g. Biryani & Dal"
          required
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          name="quantity"
          value={form.quantity}
          onChange={handle}
          placeholder="e.g. 20 portions"
          required
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Window</label>
        <input
          name="pickupWindow"
          value={form.pickupWindow}
          onChange={handle}
          placeholder="e.g. 6:00 PM – 8:00 PM"
          required
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Posting…" : "Post Donation"}
      </button>
      {success && (
        <p className="text-center text-green-600 text-sm font-medium">
          Donation posted successfully!
        </p>
      )}
    </form>
  );
}
