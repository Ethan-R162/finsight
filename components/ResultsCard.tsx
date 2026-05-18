"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FinancialResult } from "@/types/financial";
import { downloadTextReport } from "@/lib/report";

type Props = {
  result: FinancialResult | null;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyan-300">{value}/25</span>
      </div>

      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
          style={{ width: `${(value / 25) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsCard({ result }: Props) {
  if (!result) {
    return (
      <div className="min-h-full rounded-[1.35rem] bg-slate-950/80 p-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Output
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Results</h2>
          <p className="mt-2 text-sm text-slate-400">
            Complete the questionnaire to generate your financial snapshot.
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20">
            <span className="text-2xl">↗</span>
          </div>
          <p className="text-slate-300">
            Your recommendation will appear here.
          </p>
        </div>
      </div>
    );
  }

  const isPositive = result.netPosition >= 0;

  const chartData = [
    {
      name: "Income PV",
      value: Math.round(result.incomePV),
    },
    {
      name: "Assets",
      value: Math.round(result.assetValue),
    },
    {
      name: "Debt PV",
      value: Math.round(result.debtPV),
    },
    {
      name: "Expense PV",
      value: Math.round(result.expensePV),
    },
  ];

  return (
    <div className="min-h-full space-y-6 rounded-[1.35rem] bg-slate-950/80 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Output
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Results</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your financial position based on the current model inputs.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-emerald-400/10 p-6">
        <p className="text-sm text-slate-400">Financial Readiness Score</p>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-5xl font-bold text-white">
            {result.score.totalScore}
          </p>
          <p className="pb-2 text-slate-400">/ 100</p>
        </div>

        <div className="mt-4 h-3 rounded-full bg-white/10">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
            style={{ width: `${result.score.totalScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Score Breakdown
        </p>

        <ScoreBar
          label="Emergency Fund"
          value={result.score.emergencyFundScore}
        />
        <ScoreBar label="Debt Health" value={result.score.debtHealthScore} />
        <ScoreBar
          label="Asset Strength"
          value={result.score.assetStrengthScore}
        />
        <ScoreBar label="Goal Fit" value={result.score.goalFitScore} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-slate-400">
          Financial Snapshot
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                }}
              />
              <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <p className="text-sm text-slate-400">Net Position</p>
        <p
          className={`mt-2 text-4xl font-bold ${
            isPositive ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {formatCurrency(result.netPosition)}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MetricCard label="Income PV" value={formatCurrency(result.incomePV)} />
        <MetricCard label="Assets" value={formatCurrency(result.assetValue)} />
        <MetricCard label="Debt PV" value={formatCurrency(result.debtPV)} />
        <MetricCard
          label="Expense PV"
          value={formatCurrency(result.expensePV)}
        />
      </div>

      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
          Recommendation
        </p>
        <p className="mt-3 leading-7 text-slate-100">
          {result.recommendation}
        </p>
      </div>
      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
  <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
    Priority Action Plan
  </p>

  <div className="mt-4 space-y-3">
    {result.actionPlan.map((action, index) => (
      <div
        key={action}
        className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-bold text-emerald-300">
          {index + 1}
        </div>

        <p className="text-sm leading-6 text-slate-100">{action}</p>
      </div>
    ))}
  </div>
</div>
<div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
  <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
    Scenario Comparison
  </p>

  <div className="mt-4 grid gap-3 md:grid-cols-2">
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        Current Plan
      </p>
      <p className="mt-2 text-xl font-semibold text-white">
        {formatCurrency(result.scenarioComparison.currentNetPosition)}
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        Improved Plan
      </p>
      <p className="mt-2 text-xl font-semibold text-emerald-300">
        {formatCurrency(result.scenarioComparison.improvedNetPosition)}
      </p>
    </div>
  </div>

  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
      Difference
    </p>
    <p className="mt-2 text-2xl font-bold text-cyan-300">
      {formatCurrency(result.scenarioComparison.difference)}
    </p>
    <p className="mt-3 text-sm leading-6 text-slate-300">
      {result.scenarioComparison.summary}
    </p>
  </div>
</div>
<button
  type="button"
  onClick={() => downloadTextReport(result)}
  className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
>
  Download Report
</button>
      <p className="text-xs leading-5 text-slate-500">
        FInsight is for educational purposes only and does not provide
        financial, investment, tax, or legal advice.
      </p>
    </div>
  );
}