import {
    FinancialInput,
    SensitivityAnalysis,
    SensitivityCell,
  } from "@/types/financial";
  import {
    calculateAssetValue,
    calculateDebtPV,
    presentValueOfAnnuity,
  } from "@/lib/calculations";
  
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
    discountRate: number
  ): number {
    const monthlyDiscountRate = discountRate / 12;
    const months = Math.max(input.retirementAge - input.age, 0) * 12;
  
    return presentValueOfAnnuity(
      input.monthlyExpenses,
      monthlyDiscountRate,
      months
    );
  }
  
  function calculateNetPositionWithAssumptions(
    input: FinancialInput,
    discountRate: number,
    incomeGrowthRate: number
  ): number {
    const incomePV = calculateIncomePVWithAssumptions(
      input,
      incomeGrowthRate,
      discountRate
    );
  
    const expensePV = calculateExpensePVWithAssumptions(input, discountRate);
    const assetValue = calculateAssetValue(input);
    const debtPV = calculateDebtPV(input);
  
    return incomePV + assetValue - debtPV - expensePV;
  }
  
  export function generateSensitivityAnalysis(
    input: FinancialInput
  ): SensitivityAnalysis {
    const discountRates = [0.04, 0.05, 0.06, 0.07];
    const incomeGrowthRates = [0.01, 0.02, 0.03, 0.04];
  
    const table: SensitivityCell[] = [];
  
    for (const incomeGrowthRate of incomeGrowthRates) {
      for (const discountRate of discountRates) {
        table.push({
          discountRate,
          incomeGrowthRate,
          netPosition: calculateNetPositionWithAssumptions(
            input,
            discountRate,
            incomeGrowthRate
          ),
        });
      }
    }
  
    const baseCase = calculateNetPositionWithAssumptions(input, 0.05, 0.03);
    const downsideCase = calculateNetPositionWithAssumptions(input, 0.07, 0.01);
    const upsideCase = calculateNetPositionWithAssumptions(input, 0.04, 0.04);
  
    return {
      discountRates,
      incomeGrowthRates,
      table,
      baseCase,
      downsideCase,
      upsideCase,
    };
  }