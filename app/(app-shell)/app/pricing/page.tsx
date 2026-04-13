"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";

const tiers = [
  {
    name: "Free",
    priceUSD: "$0",
    priceINR: "₹0",
    period: "",
    description: "Get started",
    cta: "Current Plan",
    ctaStyle: "bg-slate-100 text-slate-500 cursor-default",
    features: [
      { text: "Onboarding + Career Snapshot", included: true },
      { text: "Basic CAII score (1/month)", included: true },
      { text: "5 coach sessions/month", included: true },
      { text: "10 wins tracked", included: true },
      { text: "Career Book", included: false },
      { text: "Bridge Builder", included: false },
      { text: "PMAP Summary", included: false },
    ],
  },
  {
    name: "Pro",
    priceUSD: "$19",
    priceINR: "₹499",
    period: "/month",
    description: "Full career navigation",
    popular: true,
    cta: "Upgrade to Pro",
    ctaStyle: "bg-teal-600 text-white hover:bg-teal-700",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited AI Coach", included: true, bold: true },
      { text: "Full CAII report (task-level)", included: true },
      { text: "Full Roadmap with milestones", included: true },
      { text: "Unlimited wins tracking", included: true },
      { text: "Bridge Builder", included: true },
      { text: "Quarterly Career Book (PDF)", included: true },
      { text: "PMAP Summary generation", included: true },
    ],
  },
  {
    name: "Career Bible",
    priceUSD: "$49",
    priceINR: "₹1,499",
    period: " one-time",
    description: "Your personalized book",
    cta: "Get Your Book",
    ctaStyle: "bg-amber-500 text-white hover:bg-amber-600",
    features: [
      { text: "1 month Pro included", included: true },
      { text: "16-chapter Career Book", included: true, bold: true },
      { text: "PDF + interactive web version", included: true },
      { text: "Personalized to YOUR data", included: true },
      { text: "Printed hardcover", included: false },
      { text: "AI-narrated audiobook", included: false },
    ],
  },
  {
    name: "Premium",
    priceUSD: "$99",
    priceINR: "₹2,999",
    period: " one-time",
    description: "The complete package",
    dark: true,
    cta: "Go Premium",
    ctaStyle: "bg-white text-teal-700 hover:bg-indigo-50",
    features: [
      { text: "Everything in Career Bible", included: true },
      { text: "Printed hardcover book", included: true, bold: true },
      { text: "AI-narrated audiobook", included: true, bold: true },
      { text: "Lifetime web version updates", included: true },
      { text: "Your name on the cover", included: true },
      { text: "Shipped to your door", included: true },
    ],
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  return (
    <AppShell>
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Choose Your Plan</h1>
          <p className="text-slate-500">Invest in your career. Get your personalized Career Bible.</p>

          {/* Currency toggle */}
          <div className="inline-flex mt-6 bg-slate-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 text-xs font-semibold transition ${currency === "USD" ? "bg-teal-600 text-white" : "text-slate-500"}`}
            >
              USD $
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`px-4 py-2 text-xs font-semibold transition ${currency === "INR" ? "bg-teal-600 text-white" : "text-slate-500"}`}
            >
              INR ₹
            </button>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 ${
                tier.dark
                  ? "bg-gradient-to-b from-slate-800 to-slate-900 text-white"
                  : "bg-white border border-slate-200"
              } ${tier.popular ? "border-2 border-teal-500 shadow-lg" : ""}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              <div className={`text-sm font-bold ${tier.dark ? "text-indigo-300" : tier.popular ? "text-teal-600" : "text-slate-700"}`}>
                {tier.name}
              </div>

              <div className="mt-2">
                <span className="text-3xl font-extrabold">
                  {currency === "USD" ? tier.priceUSD : tier.priceINR}
                </span>
                {tier.period && (
                  <span className={`text-sm ${tier.dark ? "text-slate-400" : "text-slate-500"}`}>
                    {tier.period}
                  </span>
                )}
              </div>

              <div className={`text-xs mt-1 mb-5 ${tier.dark ? "text-slate-400" : "text-slate-500"}`}>
                {tier.description}
              </div>

              <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${tier.ctaStyle}`}>
                {tier.cta}
              </button>

              <div className="mt-5 space-y-2.5">
                {tier.features.map((f, i) => (
                  <div
                    key={i}
                    className={`text-xs flex items-start gap-2 ${
                      f.included
                        ? tier.dark ? "text-slate-300" : "text-slate-700"
                        : tier.dark ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    <span>{f.included ? "✓" : "✗"}</span>
                    <span className={f.bold ? "font-semibold" : ""}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rebuilder Pack */}
        <div className="mt-8 bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="text-sm font-bold text-rose-600 mb-1">🔥 Rebuilder Emergency Pack</div>
            <div className="text-2xl font-extrabold text-slate-900">
              {currency === "USD" ? "$39" : "₹999"} <span className="text-sm font-normal text-slate-500">one-time</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Just laid off? Get immediate help: Rapid Response onboarding + instant CAII report + 30 days unlimited AI Coach + Career Book (PDF).
            </p>
          </div>
          <button className="px-8 py-3 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition whitespace-nowrap">
            Get Emergency Pack
          </button>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/app/dashboard" className="text-sm text-teal-600 font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
