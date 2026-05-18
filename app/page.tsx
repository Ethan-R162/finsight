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
function ModelMethodology() {
  const formulas = [
    {
      title: "Net Position",
      formula: "Net Position = Income PV + Current Assets − Debt PV − Expense PV",
      description:
        "This is the core output of the model. It combines future income, existing assets, liabilities, and projected expenses into one financial position estimate.",
    },
    {
      title: "Income Present Value",
      formula: "Income PV = Σ Projected Income_t / (1 + discount rate)^t",
      description:
        "Future income is projected forward and discounted back to today to estimate its present value.",
    },
    {
      title: "Debt Present Value",
      formula: "Debt PV = Payment × [1 − (1 + r)^−n] / r",
      description:
        "Debt payments are discounted using a loan present value formula so liabilities can be compared against assets and income.",
    },
    {
      title: "Financial Readiness Score",
      formula:
        "Score = Emergency Fund + Debt Health + Asset Strength + Goal Fit",
      description:
        "The score converts the model output into a 100-point readiness measure across four financial categories.",
    },
  ];

  const assumptions = [
    "Base discount rate: 5%",
    "Base income growth: 2% plus industry adjustment",
    "Emergency fund target: at least 3 months of expenses",
    "High-interest credit card debt threshold: 15% APR",
    "Sensitivity analysis tests income growth from 1% to 4%",
    "Sensitivity analysis tests discount rates from 4% to 7%",
    "Monte Carlo simulation runs 1,000 randomized trials",
  ];

  const limitations = [
    "The model does not include taxes.",
    "The model does not use live market, mortgage, or inflation data.",
    "The model uses simplified assumptions for educational purposes.",
    "The model does not replace a financial advisor.",
    "The model does not provide legal, tax, investment, or financial advice.",
  ];

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Model Documentation
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">
          Model Methodology
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          FInsight is built as a financial modeling tool that converts user
          inputs into present value estimates, stress-tests assumptions, and
          generates a recommendation based on net position, risk tolerance, time
          horizon, and goal fit.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {formulas.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
          >
            <p className="text-sm font-semibold text-cyan-300">
              {item.title}
            </p>
            <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-sm text-emerald-300">
              {item.formula}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
            Key Assumptions
          </p>

          <div className="mt-4 space-y-3">
            {assumptions.map((assumption) => (
              <div
                key={assumption}
                className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200"
              >
                {assumption}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-300">
            Model Limitations
          </p>

          <div className="mt-4 space-y-3">
            {limitations.map((limitation) => (
              <div
                key={limitation}
                className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200"
              >
                {limitation}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-purple-300">
          Advanced Modeling Features
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="font-semibold text-white">Sensitivity Analysis</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The model tests how net position changes across different income
              growth and discount rate assumptions. This shows how sensitive the
              recommendation is to changes in core financial assumptions.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="font-semibold text-white">Monte Carlo Simulation</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The model runs 1,000 randomized simulations by changing income
              growth, discount rate, investment return, and expense growth. The
              output shows probability of positive net position, downside case,
              median case, and upside case.
            </p>
          </div>
        </div>
      </div>
    </section>
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
        
        <ModelMethodology />
      </div>
    </main>
  );
}