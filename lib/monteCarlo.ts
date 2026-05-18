import { FinancialInput, MonteCarloResult } from "@/types/financial";
import { presentValueOfAnnuity } from "@/lib/calculations";

function randomNormal(mean: number, standardDeviation: number): number {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  const standardNormal =
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  return mean + standardDeviation * standardNormal;
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((percentileValue / 100) * (sorted.length - 1));

  return sorted[index];
}

function getIndustryGrowthBaseline(
  industry: FinancialInput["industry"]
): number {
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

function calculateSimulatedIncomePV(
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

function calculateSimulatedExpensePV(
  input: FinancialInput,
  expenseGrowthRate: number,
  discountRate: number
): number {
  const yearsUntilRetirement = Math.max(input.retirementAge - input.age, 0);

  let totalPV = 0;

  for (let year = 1; year <= yearsUntilRetirement; year++) {
    const annualExpenses =
      input.monthlyExpenses * 12 * Math.pow(1 + expenseGrowthRate, year);

    const discountedExpenses =
      annualExpenses / Math.pow(1 + discountRate, year);

    totalPV += discountedExpenses;
  }

  return totalPV;
}

function calculateSimulatedAssetValue(
  input: FinancialInput,
  investmentReturn: number
): number {
  const liquidAssets = input.savings + input.emergencyFund;
  const investedAssets =
    input.stockValue + input.bondValue + input.realEstateValue;

  const projectedInvestedAssets = investedAssets * (1 + investmentReturn);

  return liquidAssets + projectedInvestedAssets;
}

function calculateSimulatedDebtPV(
  input: FinancialInput,
  discountRate: number
): number {
  const monthlyDiscountRate = discountRate / 12;
  const months = input.debtYearsRemaining * 12;

  const normalDebtPV = presentValueOfAnnuity(
    input.debtPayment,
    monthlyDiscountRate,
    months
  );

  return normalDebtPV + input.creditCardDebt;
}

function calculateSimulatedNetPosition(
  input: FinancialInput,
  incomeGrowthRate: number,
  discountRate: number,
  investmentReturn: number,
  expenseGrowthRate: number
): number {
  const incomePV = calculateSimulatedIncomePV(
    input,
    incomeGrowthRate,
    discountRate
  );

  const assetValue = calculateSimulatedAssetValue(input, investmentReturn);

  const debtPV = calculateSimulatedDebtPV(input, discountRate);

  const expensePV = calculateSimulatedExpensePV(
    input,
    expenseGrowthRate,
    discountRate
  );

  return incomePV + assetValue - debtPV - expensePV;
}

export function runMonteCarloSimulation(
  input: FinancialInput
): MonteCarloResult {
  const simulations = Math.max(100, Math.min(input.monteCarloRuns, 10000));

  const baseIndustryGrowth = getIndustryGrowthBaseline(input.industry);
  const baseDiscountRate = input.discountRate / 100;
  const baseInvestmentReturn = input.expectedInvestmentReturn / 100;
  const baseExpenseGrowth = input.expenseGrowthRate / 100;

  const rawBaseIncomeGrowth =
    input.occupationStatus === "unemployed"
      ? 0
      : input.baseIncomeGrowthRate / 100 + baseIndustryGrowth;

  const normalizedBaseIncomeGrowth =
    normalizeIncomeGrowthRate(rawBaseIncomeGrowth);

  const netPositions: number[] = [];

  for (let i = 0; i < simulations; i++) {
    const simulatedDiscountRate = Math.max(
      0.01,
      randomNormal(baseDiscountRate, 0.015)
    );

    const rawSimulatedIncomeGrowth = randomNormal(
      normalizedBaseIncomeGrowth,
      0.015
    );

    const simulatedIncomeGrowthRate = Math.max(
      -0.03,
      normalizeIncomeGrowthRate(rawSimulatedIncomeGrowth)
    );

    const investmentReturn = randomNormal(baseInvestmentReturn, 0.08);

    const expenseGrowthRate = Math.max(
      0,
      randomNormal(baseExpenseGrowth, 0.01)
    );

    const simulatedNetPosition = calculateSimulatedNetPosition(
      input,
      simulatedIncomeGrowthRate,
      simulatedDiscountRate,
      investmentReturn,
      expenseGrowthRate
    );

    netPositions.push(simulatedNetPosition);
  }

  const positiveOutcomes = netPositions.filter((value) => value > 0).length;

  const averageNetPosition =
    netPositions.reduce((sum, value) => sum + value, 0) / simulations;

  return {
    simulations,
    probabilityPositive: positiveOutcomes / simulations,
    tenthPercentile: percentile(netPositions, 10),
    median: percentile(netPositions, 50),
    ninetiethPercentile: percentile(netPositions, 90),
    averageNetPosition,
    worstCase: Math.min(...netPositions),
    bestCase: Math.max(...netPositions),
  };
}