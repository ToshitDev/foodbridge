"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Utensils, Home, ArrowRight, Leaf } from "lucide-react";

export default function LandingPage() {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && appUser) {
      router.replace(appUser.role === "restaurant" ? "/restaurant" : "/shelter");
    }
  }, [appUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">FoodBridge</span>
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Real-time food sharing across Hyderabad
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl mb-4">
          Bridge the gap between{" "}
          <span className="text-green-600">surplus food</span> and{" "}
          <span className="text-green-600">those who need it</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-12">
          Restaurants post surplus food. Shelters claim it in minutes. No waste, no hunger.
        </p>

        {/* Role buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => router.push("/auth?role=restaurant")}
            className="flex-1 flex items-center justify-between gap-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-green-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Utensils size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm opacity-80 font-normal">I run a</p>
                <p className="text-base">Restaurant</p>
              </div>
            </div>
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/auth?role=shelter")}
            className="flex-1 flex items-center justify-between gap-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-gray-100 border border-gray-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <Home size={18} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-400 font-normal">I manage a</p>
                <p className="text-base">Shelter</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-t border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-center gap-10 flex-wrap">
          {[
            { val: "Zero", label: "food wasted" },
            { val: "Real-time", label: "donation updates" },
            { val: "Free", label: "forever" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-gray-900">{val}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
