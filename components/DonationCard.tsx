"use client";

import { useState } from "react";
import { Donation } from "@/lib/types";
import { Clock, Package, MapPin, MessageCircle, Loader2, QrCode, ScanLine } from "lucide-react";
import ExpiryBadge from "./ExpiryBadge";
import TagPill from "./TagPill";
import QRCodeDisplay from "./QRCodeDisplay";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("./QRScanner"), { ssr: false });

interface Props {
  donation: Donation;
  onClaim?: (id: string) => void;
  showClaim?: boolean;
  claiming?: boolean;
  onChat?: (id: string) => void;
  showChat?: boolean;
  hasUnread?: boolean;
  showQR?: boolean;          // shelter: show QR code for claimed donations
  showVerify?: boolean;      // restaurant: show "Verify Pickup" scanner button
  onVerified?: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  claimed:   "bg-gray-100  text-gray-600",
  collected: "bg-blue-100  text-blue-700",
};

export default function DonationCard({
  donation, onClaim, showClaim, claiming,
  onChat, showChat, hasUnread,
  showQR, showVerify, onVerified,
}: Props) {
  const [qrOpen, setQrOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{donation.restaurantName}</p>
            <p className="text-base font-bold text-gray-800 mt-0.5 truncate">{donation.foodItem}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyles[donation.status]}`}>
            {donation.status}
          </span>
        </div>

        {/* Tags */}
        {donation.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {donation.tags.map((t) => <TagPill key={t} tag={t} />)}
          </div>
        )}

        {/* Details */}
        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-gray-400 shrink-0" />
            <span>{donation.quantity}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400 shrink-0" />
            <span>{donation.pickupWindow}</span>
          </div>
          {donation.address && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              <span className="truncate">{donation.address}</span>
            </div>
          )}
          {/* Countdown — only for available/claimed with future expiry */}
          {donation.expiresAt && donation.status !== "collected" && (
            <div className="flex items-center gap-2">
              <ExpiryBadge expiresAt={donation.expiresAt} />
            </div>
          )}
        </div>

        {/* QR code (shelter, expanded) */}
        {showQR && qrOpen && (
          <div className="border-t border-gray-50 pt-3">
            <QRCodeDisplay donationId={donation.id} />
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap gap-2 mt-1">
          {showClaim && donation.status === "available" && (
            <button
              onClick={() => !claiming && onClaim?.(donation.id)}
              disabled={claiming}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {claiming && <Loader2 size={14} className="animate-spin" />}
              {claiming ? "Claiming…" : "Claim Donation"}
            </button>
          )}

          {showQR && donation.status !== "available" && (
            <button
              onClick={() => setQrOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
            >
              <QrCode size={15} />
              {qrOpen ? "Hide QR" : "Show QR"}
            </button>
          )}

          {showChat && (
            <button
              onClick={() => onChat?.(donation.id)}
              className="relative flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
            >
              <MessageCircle size={15} />
              Chat
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          )}

          {showVerify && donation.status === "claimed" && (
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
            >
              <ScanLine size={15} />
              Verify Pickup
            </button>
          )}
        </div>
      </div>

      {/* QR scanner modal */}
      {scannerOpen && (
        <QRScanner
          expectedDonationId={donation.id}
          onSuccess={() => { setScannerOpen(false); onVerified?.(donation.id); }}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </>
  );
}
