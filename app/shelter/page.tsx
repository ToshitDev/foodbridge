"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Donation } from "@/lib/types";
import DonationCard from "@/components/DonationCard";
import { Leaf, LogOut, Map as MapIcon, List } from "lucide-react";
import dynamic from "next/dynamic";

const DonationMap = dynamic(() => import("@/components/Map"), { ssr: false });

const MAP_HEIGHT = "calc(100vh - 57px)";

export default function ShelterPage() {
  const { appUser, loading, logout } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [view, setView] = useState<"map" | "list">("map");
  // store ID only — derive the live donation object from the donations array
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlighted = highlightedId
    ? donations.find((d) => d.id === highlightedId) ?? null
    : null;

  // Show an error after 3 s if auth hasn't resolved
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
    if (!appUser) router.replace("/auth?role=shelter");
    else if (appUser.role !== "shelter") router.replace("/restaurant");
  }, [appUser, loading, router]);

  useEffect(() => {
    if (!appUser) return;

    const q = query(collection(db, "donations"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation));
      setDonations(docs.sort((a, b) => b.createdAt - a.createdAt));
    });
    return unsub;
  }, [appUser]);

  const claimDonation = async (id: string) => {
    if (!appUser) return;
    setClaiming(id);
    try {
      await updateDoc(doc(db, "donations", id), {
        status: "claimed",
        claimedBy: appUser.id,
      });
    } finally {
      setClaiming(null);
    }
  };

  const handlePinClick = useCallback((d: Donation) => {
    setHighlightedId(d.id);
    setView("list");
  }, []);

  if (loading || !appUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        {timedOut ? (
          <div className="text-center px-6">
            <p className="text-gray-800 font-semibold mb-1">Taking too long…</p>
            <p className="text-gray-500 text-sm mb-4">
              Could not load your account. Check your Firestore security rules or internet connection.
            </p>
            <button
              onClick={() => router.replace("/auth?role=shelter")}
              className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const available = donations.filter((d) => d.status === "available");
  const claimed = donations.filter((d) => d.status !== "available");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {([
                { id: "map", icon: MapIcon },
                { id: "list", icon: List },
              ] as const).map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === id ? "bg-white shadow text-gray-900" : "text-gray-400"
                  }`}
                >
                  <Icon size={13} />
                  <span className="capitalize">{id}</span>
                </button>
              ))}
            </div>
            <button
              onClick={async () => { await logout(); router.push("/"); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Map view */}
      {view === "map" && (
        // relative + explicit height so the absolute-inset-0 map div fills it correctly
        <div className="relative" style={{ height: MAP_HEIGHT }}>
          <DonationMap donations={donations} onPinClick={handlePinClick} />
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 flex flex-col gap-1.5 z-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-green-700" />
              <span className="text-xs text-gray-600 font-medium">Available ({available.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-gray-500" />
              <span className="text-xs text-gray-600 font-medium">Claimed ({claimed.length})</span>
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
          {highlighted && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Selected from map
                </h2>
                <button
                  onClick={() => setHighlightedId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              <DonationCard
                donation={highlighted}
                showClaim
                claiming={claiming === highlighted.id}
                onClaim={claimDonation}
              />
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Available ({available.length})
            </h2>
            {available.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">No available donations right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {available.map((d) => (
                  <DonationCard
                    key={d.id}
                    donation={d}
                    showClaim
                    claiming={claiming === d.id}
                    onClaim={claimDonation}
                  />
                ))}
              </div>
            )}
          </div>

          {claimed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Claimed / Collected ({claimed.length})
              </h2>
              <div className="space-y-3">
                {claimed.map((d) => (
                  <DonationCard key={d.id} donation={d} />
                ))}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
