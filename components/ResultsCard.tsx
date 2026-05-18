"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FinancialResult } from "@/types/financial";
import { downloadPDFReport } from "@/lib/report";

type Props = {
  result: FinancialResult | null;
  onReset?: () => void;
};

type DashboardTab =
  | "overview"
  | "goal"
  | "risk"
  | "assumptions"
  | "audit"
  | "report";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function formatChartCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`;
  }

  return `$${value}`;
}

function formatAuditStatus(status: string) {
  if (status === "healthy") return "Healthy";
  if (status === "watch") return "Watch";
  return "Risky";
}

function getGoalLabel(goal: string) {
  if (goal === "buy_house") return "Buy House";
  if (goal === "rent_vs_buy") return "Rent vs Buy";
  if (goal === "scholarship") return "Scholarship ROI";
  if (goal === "retirement") return "Retirement";
  if (goal === "invest_assets") return "Investing";
  return "Goal";
}

function getGoalStatusLabel(status: string) {
  if (status === "strong") return "Strong";
  if (status === "watch") return "Watch";
  return "Risky";
}

function getAuditBadgeClass(severity: string) {
  if (severity === "strong") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (severity === "warning") {
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  }

  if (severity === "risk") {
    return "border-red-400/30 bg-red-400/10 text-red-300";
  }

  return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";
}

function getStatusClass(status: string) {
  if (status === "healthy" || status === "strong") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "watch") {
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  }

  return "border-red-400/30 bg-red-400/10 text-red-300";
}

function getScenarioClass(status: string) {
  if (status === "strong") {
    return "border-emerald-400/20 bg-emerald-400/10";
  }

  if (status === "watch") {
    return "border-yellow-400/20 bg-yellow-400/10";
  }

  return "border-red-400/20 bg-red-400/10";
}

function getDriverImpactClass(impact: number) {
  if (impact > 0) return "text-emerald-300";
  if (impact < 0) return "text-red-300";
  return "text-slate-400";
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-white">{value}</p>

      {detail && (
        <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
      )}
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

function GoalScoreBar({ value }: { value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">Goal Model Score</span>
        <span className="text-cyan-300">{value}/100</span>
      </div>

      <div className="h-3 rounded-full bg-white/10">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsCard({ result }: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

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
  const goalAnalysis = result.goalAnalysis;

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

  const tabs: { id: DashboardTab; label: string; description: string }[] = [
    {
      id: "overview",
      label: "Overview",
      description: "Score, recommendation, and snapshot.",
    },
    {
      id: "goal",
      label: getGoalLabel(result.goal),
      description: "Goal model, drivers, and scenarios.",
    },
    {
      id: "risk",
      label: "Risk",
      description: "Sensitivity and Monte Carlo.",
    },
    {
      id: "assumptions",
      label: "Assumptions",
      description: "Growth, discount, and model settings.",
    },
    {
      id: "audit",
      label: "Audit",
      description: "Input quality and risk flags.",
    },
    {
      id: "report",
      label: "Report",
      description: "Download your PDF.",
    },
  ];

  return (
    <div className="space-y-6 rounded-[1.35rem] bg-slate-950/80 p-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                <span className="block font-semibold">{tab.label}</span>
                <span
                  className={`mt-1 block text-xs ${
                    isActive ? "text-white/80" : "text-slate-500"
                  }`}
                >
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-emerald-400/10 p-6">
              <p className="text-sm text-slate-400">
                Financial Readiness Score
              </p>

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

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Recommendation
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-100">
                {result.recommendation}
              </p>
            </div>

            <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-purple-300">
                    Goal Overlay
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    {goalAnalysis.title}
                  </h3>
                </div>

                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${getStatusClass(
                    goalAnalysis.status
                  )}`}
                >
                  <p className="opacity-80">Goal Status</p>
                  <p className="mt-1 text-lg font-bold">
                    {getGoalStatusLabel(goalAnalysis.status)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {goalAnalysis.summary}
              </p>

              <div className="mt-4">
                <GoalScoreBar value={goalAnalysis.goalScore} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <MetricCard
                  label="Margin of Safety"
                  value={goalAnalysis.marginOfSafety}
                  detail="How much cushion the selected goal has under the model."
                />
                <MetricCard
                  label="Goal Fit Score"
                  value={`${result.score.goalFitScore}/25`}
                  detail="Converted from the goal model score and included in the final readiness score."
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("goal")}
                className="mt-4 rounded-xl border border-purple-400/30 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-400/10"
              >
                Open Goal Analysis
              </button>
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

                    <p className="text-sm leading-6 text-slate-100">
                      {action}
                    </p>
                  </div>
                ))}
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
              <ScoreBar
                label="Debt Health"
                value={result.score.debtHealthScore}
              />
              <ScoreBar
                label="Asset Strength"
                value={result.score.assetStrengthScore}
              />
              <ScoreBar label="Goal Fit" value={result.score.goalFitScore} />
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 text-sm uppercase tracking-[0.2em] text-slate-400">
                Financial Snapshot
              </p>

              <div className="h-72 min-h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height={288}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(value) =>
                        formatChartCurrency(Number(value))
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "white",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#22d3ee"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <MetricCard
                label="Income PV"
                value={formatCurrency(result.incomePV)}
              />
              <MetricCard
                label="Assets"
                value={formatCurrency(result.assetValue)}
              />
              <MetricCard
                label="Debt PV"
                value={formatCurrency(result.debtPV)}
              />
              <MetricCard
                label="Expense PV"
                value={formatCurrency(result.expensePV)}
              />
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
          </div>
        </div>
      )}

      {activeTab === "goal" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-purple-300">
                  Goal-Specific Model
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  {goalAnalysis.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {goalAnalysis.summary}
                </p>
              </div>

              <div
                className={`shrink-0 rounded-2xl border px-5 py-4 text-sm ${getStatusClass(
                  goalAnalysis.status
                )}`}
              >
                <p className="opacity-80">Goal Status</p>
                <p className="mt-1 text-2xl font-bold">
                  {getGoalStatusLabel(goalAnalysis.status)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
              <GoalScoreBar value={goalAnalysis.goalScore} />

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <MetricCard
                  label="Goal Score"
                  value={`${goalAnalysis.goalScore}/100`}
                  detail="Goal-specific score before being converted into the 25-point Goal Fit score."
                />
                <MetricCard
                  label="Goal Fit Score"
                  value={`${result.score.goalFitScore}/25`}
                  detail="This is the weighted goal component inside the final readiness score."
                />
                <MetricCard
                  label="Margin of Safety"
                  value={goalAnalysis.marginOfSafety}
                  detail="The cushion or room for error in the selected goal model."
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Recommendation Impact
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {goalAnalysis.recommendationImpact}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Goal Metrics
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              These are the calculations that are specific to the selected goal.
              This is what makes the model change based on the user&apos;s
              decision objective.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goalAnalysis.metrics.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  detail={metric.detail}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-400/20 bg-orange-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-300">
              Goal Score Drivers
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              These reason codes show exactly why the goal model raised or
              lowered the goal score.
            </p>

            <div className="mt-5 space-y-3">
              {goalAnalysis.scoreDrivers.map((driver, index) => (
                <div
                  key={`${driver.label}-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {driver.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {driver.explanation}
                      </p>
                    </div>

                    <div
                      className={`shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-bold ${getDriverImpactClass(
                        driver.impact
                      )}`}
                    >
                      {driver.impact > 0
                        ? `+${driver.impact}`
                        : `${driver.impact}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
              Conservative / Base / Optimistic Cases
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              These cases stress the selected goal&apos;s key assumptions to
              show how stable the decision is.
            </p>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {goalAnalysis.scenarios.map((scenario) => (
                <div
                  key={scenario.name}
                  className={`rounded-3xl border p-5 ${getScenarioClass(
                    scenario.status
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {scenario.name} Case
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {scenario.summary}
                      </p>
                    </div>

                    <div
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                        scenario.status
                      )}`}
                    >
                      {getGoalStatusLabel(scenario.status)}
                    </div>
                  </div>

                  <div className="mt-4">
                    <GoalScoreBar value={scenario.goalScore} />
                  </div>

                  <div className="mt-4 space-y-3">
                    {scenario.metrics.map((metric) => (
                      <div
                        key={`${scenario.name}-${metric.label}`}
                        className="rounded-2xl border border-white/10 bg-slate-950/50 p-3"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {metric.value}
                        </p>
                        {metric.detail && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {metric.detail}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
              Decision Rules
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              These rules explain how the selected goal influences the final
              decision and Goal Fit score.
            </p>

            <div className="mt-4 space-y-3">
              {goalAnalysis.decisionRules.map((rule, index) => (
                <div
                  key={`${rule}-${index}`}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-bold text-emerald-300">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-slate-100">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
              Scenario Comparison
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MetricCard
                label="Current Plan"
                value={formatCurrency(
                  result.scenarioComparison.currentNetPosition
                )}
              />
              <MetricCard
                label="Improved Plan"
                value={formatCurrency(
                  result.scenarioComparison.improvedNetPosition
                )}
              />
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

          <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-purple-300">
              Sensitivity Analysis
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              This table shows how net position changes under different income
              growth and discount rate assumptions.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MetricCard
                label="Downside Case"
                value={formatCurrency(result.sensitivityAnalysis.downsideCase)}
              />
              <MetricCard
                label="Base Case"
                value={formatCurrency(result.sensitivityAnalysis.baseCase)}
              />
              <MetricCard
                label="Upside Case"
                value={formatCurrency(result.sensitivityAnalysis.upsideCase)}
              />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-white/10 bg-slate-950/70 p-3 text-left text-slate-400">
                      Income Growth
                    </th>

                    {result.sensitivityAnalysis.discountRates.map((rate) => (
                      <th
                        key={rate}
                        className="border border-white/10 bg-slate-950/70 p-3 text-right text-slate-400"
                      >
                        {formatPercent(rate)} Discount
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {result.sensitivityAnalysis.incomeGrowthRates.map(
                    (growthRate) => (
                      <tr key={growthRate}>
                        <td className="border border-white/10 bg-slate-950/50 p-3 font-medium text-slate-300">
                          {formatPercent(growthRate)}
                        </td>

                        {result.sensitivityAnalysis.discountRates.map(
                          (discountRate) => {
                            const cell =
                              result.sensitivityAnalysis.table.find(
                                (item) =>
                                  item.incomeGrowthRate === growthRate &&
                                  item.discountRate === discountRate
                              );

                            const value = cell?.netPosition ?? 0;

                            return (
                              <td
                                key={`${growthRate}-${discountRate}`}
                                className={`border border-white/10 bg-slate-950/40 p-3 text-right ${
                                  value >= 0
                                    ? "text-emerald-300"
                                    : "text-red-300"
                                }`}
                              >
                                {formatCurrency(value)}
                              </td>
                            );
                          }
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-400/20 bg-orange-400/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-300">
              Monte Carlo Simulation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              This simulation runs randomized cases by changing income growth,
              discount rate, investment return, and expense growth assumptions.
            </p>

            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">
                Probability of Positive Net Position
              </p>

              <div className="mt-2 flex items-end gap-2">
                <p className="text-5xl font-bold text-orange-300">
                  {formatPercent(result.monteCarloResult.probabilityPositive)}
                </p>

                <p className="pb-2 text-sm text-slate-500">
                  across {result.monteCarloResult.simulations} simulations
                </p>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400"
                  style={{
                    width: `${
                      result.monteCarloResult.probabilityPositive * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MetricCard
                label="10th Percentile"
                value={formatCurrency(result.monteCarloResult.tenthPercentile)}
              />
              <MetricCard
                label="Median"
                value={formatCurrency(result.monteCarloResult.median)}
              />
              <MetricCard
                label="90th Percentile"
                value={formatCurrency(
                  result.monteCarloResult.ninetiethPercentile
                )}
              />
              <MetricCard
                label="Average Outcome"
                value={formatCurrency(
                  result.monteCarloResult.averageNetPosition
                )}
              />
              <MetricCard
                label="Worst Case"
                value={formatCurrency(result.monteCarloResult.worstCase)}
              />
              <MetricCard
                label="Best Case"
                value={formatCurrency(result.monteCarloResult.bestCase)}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "assumptions" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                  Model Assumptions
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  These are the user-selected assumptions used by the model.
                  For formulas, methodology, and limitations, open the full
                  methodology page.
                </p>
              </div>

              <Link
                href="/methodology"
                className="shrink-0 rounded-xl border border-cyan-400/30 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                View Full Methodology
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                label="Discount Rate"
                value={`${result.modelAssumptions.discountRate}%`}
              />
              <MetricCard
                label="Base Income Growth"
                value={`${result.modelAssumptions.baseIncomeGrowthRate}%`}
              />
              <MetricCard
                label="Expense Growth / Inflation"
                value={`${result.modelAssumptions.expenseGrowthRate}%`}
              />
              <MetricCard
                label="Expected Investment Return"
                value={`${result.modelAssumptions.expectedInvestmentReturn}%`}
              />
              <MetricCard
                label="Monte Carlo Runs"
                value={result.modelAssumptions.monteCarloRuns.toLocaleString()}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                Model Audit
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
                Input Validation & Risk Flags
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This checks whether the inputs look reasonable before relying on
                the model output.
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${getStatusClass(
                result.modelAudit.overallStatus
              )}`}
            >
              <p className="opacity-80">Overall Status</p>
              <p className="mt-1 text-lg font-bold">
                {formatAuditStatus(result.modelAudit.overallStatus)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {result.modelAudit.items.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {item.message}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${getAuditBadgeClass(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "report" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Download Report
          </p>

          <h3 className="mt-2 text-2xl font-bold text-white">
            FInsight Financial Modeling Report
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Download a branded PDF report with the model output,
            recommendation, score breakdown, goal analysis, scenario analysis,
            sensitivity analysis, Monte Carlo results, assumptions, model audit,
            methodology, and limitations.
          </p>

          <button
            type="button"
            onClick={() => downloadPDFReport(result)}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
          >
            Download PDF Report
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            FInsight is for educational purposes only and does not provide
            financial, investment, tax, or legal advice.
          </p>
        </div>
      )}
    </div>
  );
}