"use client";

import Link from "next/link";
import { useState } from "react";
import FinancialForm from "@/components/FinancialForm";
import ResultsCard from "@/components/ResultsCard";
import AICoachBubble from "@/components/AICoachBubble";
import { FinancialInput, FinancialResult } from "@/types/financial";
import { defaultFinancialInput } from "@/lib/defaultFinancialInput";

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

function MethodologyButton() {
  return (
    <Link
      href="/methodology"
      className="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
    >
      View Methodology
    </Link>
  );
}

function InputLandingPage({
  form,
  setForm,
  onCalculate,
}: {
  form: FinancialInput;
  setForm: React.Dispatch<React.SetStateAction<FinancialInput>>;
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

          <div className="mt-6">
            <MethodologyButton />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Current model
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Present value logic, risk testing, and goal-based decision rules.
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
          <FinancialForm
            form={form}
            setForm={setForm}
            onCalculate={onCalculate}
          />
        </div>
      </section>
    </>
  );
}

function DashboardPage({
  result,
  onBackToEdit,
  onStartOver,
}: {
  result: FinancialResult;
  onBackToEdit: () => void;
  onStartOver: () => void;
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <MethodologyButton />

              <button
                type="button"
                onClick={onBackToEdit}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.09]"
              >
                Back to Edit Inputs
              </button>

              <button
                type="button"
                onClick={onStartOver}
                className="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/20"
              >
                Start Over
              </button>
            </div>
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
        <ResultsCard result={result} onReset={onBackToEdit} />
      </section>
    </>
  );
}

export default function Home() {
  const [form, setForm] = useState<FinancialInput>(defaultFinancialInput);
  const [result, setResult] = useState<FinancialResult | null>(null);
  const [isEditing, setIsEditing] = useState(true);

  function handleCalculate(calculatedResult: FinancialResult) {
    setResult(calculatedResult);
    setIsEditing(false);
  }

  function handleBackToEdit() {
    setIsEditing(true);
  }

  function handleStartOver() {
    setForm(defaultFinancialInput);
    setResult(null);
    setIsEditing(true);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-12 flex items-center justify-between gap-4">
          <FInsightLogo />

          <div className="flex items-center gap-3">
            <Link
              href="/methodology"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Methodology
            </Link>

            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur md:block">
              AI-Powered Financial Modeling Engine
            </div>
          </div>
        </nav>

        {isEditing ? (
          <InputLandingPage
            form={form}
            setForm={setForm}
            onCalculate={handleCalculate}
          />
        ) : result ? (
          <DashboardPage
            result={result}
            onBackToEdit={handleBackToEdit}
            onStartOver={handleStartOver}
          />
        ) : (
          <InputLandingPage
            form={form}
            setForm={setForm}
            onCalculate={handleCalculate}
          />
        )}
      </div>

      <AICoachBubble result={result} />
    </main>
  );
}