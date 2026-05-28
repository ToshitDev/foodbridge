"use client";

import { Donation } from "@/lib/types";
import { Clock, Package, Users, Loader2 } from "lucide-react";

interface Props {
  donation: Donation;
  onClaim?: (id: string) => void;
  showClaim?: boolean;
  claiming?: boolean;
}

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  claimed: "bg-gray-100 text-gray-600",
  collected: "bg-blue-100 text-blue-700",
};

export default function DonationCard({ donation, onClaim, showClaim, claiming }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{donation.restaurantName}</p>
          <p className="text-base font-bold text-gray-800 mt-0.5">{donation.foodItem}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyles[donation.status]}`}>
          {donation.status}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-gray-400 shrink-0" />
          <span>{donation.quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400 shrink-0" />
          <span>{donation.pickupWindow}</span>
        </div>
        {donation.claimedBy && (
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">Claimed</span>
          </div>
        )}
      </div>

      {showClaim && donation.status === "available" && (
        <button
          onClick={() => !claiming && onClaim?.(donation.id)}
          disabled={claiming}
          className="mt-1 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {claiming && <Loader2 size={14} className="animate-spin" />}
          {claiming ? "Claiming…" : "Claim Donation"}
        </button>
      )}
    </div>
  );
}
