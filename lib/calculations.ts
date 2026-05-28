import { FinancialInput } from "@/types/financial";
import {
  getCityExpenseGrowthAdjustment,
  getCityExpenseMultiplier,
} from "@/lib/geography";

export function presentValueOfAnnuity(
  payment: number,
  rate: number,
  periods: number
): number {
  if (periods <= 0) return 0;
  if (rate === 0) return payment * periods;

  return payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
}

function percentToDecimal(value: number): number {
  return value / 100;
}

function getIndustryGrowthRate(industry: FinancialInput["industry"]): number {
  const rates = {
    finance: 0.034,
    technology: 0.065,
    healthcare: 0.084,
    real_estate: 0.033,
    education: 0.002,
    retail: -0.012,
    other: 0.031,
  };

  return rates[industry];
}

function normalizeIncomeGrowthRate(rawIncomeGrowthRate: number): number {
  const sustainableGrowthRate = 0.05;

  if (rawIncomeGrowthRate <= sustainableGrowthRate) {
    return rawIncomeGrowthRate;
  }

  const excessGrowth = rawIncomeGrowthRate - sustainableGrowthRate;

  return sustainableGrowthRate + excessGrowth * 0.35;
}

export function calculateFutureIncomePV(input: FinancialInput): number {
  const yearsUntilRetirement = Math.max(input.retirementAge - input.age, 0);

  if (input.occupationStatus === "retired") {
    return 0;
  }

  const discountRate = percentToDecimal(input.discountRate);
  const baseIncomeGrowthRate = percentToDecimal(input.baseIncomeGrowthRate);
  const industryGrowthRate = getIndustryGrowthRate(input.industry);

  let rawIncomeGrowthRate = baseIncomeGrowthRate + industryGrowthRate;

  if (input.occupationStatus === "unemployed") {
    rawIncomeGrowthRate = 0;
  }

  const incomeGrowthRate = normalizeIncomeGrowthRate(rawIncomeGrowthRate);

  let totalPV = 0;

  for (let year = 1; year <= yearsUntilRetirement; year++) {
    const projectedIncome = input.income * Math.pow(1 + incomeGrowthRate, year);
    const discountedIncome = projectedIncome / Math.pow(1 + discountRate, year);

    totalPV += discountedIncome;
  }

  return totalPV;
}

export function calculateAssetValue(input: FinancialInput): number {
  return (
    input.savings +
    input.emergencyFund +
    input.stockValue +
    input.bondValue +
    input.realEstateValue
  );
}

export function calculateDebtPV(input: FinancialInput): number {
  const monthlyRate = input.debtInterestRate / 100 / 12;
  const months = input.debtYearsRemaining * 12;

  const normalDebtPV = presentValueOfAnnuity(
    input.debtPayment,
    monthlyRate,
    months
  );

  return normalDebtPV + input.creditCardDebt;
}

export function calculateExpensePV(input: FinancialInput): number {
  const years = Math.max(input.retirementAge - input.age, 0);

  if (years === 0) {
    return 0;
  }

  const cityExpenseMultiplier = getCityExpenseMultiplier(input.cityType);
  const cityGrowthAdjustment = getCityExpenseGrowthAdjustment(input.cityType);

  const adjustedAnnualExpenses =
    input.monthlyExpenses * 12 * cityExpenseMultiplier;

  const discountRate = input.discountRate / 100;

  const expenseGrowthRate = Math.max(
    -0.02,
    input.expenseGrowthRate / 100 + cityGrowthAdjustment
  );

  let presentValue = 0;

  for (let year = 1; year <= years; year += 1) {
    const projectedExpense =
      adjustedAnnualExpenses * Math.pow(1 + expenseGrowthRate, year);

    presentValue += projectedExpense / Math.pow(1 + discountRate, year);
  }

  return presentValue;
}

export function calculateNetPosition(input: FinancialInput): number {
  const incomePV = calculateFutureIncomePV(input);
  const assets = calculateAssetValue(input);
  const debtPV = calculateDebtPV(input);
  const expensePV = calculateExpensePV(input);

  return incomePV + assets - debtPV - expensePV;
}