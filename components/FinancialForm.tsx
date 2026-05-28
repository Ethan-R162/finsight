"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  applyGoalWeightToRecommendation,
  applyGoalWeightToScore,
  generateGoalAnalysis,
} from "@/lib/goalAnalysis";
import { FinancialInput, FinancialResult } from "@/types/financial";
import {
  calculateAssetValue,
  calculateDebtPV,
  calculateExpensePV,
  calculateFutureIncomePV,
  calculateNetPosition,
} from "@/lib/calculations";
import { getRecommendation } from "@/lib/recommendations";
import { calculateFinancialScore } from "@/lib/scoring";
import { generateActionPlan } from "@/lib/actionPlan";
import { generateScenarioComparison } from "@/lib/scenarios";
import { generateSensitivityAnalysis } from "@/lib/sensitivity";
import { runMonteCarloSimulation } from "@/lib/monteCarlo";
import { generateBuyRentAnalysis } from "@/lib/buyRent";
import { generateModelAudit } from "@/lib/modelAudit";

const sampleProfiles = {
  healthyInvestor: {
    label: "Healthy Investor",
    description: "Strong income, low debt, healthy emergency fund.",
    values: {
      goal: "invest_assets",
      age: 30,
      retirementAge: 65,
      dependents: 0,
      cityType: "suburban",
      occupationStatus: "employed",
      industry: "finance",

      income: 140000,
      monthlyExpenses: 4500,
      savings: 35000,
      emergencyFund: 30000,
      stockValue: 85000,
      bondValue: 15000,
      realEstateValue: 0,

      debtPayment: 250,
      debtInterestRate: 5,
      debtYearsRemaining: 3,
      creditCardDebt: 0,
      creditCardAPR: 0,

      targetHousePrice: 0,
      scholarshipPercent: 0,
      expectedIncomeIncrease: 0,
      educationCost: 0,

      monthlyRent: 0,
      downPaymentPercent: 20,
      mortgageRate: 6.75,
      holdingPeriodYears: 7,
      homeAppreciationRate: 3,
      propertyTaxRate: 1.1,
      maintenanceRate: 1,
      closingCostPercent: 3,

      discountRate: 6,
      baseIncomeGrowthRate: 2.5,
      expenseGrowthRate: 2.5,
      expectedInvestmentReturn: 7,
      monteCarloRuns: 3000,

      riskTolerance: "risk_neutral",
      timeHorizon: "10_20_years",
    },
  },

  riskyHomebuyer: {
    label: "Risky Homebuyer",
    description: "High housing target, debt pressure, thin emergency fund.",
    values: {
      goal: "rent_vs_buy",
      age: 27,
      retirementAge: 65,
      dependents: 1,
      cityType: "city",
      occupationStatus: "employed",
      industry: "technology",

      income: 115000,
      monthlyExpenses: 6200,
      savings: 18000,
      emergencyFund: 7000,
      stockValue: 22000,
      bondValue: 2000,
      realEstateValue: 0,

      debtPayment: 950,
      debtInterestRate: 8.5,
      debtYearsRemaining: 6,
      creditCardDebt: 9000,
      creditCardAPR: 22,

      targetHousePrice: 850000,
      scholarshipPercent: 0,
      expectedIncomeIncrease: 0,
      educationCost: 0,

      monthlyRent: 3200,
      downPaymentPercent: 8,
      mortgageRate: 7.25,
      holdingPeriodYears: 5,
      homeAppreciationRate: 2,
      propertyTaxRate: 1.25,
      maintenanceRate: 1.2,
      closingCostPercent: 3,

      discountRate: 6.5,
      baseIncomeGrowthRate: 3,
      expenseGrowthRate: 3.2,
      expectedInvestmentReturn: 7,
      monteCarloRuns: 3000,

      riskTolerance: "risk_neutral",
      timeHorizon: "5_10_years",
    },
  },

  collegeStudent: {
    label: "College Student",
    description: "Low income, small assets, early-stage financial profile.",
    values: {
      goal: "scholarship",
      age: 20,
      retirementAge: 65,
      dependents: 0,
      cityType: "city",
      occupationStatus: "student",
      industry: "other",

      income: 18000,
      monthlyExpenses: 1800,
      savings: 3500,
      emergencyFund: 1000,
      stockValue: 1500,
      bondValue: 0,
      realEstateValue: 0,

      debtPayment: 150,
      debtInterestRate: 5.5,
      debtYearsRemaining: 10,
      creditCardDebt: 1200,
      creditCardAPR: 19,

      targetHousePrice: 0,
      scholarshipPercent: 60,
      expectedIncomeIncrease: 25,
      educationCost: 80000,

      monthlyRent: 0,
      downPaymentPercent: 20,
      mortgageRate: 6.75,
      holdingPeriodYears: 7,
      homeAppreciationRate: 3,
      propertyTaxRate: 1.1,
      maintenanceRate: 1,
      closingCostPercent: 3,

      discountRate: 6,
      baseIncomeGrowthRate: 3,
      expenseGrowthRate: 3,
      expectedInvestmentReturn: 6.5,
      monteCarloRuns: 2000,

      riskTolerance: "risk_neutral",
      timeHorizon: "10_20_years",
    },
  },

  highDebtProfessional: {
    label: "High-Debt Professional",
    description: "Good income but high debt and credit card pressure.",
    values: {
      goal: "invest_assets",
      age: 32,
      retirementAge: 65,
      dependents: 0,
      cityType: "city",
      occupationStatus: "employed",
      industry: "healthcare",

      income: 165000,
      monthlyExpenses: 7200,
      savings: 12000,
      emergencyFund: 5000,
      stockValue: 28000,
      bondValue: 3000,
      realEstateValue: 0,

      debtPayment: 1800,
      debtInterestRate: 7.5,
      debtYearsRemaining: 8,
      creditCardDebt: 18000,
      creditCardAPR: 24,

      targetHousePrice: 0,
      scholarshipPercent: 0,
      expectedIncomeIncrease: 0,
      educationCost: 0,

      monthlyRent: 0,
      downPaymentPercent: 20,
      mortgageRate: 6.75,
      holdingPeriodYears: 7,
      homeAppreciationRate: 3,
      propertyTaxRate: 1.1,
      maintenanceRate: 1,
      closingCostPercent: 3,

      discountRate: 6.5,
      baseIncomeGrowthRate: 3,
      expenseGrowthRate: 3.5,
      expectedInvestmentReturn: 7,
      monteCarloRuns: 3000,

      riskTolerance: "risk_averse",
      timeHorizon: "5_10_years",
    },
  },

  retirementPlanner: {
    label: "Retirement Planner",
    description: "Older user testing retirement readiness.",
    values: {
      goal: "retirement",
      age: 55,
      retirementAge: 67,
      dependents: 0,
      cityType: "suburban",
      occupationStatus: "employed",
      industry: "finance",

      income: 155000,
      monthlyExpenses: 6000,
      savings: 90000,
      emergencyFund: 40000,
      stockValue: 420000,
      bondValue: 180000,
      realEstateValue: 350000,

      debtPayment: 900,
      debtInterestRate: 4.5,
      debtYearsRemaining: 10,
      creditCardDebt: 0,
      creditCardAPR: 0,

      targetHousePrice: 0,
      scholarshipPercent: 0,
      expectedIncomeIncrease: 0,
      educationCost: 0,

      monthlyRent: 0,
      downPaymentPercent: 20,
      mortgageRate: 6.75,
      holdingPeriodYears: 7,
      homeAppreciationRate: 3,
      propertyTaxRate: 1.1,
      maintenanceRate: 1,
      closingCostPercent: 3,

      discountRate: 5.5,
      baseIncomeGrowthRate: 2,
      expenseGrowthRate: 2.5,
      expectedInvestmentReturn: 5.5,
      monteCarloRuns: 3000,

      riskTolerance: "risk_averse",
      timeHorizon: "10_20_years",
    },
  },
} satisfies Record<
  string,
  {
    label: string;
    description: string;
    values: FinancialInput;
  }
>;

type Props = {
  form: FinancialInput;
  setForm: Dispatch<SetStateAction<FinancialInput>>;
  onCalculate: (result: FinancialResult) => void;
};

type NumberFieldName = {
  [K in keyof FinancialInput]: FinancialInput[K] extends number ? K : never;
}[keyof FinancialInput];

const totalSteps = 7;

export default function FinancialForm({ form, setForm, onCalculate }: Props) {
  const [step, setStep] = useState(1);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  const [draftNumbers, setDraftNumbers] = useState<
    Partial<Record<NumberFieldName, string>>
  >({});



  const inputClass =
    "mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10";

  const labelClass = "block text-sm font-medium text-slate-300";

  const mutedText = "text-sm leading-6 text-slate-400";

  function loadSampleProfile(profile: keyof typeof sampleProfiles) {
    const sampleValues = sampleProfiles[profile].values;

    setForm((previousForm) => ({
      ...previousForm,
      ...sampleValues,
    }));

    setDraftNumbers({});
    setStep(1);
    setShowDemoProfiles(false);
  }

  function updateField(name: keyof FinancialInput, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function numberValue(name: NumberFieldName) {
    return draftNumbers[name] ?? String(form[name] ?? 0);
  }
function sanitizeNumberField(name: NumberFieldName, value: number): number {
  let cleanValue = Number.isFinite(value) ? value : 0;

  cleanValue = Math.max(0, cleanValue);

  const percentFields: NumberFieldName[] = [
    "debtInterestRate",
    "creditCardAPR",
    "scholarshipPercent",
    "expectedIncomeIncrease",
    "downPaymentPercent",
    "mortgageRate",
    "homeAppreciationRate",
    "propertyTaxRate",
    "maintenanceRate",
    "closingCostPercent",
    "discountRate",
    "baseIncomeGrowthRate",
    "expenseGrowthRate",
    "expectedInvestmentReturn",
  ];

  if (percentFields.includes(name)) {
    cleanValue = Math.min(100, cleanValue);
  }

  if (name === "monteCarloRuns") {
    cleanValue = Math.max(100, Math.min(10000, Math.round(cleanValue)));
  }

  if (name === "age") {
    cleanValue = Math.min(120, Math.round(cleanValue));
  }

  if (name === "retirementAge") {
    cleanValue = Math.min(120, Math.round(cleanValue));
  }

  if (name === "dependents") {
    cleanValue = Math.min(20, Math.round(cleanValue));
  }

  if (name === "debtYearsRemaining") {
    cleanValue = Math.min(50, cleanValue);
  }

  if (name === "holdingPeriodYears") {
    cleanValue = Math.min(50, cleanValue);
  }

  return cleanValue;
}
  function updateNumberField(name: NumberFieldName, value: string) {
    setDraftNumbers((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value.trim() !== "" && !Number.isNaN(Number(value))) {
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    }
  }

  function commitNumberField(name: NumberFieldName) {
  const rawValue = draftNumbers[name];

  if (rawValue === undefined) return;

  const cleanValue = rawValue.trim();

  const parsedValue =
    cleanValue === "" || Number.isNaN(Number(cleanValue))
      ? 0
      : Number(cleanValue);

  const finalValue = sanitizeNumberField(name, parsedValue);

  setForm((prev) => ({
    ...prev,
    [name]: finalValue,
  }));

  setDraftNumbers((prev) => {
    const copy = { ...prev };
    delete copy[name];
    return copy;
  });
}

  function renderNumberInput({
  name,
  label,
  helperText,
  stepValue,
  min,
  max,
}: {
  name: NumberFieldName;
  label: string;
  helperText?: string;
  stepValue?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      <input
        className={inputClass}
        type="text"
        inputMode="decimal"
        value={numberValue(name)}
        onChange={(e) => updateNumberField(name, e.target.value)}
        onBlur={() => commitNumberField(name)}
        step={stepValue}
        min={min}
        max={max}
      />

      {helperText && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

  function nextStep() {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  }

  function previousStep() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  function handleCalculate() {
    const incomePV = calculateFutureIncomePV(form);
    const assetValue = calculateAssetValue(form);
    const debtPV = calculateDebtPV(form);
    const expensePV = calculateExpensePV(form);
    const netPosition = calculateNetPosition(form);

    const baseRecommendation = getRecommendation(form, netPosition);

    const baseScore = calculateFinancialScore(
      form,
      netPosition,
      assetValue,
      debtPV
    );

    const actionPlan = generateActionPlan(form, netPosition);
    const scenarioComparison = generateScenarioComparison(form);
    const sensitivityAnalysis = generateSensitivityAnalysis(form);
    const monteCarloResult = runMonteCarloSimulation(form);
    const buyRentAnalysis = generateBuyRentAnalysis(form);
    const modelAudit = generateModelAudit(form, netPosition, assetValue, debtPV);

    const goalAnalysis = generateGoalAnalysis(form);

    const score = applyGoalWeightToScore(baseScore, goalAnalysis);

    const recommendation = applyGoalWeightToRecommendation(
      baseRecommendation,
      goalAnalysis
    );

    onCalculate({
      goal: form.goal,
      incomePV,
      assetValue,
      debtPV,
      expensePV,
      netPosition,
      recommendation,
      score,
      actionPlan,
      scenarioComparison,
      sensitivityAnalysis,
      monteCarloResult,
      buyRentAnalysis,
      goalAnalysis,
      modelAssumptions: {
        discountRate: form.discountRate,
        baseIncomeGrowthRate: form.baseIncomeGrowthRate,
        expenseGrowthRate: form.expenseGrowthRate,
        expectedInvestmentReturn: form.expectedInvestmentReturn,
        monteCarloRuns: form.monteCarloRuns,
      },
      modelAudit,
    });
  }

  return (
    <div className="space-y-6 rounded-[1.35rem] bg-slate-950/80 p-6 text-white">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">
            Step {step} of {totalSteps}
          </p>

          <p className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
            FInsight Flow
          </p>
        </div>

        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <button
          type="button"
          onClick={() => setShowDemoProfiles((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Demo Profiles
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              Load a Sample Profile
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Use these sample users to quickly test the model during a demo.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-950/60 text-cyan-300">
            <span
              className={`text-xl transition-transform duration-200 ${
                showDemoProfiles ? "rotate-180" : ""
              }`}
            >
              ↓
            </span>
          </div>
        </button>

        {showDemoProfiles && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {Object.entries(sampleProfiles).map(([key, profile]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  loadSampleProfile(key as keyof typeof sampleProfiles)
                }
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                <p className="font-semibold text-white">{profile.label}</p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {profile.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {step === 1 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Goal
            </p>
            <h2 className="mt-2 text-2xl font-bold">What is your main goal?</h2>
            <p className={mutedText}>
              This now drives a goal-specific model that changes the dashboard,
              score, and recommendation.
            </p>
          </div>

          <div>
            <label className={labelClass}>Main Goal</label>
            <select
              className={inputClass}
              value={form.goal}
              onChange={(e) => updateField("goal", e.target.value)}
            >
              <option value="buy_house">Buy a house</option>
              <option value="rent_vs_buy">Rent vs buy</option>
              <option value="scholarship">Scholarship decision</option>
              <option value="retirement">Retirement readiness</option>
              <option value="invest_assets">Invest assets</option>
            </select>
          </div>

          {(form.goal === "buy_house" || form.goal === "rent_vs_buy") && (
            <div className="space-y-4 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
              <div>
                <p className="text-sm font-semibold text-blue-300">
                  Housing Model Inputs
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  These inputs help calculate affordability, monthly ownership
                  costs, and rent-versus-buy NPV.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {renderNumberInput({
                  name: "targetHousePrice",
                  label: "Target House Price",
                })}
                {renderNumberInput({
                  name: "monthlyRent",
                  label: "Monthly Rent",
                })}
                {renderNumberInput({
                  name: "downPaymentPercent",
                  label: "Down Payment (%)",
                  stepValue: "0.1",
                })}
                {renderNumberInput({
                  name: "mortgageRate",
                  label: "Mortgage Rate (%)",
                  stepValue: "0.1",
                })}
                {renderNumberInput({
                  name: "holdingPeriodYears",
                  label: "Holding Period Years",
                  helperText:
                    "How many years you expect to own the home before selling or moving.",
                })}
                {renderNumberInput({
                  name: "homeAppreciationRate",
                  label: "Home Appreciation (%)",
                  stepValue: "0.1",
                })}
                {renderNumberInput({
                  name: "propertyTaxRate",
                  label: "Property Tax (%)",
                  stepValue: "0.1",
                })}
                {renderNumberInput({
                  name: "maintenanceRate",
                  label: "Maintenance (% of Home Value)",
                  stepValue: "0.1",
                })}
                {renderNumberInput({
                  name: "closingCostPercent",
                  label: "Closing Costs (%)",
                  stepValue: "0.1",
                })}
              </div>
            </div>
          )}

          {form.goal === "scholarship" && (
            <div className="space-y-4 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4">
              <div>
                <p className="text-sm font-semibold text-purple-300">
                  Scholarship ROI Inputs
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  These inputs estimate net education cost, income benefit,
                  payback period, and education NPV.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {renderNumberInput({
                  name: "educationCost",
                  label: "Estimated Total Education Cost",
                })}
                {renderNumberInput({
                  name: "scholarshipPercent",
                  label: "Scholarship Percent",
                  stepValue: "0.1",
                })}
                {renderNumberInput({
                  name: "expectedIncomeIncrease",
                  label: "Expected Income Increase (%)",
                  stepValue: "0.1",
                })}
              </div>
            </div>
          )}

          {form.goal === "retirement" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
              <p className="font-semibold text-emerald-300">
                Retirement model active
              </p>
              <p className="mt-2">
                The dashboard will estimate years until retirement, projected
                assets at retirement, retirement need, coverage ratio, and
                surplus or gap.
              </p>
            </div>
          )}

          {form.goal === "invest_assets" && (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
              <p className="font-semibold text-cyan-300">
                Investment readiness model active
              </p>
              <p className="mt-2">
                The dashboard will test emergency fund strength, high-interest
                debt, investable assets, monthly surplus, and directional
                allocation logic.
              </p>
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Profile
            </p>
            <h2 className="mt-2 text-2xl font-bold">Tell us about you</h2>
            <p className={mutedText}>
              Basic personal details help estimate your time horizon and future
              obligations.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderNumberInput({ name: "age", label: "Age" })}
            {renderNumberInput({
              name: "retirementAge",
              label: "Retirement Age",
            })}
            {renderNumberInput({
              name: "dependents",
              label: "Number of Dependents",
            })}

            <div>
              <label className={labelClass}>City Type</label>
              <select
                className={inputClass}
                value={form.cityType}
                onChange={(e) => updateField("cityType", e.target.value)}
              >
                <option value="city">City</option>
                <option value="suburban">Suburban</option>
                <option value="rural">Rural</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Income
            </p>
            <h2 className="mt-2 text-2xl font-bold">Income and work</h2>
            <p className={mutedText}>
              This estimates your future income in present value terms.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Occupation Status</label>
              <select
                className={inputClass}
                value={form.occupationStatus}
                onChange={(e) =>
                  updateField("occupationStatus", e.target.value)
                }
              >
                <option value="student">Student</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-employed</option>
                <option value="retired">Retired</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Industry</label>
              <select
                className={inputClass}
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
              >
                <option value="finance">Finance</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="real_estate">Real Estate</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>

            {renderNumberInput({
              name: "income",
              label: "Annual Income",
            })}
            {renderNumberInput({
              name: "monthlyExpenses",
              label: "Monthly Expenses",
            })}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Assets
            </p>
            <h2 className="mt-2 text-2xl font-bold">Assets and savings</h2>
            <p className={mutedText}>
              Add your cash, investments, and real estate value.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderNumberInput({ name: "savings", label: "Savings" })}
            {renderNumberInput({
              name: "emergencyFund",
              label: "Emergency Fund",
              helperText:
               "Cash specifically set aside for emergencies. The model also counts general savings as part of your liquid safety cushion.",
            })}
            {renderNumberInput({ name: "stockValue", label: "Stock Value" })}
            {renderNumberInput({
              name: "bondValue",
              label: "Current Bond Market Value",
              helperText:
                "Enter the current estimated market value of your bond holdings, not the original purchase price or face value.",
            })}

            {renderNumberInput({
              name: "realEstateValue",
              label: "Current Real Estate Market Value",
              helperText:
                "Enter today's estimated market value of owned real estate, not the mortgage balance or original purchase price.",
            })}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Debt
            </p>
            <h2 className="mt-2 text-2xl font-bold">Debt profile</h2>
            <p className={mutedText}>
              Debt can heavily change the recommendation, especially
              high-interest credit card debt.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderNumberInput({
              name: "debtPayment",
              label: "Monthly Debt Payment",
            })}
            {renderNumberInput({
              name: "debtInterestRate",
              label: "Debt Interest Rate (%)",
              helperText:
                "Used to estimate the present value of remaining debt payments. Higher rates make debt more costly.",
              stepValue: "0.1",
            })}
            {renderNumberInput({
              name: "debtYearsRemaining",
              label: "Debt Years Remaining",
            })}
            {renderNumberInput({
              name: "creditCardDebt",
              label: "Credit Card Debt",
            })}
            {renderNumberInput({
              name: "creditCardAPR",
              label: "Credit Card APR (%)",
              stepValue: "0.1",
            })}
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Strategy
            </p>
            <h2 className="mt-2 text-2xl font-bold">Risk and timeline</h2>
            <p className={mutedText}>
              Final filter: how much risk you can handle and when you need the
              money.
            </p>
          </div>

          <div>
            <label className={labelClass}>Risk Tolerance</label>
            <select
              className={inputClass}
              value={form.riskTolerance}
              onChange={(e) => updateField("riskTolerance", e.target.value)}
            >
              <option value="risk_averse">Risk averse</option>
              <option value="risk_neutral">Risk neutral</option>
              <option value="risk_seeker">Risk seeker</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Time Horizon</label>
            <select
              className={inputClass}
              value={form.timeHorizon}
              onChange={(e) => updateField("timeHorizon", e.target.value)}
            >
              <option value="under_1_year">Under 1 year</option>
              <option value="1_5_years">1-5 years</option>
              <option value="5_10_years">5-10 years</option>
              <option value="10_20_years">10-20 years</option>
              <option value="20_plus_years">20+ years</option>
            </select>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Used in the recommendation logic. Shorter timelines favor liquidity and
              lower risk, while longer timelines allow more growth-oriented strategies.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
            <p>
              After clicking calculate, the app will estimate your income PV,
              asset value, debt PV, expense PV, net position, and
              recommendation.
            </p>
          </div>
        </section>
      )}

      {step === 7 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Model Assumptions
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Adjust the model assumptions
            </h2>
            <p className={mutedText}>
              These assumptions control present value calculations, sensitivity
              analysis, Monte Carlo simulation, goal analysis, and the final
              recommendation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderNumberInput({
              name: "discountRate",
              label: "Discount Rate (%)",
              stepValue: "0.1",
            })}
            {renderNumberInput({
              name: "baseIncomeGrowthRate",
              label: "Base Income Growth (%)",
              stepValue: "0.1",
            })}
            {renderNumberInput({
              name: "expenseGrowthRate",
              label: "Expense Growth / Inflation (%)",
              stepValue: "0.1",
            })}
            {renderNumberInput({
              name: "expectedInvestmentReturn",
              label: "Expected Investment Return (%)",
              stepValue: "0.1",
            })}
            {renderNumberInput({
              name: "monteCarloRuns",
              label: "Monte Carlo Runs",
              stepValue: "100",
              min: "100",
              max: "10000",
            })}
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
            <p className="font-semibold text-cyan-300">Why this matters</p>
            <p className="mt-2">
              A higher discount rate lowers the present value of future cash
              flows. Income growth changes projected earnings. Expense growth
              estimates how costs rise over time. Expected investment return
              affects simulated asset growth. Monte Carlo runs control how many
              randomized scenarios the model tests.
            </p>
          </div>
        </section>
      )}

      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button
            type="button"
            onClick={previousStep}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Back
          </button>
        )}

        {step < totalSteps && (
          <button
            type="button"
            onClick={nextStep}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
          >
            Next
          </button>
        )}

        {step === totalSteps && (
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
          >
            Calculate Recommendation
          </button>
        )}
      </div>
    </div>
  );
}