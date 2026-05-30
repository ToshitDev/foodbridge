"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  expectedDonationId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function QRScanner({ expectedDonationId, onSuccess, onClose }: Props) {
  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const divId = "foodbridge-qr-scanner";

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      if (!mounted) return;

      const scanner = new Html5QrcodeScanner(
        divId,
        { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
        false
      );

      scannerRef.current = scanner as unknown as { clear: () => Promise<void> };

      scanner.render(
        (decoded: string) => {
          // expected format: "foodbridge:<donationId>"
          const id = decoded.replace("foodbridge:", "");
          if (id === expectedDonationId) {
            scanner.clear().then(onSuccess).catch(onSuccess);
          }
        },
        () => { /* ignore individual frame errors */ }
      );
    })();

    return () => {
      mounted = false;
      scannerRef.current?.clear().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Scan Pickup QR Code</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-2">
            <div id={divId} className="w-full" />
          </div>
          <p className="text-xs text-gray-400 text-center pb-4 px-4">
            Point camera at the shelter&apos;s QR code to verify pickup
          </p>
        </div>
      </div>

      {/* Override html5-qrcode default styles to match our theme */}
      <style jsx global>{`
        #${divId} button {
          background: #16a34a !important;
          border-radius: 12px !important;
          border: none !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 8px 16px !important;
        }
        #${divId} select {
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          padding: 4px 8px !important;
        }
      `}</style>
    </>
  );
}
