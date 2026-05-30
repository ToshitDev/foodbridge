"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Utensils, Home, ArrowRight, Leaf, MapPin, CheckCircle, Clock, Package } from "lucide-react";
import ImpactCounter from "@/components/ImpactCounter";

// ── Mock UI previews for each demo step ──────────────────────────────────────

function PreviewPost() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 text-left">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Post a donation</p>
      {[
        { label: "Food item", value: "Chicken Biryani", delay: "0s" },
        { label: "Quantity", value: "20 portions", delay: "0.3s" },
        { label: "Pickup window", value: "6 PM – 8 PM", delay: "0.6s" },
      ].map(({ label, value, delay }) => (
        <div key={label}>
          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
          <div className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 overflow-hidden">
            <span
              className="inline-block"
              style={{
                animation: `typing 0.6s steps(${value.length}) forwards`,
                animationDelay: delay,
                maxWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                verticalAlign: "bottom",
              }}
            >
              {value}
            </span>
          </div>
        </div>
      ))}
      <button
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 ${
          done ? "bg-green-600 text-white scale-100" : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? "✓ Posted!" : "Post Donation"}
      </button>
    </div>
  );
}

function PreviewMap() {
  const pins = [
    { top: "30%", left: "25%", available: true },
    { top: "55%", left: "60%", available: true },
    { top: "70%", left: "30%", available: false },
    { top: "20%", left: "65%", available: true },
  ];
  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden relative" style={{ height: 200 }}>
      {/* fake map grid */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(#aaa 1px, transparent 1px), linear-gradient(90deg, #aaa 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-blue-50/60" />
      {pins.map((p, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{
            top: p.top, left: p.left,
            animation: `pinDrop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0,
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2"
            style={{
              background: p.available ? "#16a34a" : "#9ca3af",
              borderColor: p.available ? "#15803d" : "#6b7280",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          />
          <div className="w-0.5 h-2 bg-gray-400 opacity-50" />
        </div>
      ))}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2 py-1.5 text-xs space-y-1 shadow">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-600" />
          <span className="text-gray-600">Available (3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-gray-600">Claimed (1)</span>
        </div>
      </div>
    </div>
  );
}

function PreviewClaim() {
  const [status, setStatus] = useState<"idle" | "claiming" | "done">("idle");
  useEffect(() => {
    const t1 = setTimeout(() => setStatus("claiming"), 800);
    const t2 = setTimeout(() => setStatus("done"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 text-left">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500">Spice Garden</p>
          <p className="font-bold text-gray-800">Chicken Biryani</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-500 ${
          status === "done" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"
        }`}>
          {status === "done" ? "claimed" : "available"}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-500">
        <div className="flex items-center gap-2"><Package size={12} /><span>20 portions</span></div>
        <div className="flex items-center gap-2"><Clock size={12} /><span>6:00 PM – 8:00 PM</span></div>
      </div>
      {status === "done" ? (
        <div className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 flex items-center justify-center gap-2">
          <CheckCircle size={14} className="text-green-500" /> Claimed successfully
        </div>
      ) : (
        <button className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
          {status === "claiming" && (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {status === "claiming" ? "Claiming…" : "Claim Donation"}
        </button>
      )}
    </div>
  );
}

// ── Steps data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    role: "Restaurant",
    icon: Utensils,
    title: "Post surplus food",
    desc: "After service, restaurants log leftover food with a quantity and pickup window in seconds.",
    preview: <PreviewPost />,
  },
  {
    num: "02",
    role: "Shelter",
    icon: MapPin,
    title: "See donations on a live map",
    desc: "Shelters open a real-time map showing every available donation nearby — green means ready.",
    preview: <PreviewMap />,
  },
  {
    num: "03",
    role: "Shelter",
    icon: CheckCircle,
    title: "Claim in one tap",
    desc: "One tap claims a donation. The status updates instantly for everyone — no calls, no delays.",
    preview: <PreviewClaim />,
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { appUser, loading } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!loading && appUser) {
      router.replace(appUser.role === "restaurant" ? "/restaurant" : "/shelter");
    }
  }, [appUser, loading, router]);

  // Auto-advance steps every 3 s
  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const step = STEPS[activeStep];
  const StepIcon = step.icon;

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
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Real-time food rescue — live now
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl mb-4">
          Bridge the gap between{" "}
          <span className="text-green-600">surplus food</span> and{" "}
          <span className="text-green-600">those who need it</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10">
          Restaurants post surplus food. Shelters claim it in minutes. No waste, no hunger.
        </p>

        {/* Role buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-16">
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

      {/* ── Live Impact ── */}
      <ImpactCounter />

      {/* ── How it works ── */}
      <section className="bg-white border-t border-gray-100 px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest text-center mb-2">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
            From kitchen to shelter in minutes
          </h2>

          <div className="grid sm:grid-cols-2 gap-8 items-start">
            {/* Step selector */}
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = i === activeStep;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      active
                        ? "border-green-200 bg-green-50 shadow-sm"
                        : "border-transparent hover:border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${active ? "text-green-600" : "text-gray-300"}`}>
                          {s.num}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.role === "Restaurant"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-blue-50 text-blue-600"
                        }`}>
                          {s.role}
                        </span>
                      </div>
                      <p className={`font-semibold text-sm ${active ? "text-gray-900" : "text-gray-500"}`}>
                        {s.title}
                      </p>
                      {active && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Progress dots */}
              <div className="flex items-center gap-2 px-4 pt-2">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStep ? "bg-green-500 w-6" : "bg-gray-200 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview panel */}
            <div
              key={activeStep}
              className="rounded-2xl overflow-hidden"
              style={{ animation: "fadeSlideIn 0.35s ease forwards" }}
            >
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-2" />
                </div>
                {step.preview}
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pinDrop {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing {
          from { max-width: 0; }
          to   { max-width: 200px; }
        }
      `}</style>
    </main>
  );
}
