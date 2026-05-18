"use client";

import { useState } from "react";
import FinancialForm from "@/components/FinancialForm";
import ResultsCard from "@/components/ResultsCard";
import AICoachBubble from "@/components/AICoachBubble";
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
      formula:
        "Net Position = Income PV + Current Assets − Debt PV − Expense PV",
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
    "Default discount rate: 5%, adjustable by the user",
    "Default base income growth: 2%, adjustable by the user",
    "Default expense growth / inflation rate: 2.5%, adjustable by the user",
    "Default expected investment return: 6%, adjustable by the user",
    "Default Monte Carlo simulation count: 1,000 trials, adjustable by the user",
    "Emergency fund target: at least 3 months of expenses",
    "High-interest credit card debt threshold: 15% APR",
    "Sensitivity analysis is built around the user's selected discount rate and income growth assumptions",
    "Monte Carlo simulation randomizes income growth, discount rate, investment return, and expense growth",
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
          horizon, and goal fit. The model also includes user-adjustable
          assumptions for discount rate, income growth, expense growth, expected
          investment return, and Monte Carlo simulation count.
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
              The model tests how net position changes around the user's
              selected income growth and discount rate assumptions. This shows
              how sensitive the recommendation is to changes in core financial
              assumptions.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <p className="font-semibold text-white">Monte Carlo Simulation</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The model runs a user-selected number of randomized simulations by
              changing income growth, discount rate, investment return, and
              expense growth. The output shows probability of positive net
              position, downside case, median case, and upside case.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputLandingPage({
  onCalculate,
}: {
  onCalculate: (result: FinancialResult) => void;
}) {
  return (
    <>
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
            time horizon, and adjustable model assumptions to generate a
            financial recommendation with sensitivity and Monte Carlo outputs.
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

      <section className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-2xl backdrop-blur">
          <FinancialForm onCalculate={onCalculate} />
        </div>
      </section>

      <ModelMethodology />
    </>
  );
}

function DashboardPage({
  result,
  onReset,
}: {
  result: FinancialResult;
  onReset: () => void;
}) {
  const showHousingData =
    result.goal === "buy_house" || result.goal === "rent_vs_buy";

  return (
    <>
      <section className="mb-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-950 to-emerald-400/10 p-5 shadow-2xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                FInsight Dashboard
              </p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
                Financial Model Results
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Your intake has been converted into a dashboard with present
                value outputs, recommendation logic, scenario analysis, Monte
                Carlo simulation, model audit, and AI model coaching.
                {showHousingData && " Housing NPV is included for this goal."}
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.09]"
            >
              Back to Edit Inputs
            </button>
          </div>

          <div
            className={`mt-6 grid gap-3 ${
              showHousingData ? "md:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Score
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {result.score.totalScore}/100
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Net Position
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  result.netPosition >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(result.netPosition)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Positive Probability
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-300">
                {(result.monteCarloResult.probabilityPositive * 100).toFixed(0)}
                %
              </p>
            </div>

            {showHousingData && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Buy/Rent Signal
                </p>
                <p className="mt-2 text-2xl font-bold uppercase text-teal-300">
                  {result.buyRentAnalysis.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-2xl backdrop-blur">
        <ResultsCard result={result} onReset={onReset} />
      </section>

      <ModelMethodology />
    </>
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
            AI-Powered Financial Modeling Engine
          </div>
        </nav>

        {!result ? (
          <InputLandingPage onCalculate={setResult} />
        ) : (
          <DashboardPage result={result} onReset={() => setResult(null)} />
        )}
      </div>

      <AICoachBubble result={result} />
    </main>
  );
}