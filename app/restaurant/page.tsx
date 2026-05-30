"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Donation } from "@/lib/types";
import DonationCard from "@/components/DonationCard";
import PostDonationForm from "@/components/PostDonationForm";
import ChatPanel from "@/components/ChatPanel";
import { Leaf, LogOut, PlusCircle, ChevronDown } from "lucide-react";

export default function RestaurantPage() {
  const { appUser, loading, logout } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [chatDonationId, setChatDonationId] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      timeoutRef.current = setTimeout(() => setTimedOut(true), 3000);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimedOut(false);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    if (!appUser) router.replace("/auth?role=restaurant");
    else if (appUser.role !== "restaurant") router.replace("/shelter");
  }, [appUser, loading, router]);

  useEffect(() => {
    if (!appUser) return;
    const q = query(collection(db, "donations"), where("restaurantId", "==", appUser.id));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation));
      setDonations(docs.sort((a, b) => b.createdAt - a.createdAt));
    });
    return unsub;
  }, [appUser]);

  const handleVerified = async (id: string) => {
    await updateDoc(doc(db, "donations", id), { status: "collected" });
  };

  if (loading || !appUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        {timedOut ? (
          <div className="text-center px-6">
            <p className="text-gray-800 font-semibold mb-1">Taking too long…</p>
            <p className="text-gray-500 text-sm mb-4">
              Could not load your account. Check your Firestore security rules or internet connection.
            </p>
            <button onClick={() => router.replace("/auth?role=restaurant")}
              className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors">
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const counts = {
    available: donations.filter((d) => d.status === "available").length,
    claimed:   donations.filter((d) => d.status === "claimed").length,
    collected: donations.filter((d) => d.status === "collected").length,
  };

  const chatDonation = chatDonationId ? donations.find((d) => d.id === chatDonationId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={13} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 leading-none">FoodBridge</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">{appUser.name}</p>
            </div>
          </div>
          <button onClick={async () => { await logout(); router.push("/"); }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Available", count: counts.available, color: "text-green-700 bg-green-50 border-green-100" },
            { label: "Claimed",   count: counts.claimed,   color: "text-gray-600  bg-gray-50  border-gray-200"  },
            { label: "Collected", count: counts.collected, color: "text-blue-700  bg-blue-50  border-blue-100"  },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-2xl border p-3 text-center ${color}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Post form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowForm((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-2.5">
              <PlusCircle size={18} className="text-green-600" />
              <span className="font-semibold text-gray-900">Post a donation</span>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${showForm ? "rotate-180" : ""}`} />
          </button>
          {showForm && (
            <div className="px-5 pb-5 border-t border-gray-50">
              <div className="pt-4">
                <PostDonationForm onPosted={() => setShowForm(false)} />
              </div>
            </div>
          )}
        </div>

        {/* Donations list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Donations</h2>
          {donations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">No donations yet. Post your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  showChat={d.status === "claimed" || d.status === "collected"}
                  onChat={setChatDonationId}
                  hasUnread={d.hasUnreadForRestaurant === true}
                  showVerify={d.status === "claimed"}
                  onVerified={handleVerified}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {chatDonation && (
        <ChatPanel
          donationId={chatDonation.id}
          donationTitle={chatDonation.foodItem}
          restaurantName={chatDonation.restaurantName}
          currentUser={appUser}
          onClose={() => setChatDonationId(null)}
        />
      )}
    </div>
  );
}
