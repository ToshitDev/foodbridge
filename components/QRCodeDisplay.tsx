"use client";

import { useEffect, useState } from "react";

export default function QRCodeDisplay({ donationId }: { donationId: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    import("qrcode").then((mod) => {
      const QRCode = mod.default ?? mod;
      (QRCode as { toDataURL: (s: string, o: object) => Promise<string> })
        .toDataURL(`foodbridge:${donationId}`, { width: 180, margin: 1, color: { dark: "#15803d", light: "#ffffff" } })
        .then(setDataUrl);
    });
  }, [donationId]);

  if (!dataUrl) {
    return <div className="w-[180px] h-[180px] bg-gray-100 rounded-xl animate-pulse mx-auto" />;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={dataUrl} alt="Pickup QR code" className="w-[180px] h-[180px] rounded-xl border border-gray-200" />
      <p className="text-xs text-gray-400">Show this to the restaurant for pickup</p>
    </div>
  );
}
