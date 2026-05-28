import { FinancialInput, ScoreBreakdown } from "@/types/financial";

function clampCategoryScore(score: number): number {
  return Math.max(0, Math.min(25, Math.round(score)));
}

function clampTotalScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getLiquidSafetyAssets(input: FinancialInput): number {
  return input.savings + input.emergencyFund;
}

function getLiquidSafetyMonths(input: FinancialInput): number {
  if (input.monthlyExpenses <= 0) return 0;

  return getLiquidSafetyAssets(input) / input.monthlyExpenses;
}

function isHousingGoal(input: FinancialInput): boolean {
  return input.goal === "buy_house" || input.goal === "rent_vs_buy";
}

function calculateRetirementNeed(input: FinancialInput): number {
  const annualExpenses = input.monthlyExpenses * 12;

  if (annualExpenses <= 0) return 0;

  return annualExpenses * 25;
}

function calculateRetirementCoverageRatio(
  input: FinancialInput,
  assetValue: number
): number {
  const retirementNeed = calculateRetirementNeed(input);

  if (retirementNeed <= 0) return 0;

  return assetValue / retirementNeed;
}

function applyGoalAwareScoreCap(
  input: FinancialInput,
  totalScore: number,
  goalFitScore: number,
  netPosition: number,
  assetValue: number
): number {
  let adjustedScore = totalScore;

  if (input.goal === "retirement") {
    const retirementCoverageRatio = calculateRetirementCoverageRatio(
      input,
      assetValue
    );

    /*
      Retirement should be more heavily capped because the goal itself is the
      user's selected objective. A user can have strong liquidity, low debt,
      and assets, but if projected assets cover less than retirement need,
      the overall readiness score should not look overly strong.
    */
    if (retirementCoverageRatio < 0.5) {
      adjustedScore = Math.min(adjustedScore, 60);
    } else if (retirementCoverageRatio < 0.75) {
      adjustedScore = Math.min(adjustedScore, 70);
    } else if (retirementCoverageRatio < 1) {
      adjustedScore = Math.min(adjustedScore, 80);
    }

    if (netPosition < 0) {
      adjustedScore = Math.min(adjustedScore, 65);
    }

    if (goalFitScore <= 5) {
      adjustedScore = Math.min(adjustedScore, 60);
    }
  }

  if (isHousingGoal(input)) {
    const housePriceToIncome =
      input.income > 0 ? input.targetHousePrice / input.income : Infinity;

    if (housePriceToIncome > 8) {
      adjustedScore = Math.min(adjustedScore, 60);
    } else if (housePriceToIncome > 5) {
      adjustedScore = Math.min(adjustedScore, 75);
    }
  }

  if (goalFitScore <= 7) {
    adjustedScore = Math.min(adjustedScore, 65);
  } else if (goalFitScore <= 12) {
    adjustedScore = Math.min(adjustedScore, 75);
  }

  return clampTotalScore(adjustedScore);
}

export function calculateFinancialScore(
  input: FinancialInput,
  netPosition: number,
  assetValue: number,
  debtPV: number
): ScoreBreakdown {
  const liquidSafetyAssets = getLiquidSafetyAssets(input);
  const liquidSafetyMonths = getLiquidSafetyMonths(input);

  const emergencyFundScore = clampCategoryScore(
    (liquidSafetyMonths / 6) * 25
  );

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

  debtHealthScore = clampCategoryScore(debtHealthScore);

  const annualExpenses = input.monthlyExpenses * 12;

  const assetToExpenseRatio =
    annualExpenses > 0 ? assetValue / annualExpenses : 0;

  const assetStrengthScore = clampCategoryScore(
    (assetToExpenseRatio / 3) * 25
  );

  let goalFitScore = 15;

  if (isHousingGoal(input)) {
    const downPaymentTarget = input.targetHousePrice * 0.2;
    const housePriceToIncome =
      input.income > 0 ? input.targetHousePrice / input.income : Infinity;

    if (housePriceToIncome > 8) {
      goalFitScore = 7;
    } else if (housePriceToIncome > 5) {
      goalFitScore = 12;
    } else if (liquidSafetyAssets >= downPaymentTarget) {
      goalFitScore = 25;
    } else if (input.timeHorizon === "under_1_year") {
      goalFitScore = 8;
    } else if (input.timeHorizon === "1_5_years") {
      goalFitScore = 14;
    } else {
      goalFitScore = 19;
    }
  } else if (input.goal === "scholarship") {
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
  } else if (input.goal === "retirement") {
    const retirementCoverageRatio = calculateRetirementCoverageRatio(
      input,
      assetValue
    );

    if (retirementCoverageRatio >= 1.25 && netPosition > 0) {
      goalFitScore = 25;
    } else if (retirementCoverageRatio >= 1 && netPosition > 0) {
      goalFitScore = 22;
    } else if (retirementCoverageRatio >= 0.75) {
      goalFitScore = 16;
    } else if (retirementCoverageRatio >= 0.5) {
      goalFitScore = 10;
    } else {
      goalFitScore = 4;
    }
  } else if (input.goal === "invest_assets") {
    if (
      liquidSafetyMonths >= 3 &&
      input.creditCardDebt === 0 &&
      input.creditCardAPR < 15
    ) {
      goalFitScore = 25;
    } else if (liquidSafetyMonths >= 3 && input.creditCardAPR < 15) {
      goalFitScore = 22;
    } else {
      goalFitScore = 10;
    }
  }

  goalFitScore = clampCategoryScore(goalFitScore);

  const rawTotalScore = clampTotalScore(
    emergencyFundScore + debtHealthScore + assetStrengthScore + goalFitScore
  );

  const totalScore = applyGoalAwareScoreCap(
    input,
    rawTotalScore,
    goalFitScore,
    netPosition,
    assetValue
  );

  return {
    emergencyFundScore,
    debtHealthScore,
    assetStrengthScore,
    goalFitScore,
    totalScore,
  };
}