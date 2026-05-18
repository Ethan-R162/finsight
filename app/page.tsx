"use client";

import { useState } from "react";
import FinancialForm from "@/components/FinancialForm";
import ResultsCard from "@/components/ResultsCard";
import { FinancialResult } from "@/types/financial";

function FInsightLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 shadow-lg ring-1 ring-cyan-400/30">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-emerald-400/20 to-blue-500/20" />

        <svg
          viewBox="0 0 64 64"
          className="relative h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 45 L25 18 H53 L47 29 H30 L26 36 H43 L38 45 H10Z"
            fill="white"
          />
          <path
            d="M14 24 C22 9 43 7 54 19"
            stroke="url(#gradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="25" y="43" width="5" height="10" rx="1" fill="#22d3ee" />
          <rect x="34" y="37" width="5" height="16" rx="1" fill="#2dd4bf" />
          <rect x="43" y="31" width="5" height="22" rx="1" fill="#3b82f6" />

          <defs>
            <linearGradient id="gradient" x1="10" y1="10" x2="58" y2="24">
              <stop stopColor="#3b82f6" />
              <stop offset="0.5" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          FInsight
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
          Financial intelligence
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [result, setResult] = useState<FinancialResult | null>(null);

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-12 flex items-center justify-between">
          <FInsightLogo />

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur md:block">
            MVP Financial Decision Engine
          </div>
        </nav>

        <section className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Built for smarter financial decisions
            </div>

            <h2 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-6xl">
              Turn your financial life into a clear next move.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              FInsight analyzes income, assets, debt, expenses, risk tolerance,
              and time horizon to generate a simple financial recommendation.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Current model
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-cyan-300">PV</p>
                <p className="mt-1 text-xs text-slate-400">Income + debt</p>
              </div>

              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-emerald-300">Risk</p>
                <p className="mt-1 text-xs text-slate-400">User profile</p>
              </div>

              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-blue-300">Goal</p>
                <p className="mt-1 text-xs text-slate-400">Decision rules</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-2xl backdrop-blur">
            <FinancialForm onCalculate={setResult} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-2xl backdrop-blur">
            <ResultsCard result={result} />
          </div>
        </section>
      </div>
    </main>
  );
}