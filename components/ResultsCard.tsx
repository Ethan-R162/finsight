"use client";

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
  | "risk"
  | "assumptions"
  | "audit"
  | "housing"
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
  if (status === "healthy") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "watch") {
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  }

  return "border-red-400/30 bg-red-400/10 text-red-300";
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

  const showHousingTab =
    result.goal === "buy_house" || result.goal === "rent_vs_buy";

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
      description: "Score, recommendation, action plan, and snapshot.",
    },
    {
      id: "risk",
      label: "Risk",
      description: "Sensitivity, Monte Carlo, and scenarios.",
    },
    {
      id: "assumptions",
      label: "Assumptions",
      description: "Discount rate, growth, and simulation settings.",
    },
    {
      id: "audit",
      label: "Audit",
      description: "Input quality and model risk flags.",
    },
    ...(showHousingTab
      ? [
          {
            id: "housing" as DashboardTab,
            label: "Housing",
            description: "Buy vs Rent NPV model.",
          },
        ]
      : []),
    {
      id: "report",
      label: "Report",
      description: "Download your PDF report.",
    },
  ];

  return (
    <div className="space-y-6 rounded-[1.35rem] bg-slate-950/80 p-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-2">
        <div
          className={`grid gap-2 ${
            showHousingTab
              ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
              : "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
          }`}
        >
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
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Model Assumptions
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            These are the user-adjusted assumptions used by the model to
            calculate present value, sensitivity analysis, Monte Carlo
            simulation, and the final recommendation.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
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

          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm font-semibold text-white">
              Why these assumptions matter
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              The discount rate controls how future cash flows are converted
              into today&apos;s dollars. Income growth affects projected future
              earnings. Expense growth estimates how costs rise over time.
              Expected investment return affects simulated asset growth. Monte
              Carlo runs determine how many randomized scenarios the model uses
              to estimate downside, median, and upside outcomes.
            </p>
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

      {activeTab === "housing" && showHousingTab && (
        <div className="rounded-3xl border border-teal-400/20 bg-teal-400/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            Buy vs Rent NPV Model
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            This model compares the present value cost of renting versus buying
            over the selected holding period.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MetricCard
              label="PV Cost of Renting"
              value={formatCurrency(result.buyRentAnalysis.rentPV)}
            />
            <MetricCard
              label="PV Cost of Buying"
              value={formatCurrency(result.buyRentAnalysis.buyPV)}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              NPV Difference
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                result.buyRentAnalysis.recommendation === "buy"
                  ? "text-emerald-300"
                  : "text-cyan-300"
              }`}
            >
              {formatCurrency(result.buyRentAnalysis.difference)}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {result.buyRentAnalysis.summary}
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-slate-300">
                Model recommendation:{" "}
                <span className="font-semibold uppercase text-teal-300">
                  {result.buyRentAnalysis.recommendation}
                </span>
              </p>
            </div>
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
            recommendation, score breakdown, scenario analysis, sensitivity
            analysis, Monte Carlo results, assumptions, model audit,
            methodology, and limitations.
            {showHousingTab &&
              " The housing report also includes Buy vs Rent NPV."}
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