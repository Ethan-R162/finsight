"use client";

import { useState } from "react";
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

type Props = {
  onCalculate: (result: FinancialResult) => void;
};

type NumberFieldName = {
  [K in keyof FinancialInput]: FinancialInput[K] extends number ? K : never;
}[keyof FinancialInput];

const totalSteps = 7;

export default function FinancialForm({ onCalculate }: Props) {
  const [step, setStep] = useState(1);

  const [draftNumbers, setDraftNumbers] = useState<
    Partial<Record<NumberFieldName, string>>
  >({});

  const [form, setForm] = useState<FinancialInput>({
    age: 25,
    retirementAge: 65,
    income: 75000,
    savings: 10000,
    emergencyFund: 5000,
    stockValue: 5000,
    bondValue: 0,
    realEstateValue: 0,
    debtPayment: 300,
    debtInterestRate: 6,
    creditCardDebt: 0,
    creditCardAPR: 0,
    debtYearsRemaining: 10,
    monthlyExpenses: 3000,
    dependents: 0,
    cityType: "city",
    occupationStatus: "employed",
    industry: "finance",
    targetHousePrice: 500000,
    scholarshipPercent: 0,
    expectedIncomeIncrease: 0,
    monthlyRent: 2500,
    downPaymentPercent: 20,
    mortgageRate: 6.5,
    holdingPeriodYears: 7,
    homeAppreciationRate: 3,
    propertyTaxRate: 1.2,
    maintenanceRate: 1,
    closingCostPercent: 3,
    discountRate: 5,
    baseIncomeGrowthRate: 2,
    expenseGrowthRate: 2.5,
    expectedInvestmentReturn: 6,
    monteCarloRuns: 1000,
    riskTolerance: "risk_neutral",
    timeHorizon: "5_10_years",
    goal: "buy_house",
  });

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10";

  const labelClass = "block text-sm font-medium text-slate-300";

  const mutedText = "text-sm leading-6 text-slate-400";

  function updateField(name: keyof FinancialInput, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function numberValue(name: NumberFieldName) {
    return draftNumbers[name] ?? String(form[name] ?? 0);
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

    const finalValue =
      cleanValue === "" || Number.isNaN(Number(cleanValue))
        ? 0
        : Number(cleanValue);

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
    stepValue,
    min,
    max,
  }: {
    name: NumberFieldName;
    label: string;
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
    const recommendation = getRecommendation(form, netPosition);
    const score = calculateFinancialScore(form, netPosition, assetValue, debtPV);
    const actionPlan = generateActionPlan(form, netPosition);
    const scenarioComparison = generateScenarioComparison(form);
    const sensitivityAnalysis = generateSensitivityAnalysis(form);
    const monteCarloResult = runMonteCarloSimulation(form);
    const buyRentAnalysis = generateBuyRentAnalysis(form);
    const modelAudit = generateModelAudit(form, netPosition, assetValue, debtPV);

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

      {step === 1 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Goal
            </p>
            <h2 className="mt-2 text-2xl font-bold">What is your main goal?</h2>
            <p className={mutedText}>
              This helps the app decide which financial rules matter most.
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
                  Buy vs Rent NPV Inputs
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  These inputs are used to compare the present value cost of
                  renting versus buying.
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
            <div className="grid gap-4 md:grid-cols-2">
              {renderNumberInput({
                name: "scholarshipPercent",
                label: "Scholarship Percent",
              })}
              {renderNumberInput({
                name: "expectedIncomeIncrease",
                label: "Expected Income Increase (%)",
              })}
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
            })}
            {renderNumberInput({ name: "stockValue", label: "Stock Value" })}
            {renderNumberInput({ name: "bondValue", label: "Bond Value" })}
            {renderNumberInput({
              name: "realEstateValue",
              label: "Real Estate Value",
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
              analysis, Monte Carlo simulation, and the final recommendation.
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
