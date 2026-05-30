"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Stats {
  meals: number;
  active: number;
  shelters: number;
}

function useCountUp(target: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target]);
  return count;
}

function StatBlock({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const displayed = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-0.5">
        <span className="text-4xl font-extrabold text-green-600 tabular-nums leading-none">{displayed}</span>
        {suffix && <span className="text-lg font-bold text-green-500 mb-0.5">{suffix}</span>}
      </div>
      <p className="text-sm text-gray-500 font-medium text-center">{label}</p>
    </div>
  );
}

export default function ImpactCounter() {
  const [stats, setStats] = useState<Stats>({ meals: 0, active: 0, shelters: 0 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "donations"), (snap) => {
      let meals = 0;
      let active = 0;
      const shelterIds = new Set<string>();

      snap.docs.forEach((doc) => {
        const d = doc.data();
        if (d.status === "collected") meals += parseInt(d.quantity) || 0;
        if (d.status === "available") active++;
        if (d.claimedBy) shelterIds.add(d.claimedBy as string);
      });

      setStats({ meals, active, shelters: shelterIds.size });
    });
    return unsub;
  }, []);

  return (
    <section className="bg-white border-t border-b border-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-bold text-green-600 uppercase tracking-widest text-center mb-2">
          Live Impact
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-8">
          Happening right now
        </h2>
        <div className="grid grid-cols-3 gap-6 sm:gap-10">
          <StatBlock value={stats.meals}    label="Meals rescued"        suffix="+" />
          <StatBlock value={stats.active}   label="Active donations"               />
          <StatBlock value={stats.shelters} label="Shelters served"                />
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs text-gray-400">Updates in real-time</p>
        </div>
      </div>
    </section>
  );
}
