import { FinancialInput } from "@/types/financial";

export const defaultFinancialInput: FinancialInput = {
  age: 25,
  retirementAge: 65,

  income: 75000,
  savings: 10000,
  emergencyFund: 5000,
  monthlyExpenses: 3000,

  stockValue: 5000,
  bondValue: 0,
  realEstateValue: 0,

  debtPayment: 300,
  debtInterestRate: 6,
  debtYearsRemaining: 10,

  creditCardDebt: 0,
  creditCardAPR: 0,

  dependents: 0,
  cityType: "city",
  occupationStatus: "employed",
  industry: "finance",

  targetHousePrice: 500000,
  scholarshipPercent: 0,
  expectedIncomeIncrease: 0,
  educationCost: 0,

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
};
