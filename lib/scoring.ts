import { FinancialInput, ScoreBreakdown } from "@/types/financial";

function clampScore(score: number): number {
  return Math.max(0, Math.min(25, Math.round(score)));
}

export function calculateFinancialScore(
  input: FinancialInput,
  netPosition: number,
  assetValue: number,
  debtPV: number
): ScoreBreakdown {
  const emergencyFundMonths =
    input.monthlyExpenses > 0
      ? input.emergencyFund / input.monthlyExpenses
      : 0;

  const emergencyFundScore = clampScore((emergencyFundMonths / 6) * 25);

  let debtHealthScore = 25;

  if (input.creditCardDebt > 0 && input.creditCardAPR >= 15) {
    debtHealthScore -= 15;
  }

  if (debtPV > assetValue && debtPV > 0) {
    debtHealthScore -= 8;
  }

  if (input.debtInterestRate >= 8) {
    debtHealthScore -= 5;
  }

  debtHealthScore = clampScore(debtHealthScore);

  const assetToExpenseRatio =
    input.monthlyExpenses > 0
      ? assetValue / (input.monthlyExpenses * 12)
      : 0;

  const assetStrengthScore = clampScore((assetToExpenseRatio / 3) * 25);

  let goalFitScore = 15;

  if (input.goal === "buy_house" || input.goal === "rent_vs_buy") {
    const downPaymentTarget = input.targetHousePrice * 0.2;

    if (input.savings + input.emergencyFund >= downPaymentTarget) {
      goalFitScore = 25;
    } else if (input.timeHorizon === "under_1_year") {
      goalFitScore = 8;
    } else if (input.timeHorizon === "1_5_years") {
      goalFitScore = 14;
    } else {
      goalFitScore = 19;
    }
  }

  if (input.goal === "scholarship") {
    if (input.scholarshipPercent >= 75) {
      goalFitScore = 25;
    } else if (
      input.scholarshipPercent >= 50 &&
      input.expectedIncomeIncrease >= 20
    ) {
      goalFitScore = 21;
    } else if (
      input.scholarshipPercent >= 25 &&
      input.expectedIncomeIncrease >= 40
    ) {
      goalFitScore = 17;
    } else {
      goalFitScore = 10;
    }
  }

  if (input.goal === "retirement") {
    if (netPosition > 0 && input.age >= 50) {
      goalFitScore = 22;
    } else if (netPosition > 0) {
      goalFitScore = 17;
    } else {
      goalFitScore = 8;
    }
  }

  if (input.goal === "invest_assets") {
    if (emergencyFundMonths >= 3 && input.creditCardAPR < 15) {
      goalFitScore = 22;
    } else {
      goalFitScore = 10;
    }
  }

  goalFitScore = clampScore(goalFitScore);

  const totalScore =
    emergencyFundScore +
    debtHealthScore +
    assetStrengthScore +
    goalFitScore;

  return {
    emergencyFundScore,
    debtHealthScore,
    assetStrengthScore,
    goalFitScore,
    totalScore,
  };
}