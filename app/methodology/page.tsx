import Link from "next/link";

const methodologySections = [
  {
    title: "Core Model Formula",
    items: [
      "FInsight estimates a user's financial position using present value logic.",
      "Net Position = Income PV + Current Assets - Debt PV - Expense PV.",
      "A higher net position means projected financial resources exceed projected obligations.",
      "A lower or negative net position means the user may face more financial pressure.",
    ],
  },
  {
    title: "Income Projection",
    items: [
      "Future income is projected from the user's current income until retirement.",
      "The model combines the user's base income growth assumption with an industry growth baseline.",
      "If the user is unemployed or retired, income projection is adjusted downward or set to zero where appropriate.",
      "Projected future income is discounted back to present value using the user's selected discount rate.",
    ],
  },
  {
    title: "Soft Income Growth Normalization",
    items: [
      "High income growth can distort a long-term model because growth compounds over many years.",
      "Growth up to 5% is used directly.",
      "Growth above 5% is not fully capped, but softened by keeping 35% of the excess growth above 5%.",
      "Formula: Normalized Growth = 5% + ((Raw Growth - 5%) × 35%).",
      "Example: 9% raw growth becomes 6.4% normalized growth.",
      "This allows high-growth careers to retain upside while preventing short-term growth assumptions from being projected unrealistically across an entire career.",
    ],
  },
  {
    title: "Asset Valuation",
    items: [
      "Current assets include savings, emergency fund, stocks, bonds, and real estate value.",
      "The model uses current asset values rather than detailed security-level pricing.",
      "This keeps the model more usable for a normal user while still capturing the user's asset base.",
    ],
  },
  {
    title: "Debt Valuation",
    items: [
      "Debt is valued using the present value of remaining monthly debt payments.",
      "The model uses a loan-style present value of annuity calculation.",
      "Credit card debt is added directly because it represents an immediate financial obligation.",
      "High-interest credit card debt is flagged when APR is 15% or higher.",
    ],
  },
  {
    title: "Expense Projection",
    items: [
      "Monthly expenses are annualized by multiplying by 12.",
      "Annual expenses are projected forward using the user's selected expense growth rate.",
      "Projected expenses are discounted back to present value.",
      "This prevents the model from ignoring future living costs.",
    ],
  },
  {
    title: "Financial Readiness Score",
    items: [
      "The financial readiness score is out of 100.",
      "The score is based on emergency fund strength, debt health, asset strength, and goal fit.",
      "Each category contributes up to 25 points.",
      "The score is directional and is meant to summarize overall financial readiness, not replace a formal credit score or financial plan.",
    ],
  },
  {
    title: "Recommendation Logic",
    items: [
      "The recommendation uses the user's goal, net position, risk tolerance, time horizon, debt profile, and asset base.",
      "Risk-averse users are generally guided toward safer, more liquid choices.",
      "Risk-neutral users are generally guided toward balanced strategies.",
      "Risk-seeking users may be more suited for higher-growth or less conservative strategies.",
      "Shorter time horizons make liquidity and lower volatility more important.",
      "Longer time horizons allow more room for equities, real estate, or higher-growth strategies.",
    ],
  },
  {
    title: "Sensitivity Analysis",
    items: [
      "Sensitivity analysis tests how net position changes under different income growth and discount rate assumptions.",
      "The base case is designed to match the main model output.",
      "The downside case is the lowest net position from the sensitivity table.",
      "The upside case is the highest net position from the sensitivity table.",
      "This helps show how dependent the model is on key assumptions.",
    ],
  },
  {
    title: "Monte Carlo Simulation",
    items: [
      "Monte Carlo simulation runs many randomized scenarios.",
      "The model randomizes income growth, discount rate, investment return, and expense growth.",
      "The output includes probability of positive net position, 10th percentile, median, 90th percentile, average outcome, worst case, and best case.",
      "This turns the model from one fixed answer into a range of possible outcomes.",
    ],
  },
  {
    title: "Buy vs Rent NPV Model",
    items: [
      "The Buy vs Rent model only appears for housing-related goals.",
      "It compares the present value cost of renting against the present value cost of buying.",
      "The model considers rent, home price, down payment, mortgage rate, holding period, appreciation, property tax, maintenance, and closing costs.",
      "The recommendation is based on which option has the lower present value cost over the holding period.",
    ],
  },
  {
    title: "Model Audit",
    items: [
      "The model audit acts as a quality-control layer.",
      "It checks emergency fund strength, expense burden, debt pressure, high-interest credit card debt, housing affordability, assumption reasonableness, and overall net position.",
      "The audit classifies the result as Healthy, Watch, or Risky.",
      "This helps users understand whether the output should be trusted or viewed with caution.",
    ],
  },
];

const assumptions = [
  "Discount rate: user-selected rate used to convert future cash flows into present value.",
  "Base income growth: user-selected growth rate combined with an industry growth baseline.",
  "Income growth normalization: growth up to 5% is used directly; growth above 5% keeps 35% of the excess growth.",
  "Expense growth: user-selected rate used to project annual expenses over time.",
  "Expected investment return: user-selected return used in Monte Carlo simulations for invested assets.",
  "Monte Carlo simulation count: user-selected number of randomized trials, limited between 100 and 10,000 runs.",
  "Emergency fund target: at least 3 months of expenses.",
  "High-interest credit card debt threshold: 15% APR.",
  "Mortgage term used in the Buy vs Rent model: 30 years.",
];

const limitations = [
  "The model is directional and scenario-based, not predictive.",
  "The model does not include taxes.",
  "The model does not use live market, mortgage, inflation, or salary data.",
  "Industry growth rates are simplified baselines and may not reflect a specific person's career path.",
  "Income growth is normalized to prevent unusually high short-term growth from being projected unrealistically across an entire career.",
  "The model does not include exact state-specific cost-of-living adjustments.",
  "The model combines some categories, such as insurance, utilities, food, gas, and student debt, into broader expense and debt inputs.",
  "The model uses simplified assumptions for educational purposes.",
  "The model does not replace a financial advisor.",
  "The model does not provide legal, tax, investment, or financial advice.",
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-emerald-400/10 p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                FInsight Methodology
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Model Logic, Assumptions, and Limitations
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                This page explains how FInsight converts financial inputs into
                present value outputs, a readiness score, recommendations,
                sensitivity analysis, Monte Carlo simulation, model audit, and a
                PDF report.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Back to App
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
            Main Formula
          </p>

          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-2xl font-bold text-white">
              Net Position = Income PV + Current Assets - Debt PV - Expense PV
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              This formula is the center of the model. The rest of the dashboard
              explains the user's score, risks, scenarios, and recommendation
              around this net position.
            </p>
          </div>
        </section>

        <section className="grid gap-6">
          {methodologySections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6"
            >
              <h2 className="text-xl font-bold text-white">{section.title}</h2>

              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                  >
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
              Key Assumptions
            </p>

            <div className="mt-5 space-y-3">
              {assumptions.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-400/20 bg-orange-400/10 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-orange-300">
              Model Limitations
            </p>

            <div className="mt-5 space-y-3">
              {limitations.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}