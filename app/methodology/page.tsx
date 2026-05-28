import Link from "next/link";

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
        {description}
      </p>
    </div>
  );
}

function FormulaCard({
  title,
  formula,
  description,
}: {
  title: string;
  formula: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-sm font-semibold text-cyan-300">{title}</p>
      <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-sm leading-6 text-emerald-300">
        {formula}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <p className="font-semibold text-white">{title}</p>
      <div className="mt-3 text-sm leading-6 text-slate-400">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm leading-6 text-slate-200"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export default function MethodologyPage() {
  const coreFormulas = [
    {
      title: "Core Net Position",
      formula:
        "Net Position = Income PV + Current Assets - Debt PV - Expense PV",
      description:
        "This is the main financial position estimate. Future income and expenses are discounted into present value, then combined with current assets and liabilities.",
    },
    {
      title: "Income Present Value",
      formula: "Income PV = Σ Projected Income_t / (1 + discount rate)^t",
      description:
        "Future income is projected forward using income growth assumptions and then discounted back to today.",
    },
    {
      title: "Debt Present Value",
      formula: "Debt PV = Payment x [1 - (1 + r)^(-n)] / r",
      description:
        "Recurring debt payments are valued using an annuity present value formula so debt can be compared against assets and income.",
    },
    {
      title: "Expense Present Value",
      formula: "Expense PV = Σ Projected Expenses_t / (1 + discount rate)^t",
      description:
        "Monthly expenses are annualized, adjusted by city type, grown over time, and discounted back into today’s dollars.",
    },
    {
      title: "Financial Readiness Score",
      formula:
        "Score = Liquid Safety + Debt Health + Asset Strength + Goal Fit",
      description:
        "The final score is a 100-point measure. Liquid Safety is based on combined savings and emergency fund, while Debt Health, Asset Strength, and Goal Fit measure broader readiness.",
    },
    {
      title: "Goal Fit Conversion",
      formula: "Goal Fit Score = Goal Model Score / 4",
      description:
        "Each goal model produces a 0-100 score. That score is converted into the 25-point Goal Fit section of the final readiness score.",
    },
  ];

  const goalModels = [
    {
      title: "Buy House",
      description:
        "The housing affordability model evaluates down payment strength, monthly housing cost, housing cost divided by income, debt-to-income ratio, home price divided by income, and margin of safety against the 30% housing-cost threshold.",
      formulas: [
        "Required Down Payment = Target House Price x Down Payment %",
        "Monthly Housing Cost = Mortgage Payment + Property Tax + Maintenance",
        "Housing Cost / Income = Monthly Housing Cost / Monthly Income",
        "Debt-to-Income = (Housing Cost + Debt Payments) / Monthly Income",
        "Housing Margin of Safety = 30% - Housing Cost / Income",
      ],
    },
    {
      title: "Rent vs Buy",
      description:
        "The rent-versus-buy model compares the present value cost of renting against the present value cost of buying over the selected holding period.",
      formulas: [
        "Rent PV = Present value of rent payments over holding period",
        "Buy PV = Present value of ownership costs over holding period",
        "NPV Difference = Rent PV - Buy PV",
        "Margin of Safety = Absolute NPV Difference / Annual Income",
      ],
    },
    {
      title: "Retirement",
      description:
        "The retirement model estimates whether projected assets at retirement are enough to cover a retirement need based on future expenses.",
      formulas: [
        "Projected Assets = Current Assets grown by expected return + annual surplus contributions",
        "Projected Annual Expenses = Current Annual Expenses grown by expense growth",
        "Retirement Need = Projected Annual Expenses x 25",
        "Retirement Gap = Projected Assets - Retirement Need",
        "Coverage Ratio = Projected Assets / Retirement Need",
      ],
    },
    {
      title: "Invest Assets",
      description:
        "The investing model checks whether the user is actually ready to invest by testing liquidity, high-interest debt, monthly surplus, investable assets, risk tolerance, and time horizon.",
      formulas: [
        "Investable Assets = Savings + Stocks + Bonds",
        "Liquid Safety Gap = 3 Months of Expenses - (Savings + Emergency Fund)",
        "Monthly Surplus = Monthly Income - Monthly Expenses - Debt Payments",
        "Liquidity Margin of Safety = (Savings + Emergency Fund) / Monthly Expenses",
      ],
    },
    {
      title: "Scholarship ROI",
      description:
        "The scholarship model treats education as an investment decision by comparing net education cost against the present value of expected income benefits.",
      formulas: [
        "Scholarship Value = Education Cost x Scholarship %",
        "Net Education Cost = Education Cost - Scholarship Value",
        "Annual Income Benefit = Current Income x Expected Income Increase %",
        "Education NPV = PV of Income Benefit - Net Education Cost",
        "Payback Period = Net Education Cost / Annual Income Benefit",
        "Margin of Safety = PV Income Benefit / Net Education Cost",
      ],
    },
  ];

  const assumptions = [
    "Default discount rate: 5%, adjustable by the user.",
    "Default base income growth: 2%, adjustable by the user.",
    "Default expense growth / inflation rate: 2.5%, adjustable by the user.",
    "Default expected investment return: 6%, adjustable by the user.",
    "Default Monte Carlo simulation count: 1,000 trials, adjustable by the user.",
    "Liquid safety cushion target: combined savings and emergency fund should cover at least 3 months of expenses.",
    "High-interest credit card debt threshold: 15% APR.",
    "Mortgage term used for housing calculations: 30 years.",
    "Retirement need uses a 25x projected annual expense multiple.",
    "Scholarship ROI uses a 10-year present value window for income benefits.",
    "City type adjustment: city users have higher projected expenses, suburban users use the baseline, and rural users have lower projected expenses.",
    "Bond value and real estate value are entered as current market values, not original cost, face value, or NPV.",
  ];

  const limitations = [
    "The model is educational and directional, not predictive.",
    "The model does not include taxes.",
    "The model does not use live market, mortgage, inflation, or tuition data.",
    "The model does not include state-specific cost-of-living rules.",
    "The model uses simplified assumptions so the calculations are understandable for a finance modeling project.",
    "The model does not provide legal, tax, investment, or financial advice.",
    "The model does not replace a certified financial planner or professional advisor.",
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-12 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              FInsight Methodology
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-cyan-300/80">
              Financial modeling documentation
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Back to App
          </Link>
        </nav>

        <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
          <SectionHeader
            eyebrow="Model Purpose"
            title="What FInsight Does"
            description="FInsight is an educational personal finance modeling tool. It converts a user’s financial profile into present value estimates, stress-tests assumptions, applies a goal-specific model, and generates a directional recommendation. The model is designed for finance modeling coursework, not professional financial advice."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="Core Model">
              The core model estimates net position using present value logic for
              income, expenses, debt, and assets.
            </InfoCard>

            <InfoCard title="Goal Model">
              The selected goal triggers a second model layer with unique
              calculations, score drivers, scenario cases, and margin of safety.
            </InfoCard>

            <InfoCard title="Risk Model">
              Sensitivity analysis and Monte Carlo simulation test whether the
              result holds up when assumptions change.
            </InfoCard>
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
          <SectionHeader
            eyebrow="Core Formulas"
            title="Core Financial Model"
            description="The base model estimates financial readiness before applying the user’s selected goal. This creates a consistent foundation across all goals."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {coreFormulas.map((item) => (
              <FormulaCard
                key={item.title}
                title={item.title}
                formula={item.formula}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-purple-400/20 bg-purple-400/10 p-6">
          <SectionHeader
            eyebrow="Goal Layer"
            title="Goal-Specific Model Layer"
            description="After the core model is calculated, FInsight applies a goal-specific model. This goal layer changes the dashboard tab, Goal Fit score, final recommendation, score drivers, conservative/base/optimistic scenarios, and margin of safety."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {goalModels.map((goal) => (
              <div
                key={goal.title}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
              >
                <p className="text-lg font-bold text-white">{goal.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {goal.description}
                </p>

                <div className="mt-4 space-y-2">
                  {goal.formulas.map((formula) => (
                    <div
                      key={formula}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-xs leading-5 text-emerald-300"
                    >
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-blue-400/20 bg-blue-400/10 p-6">
          <SectionHeader
            eyebrow="Scenario Logic"
            title="Conservative / Base / Optimistic Cases"
            description="Each goal model includes three cases. The base case uses the user’s inputs, the conservative case stresses the most important assumptions in a negative direction, and the optimistic case improves the main assumptions. This shows whether the decision is stable or fragile."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="Conservative Case">
              Stress test that makes the selected goal harder to justify. For
              example, higher mortgage rates, lower investment returns, higher
              expenses, or weaker income benefits.
            </InfoCard>

            <InfoCard title="Base Case">
              The model result using the user’s current inputs and selected
              assumptions.
            </InfoCard>

            <InfoCard title="Optimistic Case">
              Upside case that slightly improves the most important assumptions,
              such as lower mortgage rates, higher investment returns, or
              stronger income benefits.
            </InfoCard>
          </div>
        </section>

        <section className="mb-10 rounded-3xl border border-orange-400/20 bg-orange-400/10 p-6">
          <SectionHeader
            eyebrow="Risk Testing"
            title="Sensitivity Analysis and Monte Carlo"
            description="FInsight separates deterministic scenario analysis from randomized simulation. Sensitivity analysis shows how net position changes across selected assumption combinations. Monte Carlo simulation randomizes assumptions across many trials."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoCard title="Sensitivity Analysis">
              Sensitivity analysis varies discount rate and income growth
              assumptions to show how much the final net position changes when
              core assumptions move.
            </InfoCard>

            <InfoCard title="Monte Carlo Simulation">
              Monte Carlo simulation randomizes income growth, discount rate,
              investment return, and expense growth. It reports probability of
              positive net position, 10th percentile, median, 90th percentile,
              average, worst case, and best case.
            </InfoCard>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
            <SectionHeader
              eyebrow="Assumptions"
              title="Key Assumptions"
              description="These assumptions keep the model transparent and understandable."
            />
            <BulletList items={assumptions} />
          </div>

          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6">
            <SectionHeader
              eyebrow="Limitations"
              title="Model Limitations"
              description="These limitations should be disclosed whenever the model is presented."
            />
            <BulletList items={limitations} />
          </div>
        </section>
      </div>
    </main>
  );
}