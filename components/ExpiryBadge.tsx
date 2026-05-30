"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface Props {
  expiresAt: number;
}

function getRemaining(expiresAt: number) {
  const diff = expiresAt - Date.now();
  return {
    diff,
    expired: diff <= 0,
    minutes: Math.max(0, Math.floor(diff / 60_000)),
    seconds: Math.max(0, Math.floor((diff % 60_000) / 1000)),
  };
}

export default function ExpiryBadge({ expiresAt }: Props) {
  const [rem, setRem] = useState(getRemaining(expiresAt));

  useEffect(() => {
    const id = setInterval(() => setRem(getRemaining(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (rem.expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
        <Timer size={10} />
        Expired
      </span>
    );
  }

  const style =
    rem.diff > 30 * 60_000
      ? "bg-green-50 text-green-700"
      : rem.diff > 10 * 60_000
      ? "bg-orange-50 text-orange-600"
      : "bg-red-50 text-red-600 animate-pulse";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${style}`}>
      <Timer size={10} />
      {rem.minutes}m {String(rem.seconds).padStart(2, "0")}s
    </span>
  );
}
