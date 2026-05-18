import {
  FinancialInput,
  SensitivityAnalysis,
  SensitivityCell,
} from "@/types/financial";
import { calculateAssetValue, calculateDebtPV } from "@/lib/calculations";

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

function calculateIncomePVWithAssumptions(
  input: FinancialInput,
  incomeGrowthRate: number,
  discountRate: number
): number {
  if (input.occupationStatus === "retired") {
    return 0;
  }

  const yearsUntilRetirement = Math.max(input.retirementAge - input.age, 0);

  let totalPV = 0;

  for (let year = 1; year <= yearsUntilRetirement; year++) {
    const projectedIncome =
      input.income * Math.pow(1 + incomeGrowthRate, year);

    const discountedIncome =
      projectedIncome / Math.pow(1 + discountRate, year);

    totalPV += discountedIncome;
  }

  return totalPV;
}

function calculateExpensePVWithAssumptions(
  input: FinancialInput,
  expenseGrowthRate: number,
  discountRate: number
): number {
  const yearsUntilRetirement = Math.max(input.retirementAge - input.age, 0);
  const annualExpenses = input.monthlyExpenses * 12;

  let totalPV = 0;

  for (let year = 1; year <= yearsUntilRetirement; year++) {
    const projectedExpenses =
      annualExpenses * Math.pow(1 + expenseGrowthRate, year);

    const discountedExpenses =
      projectedExpenses / Math.pow(1 + discountRate, year);

    totalPV += discountedExpenses;
  }

  return totalPV;
}

function calculateNetPositionWithAssumptions(
  input: FinancialInput,
  discountRate: number,
  incomeGrowthRate: number,
  expenseGrowthRate: number
): number {
  const incomePV = calculateIncomePVWithAssumptions(
    input,
    incomeGrowthRate,
    discountRate
  );

  const expensePV = calculateExpensePVWithAssumptions(
    input,
    expenseGrowthRate,
    discountRate
  );

  const assetValue = calculateAssetValue(input);
  const debtPV = calculateDebtPV(input);

  return incomePV + assetValue - debtPV - expensePV;
}

export function generateSensitivityAnalysis(
  input: FinancialInput
): SensitivityAnalysis {
  const baseDiscountRate = input.discountRate / 100;
  const baseExpenseGrowthRate = input.expenseGrowthRate / 100;

  const industryGrowthRate = getIndustryGrowthRate(input.industry);

  const rawBaseIncomeGrowthRate =
    input.occupationStatus === "unemployed"
      ? 0
      : input.baseIncomeGrowthRate / 100 + industryGrowthRate;

  const normalizedBaseIncomeGrowthRate = normalizeIncomeGrowthRate(
    rawBaseIncomeGrowthRate
  );

  const discountRates = [
    Math.max(0.01, baseDiscountRate - 0.01),
    baseDiscountRate,
    baseDiscountRate + 0.01,
    baseDiscountRate + 0.02,
  ];

  const incomeGrowthRates = [
    Math.max(-0.03, normalizedBaseIncomeGrowthRate - 0.03),
    Math.max(-0.03, normalizedBaseIncomeGrowthRate - 0.02),
    Math.max(-0.03, normalizedBaseIncomeGrowthRate - 0.01),
    normalizedBaseIncomeGrowthRate,
  ];

  const table: SensitivityCell[] = [];

  for (const incomeGrowthRate of incomeGrowthRates) {
    for (const discountRate of discountRates) {
      table.push({
        discountRate,
        incomeGrowthRate,
        netPosition: calculateNetPositionWithAssumptions(
          input,
          discountRate,
          incomeGrowthRate,
          baseExpenseGrowthRate
        ),
      });
    }
  }

  const baseCase = calculateNetPositionWithAssumptions(
    input,
    baseDiscountRate,
    normalizedBaseIncomeGrowthRate,
    baseExpenseGrowthRate
  );

  const tableValues = table.map((cell) => cell.netPosition);

  const downsideCase = Math.min(...tableValues, baseCase);
  const upsideCase = Math.max(...tableValues, baseCase);

  return {
    discountRates,
    incomeGrowthRates,
    table,
    baseCase,
    downsideCase,
    upsideCase,
  };
}