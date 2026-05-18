import { FinancialInput, GoalAnalysis, GoalAnalysisStatus } from "@/types/financial";
import { generateBuyRentAnalysis } from "@/lib/buyRent";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function mortgagePayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  const monthlyRate = annualRatePercent / 100 / 12;
  const months = years * 12;

  if (principal <= 0) return 0;

  if (monthlyRate === 0) {
    return principal / months;
  }

  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

function getStatusFromScore(score: number): GoalAnalysisStatus {
  if (score >= 75) return "strong";
  if (score >= 50) return "watch";
  return "risky";
}

function getScoreAdjustment(score: number): number {
  if (score >= 80) return 5;
  if (score >= 65) return 2;
  if (score >= 50) return -3;
  if (score >= 35) return -7;
  return -12;
}

function totalCurrentAssets(input: FinancialInput): number {
  return (
    input.savings +
    input.emergencyFund +
    input.stockValue +
    input.bondValue +
    input.realEstateValue
  );
}

function investableAssets(input: FinancialInput): number {
  return input.savings + input.stockValue + input.bondValue;
}

function analyzeBuyHouse(input: FinancialInput): GoalAnalysis {
  const monthlyIncome = input.income / 12;
  const requiredDownPayment =
    input.targetHousePrice * (input.downPaymentPercent / 100);

  const protectedEmergencyFund = input.monthlyExpenses * 3;
  const excessEmergencyFund = Math.max(input.emergencyFund - protectedEmergencyFund, 0);

  const availableForDownPayment = input.savings + excessEmergencyFund;
  const downPaymentGap = requiredDownPayment - availableForDownPayment;

  const loanAmount = Math.max(input.targetHousePrice - requiredDownPayment, 0);
  const estimatedMortgagePayment = mortgagePayment(
    loanAmount,
    input.mortgageRate,
    30
  );

  const monthlyPropertyTax =
    (input.targetHousePrice * (input.propertyTaxRate / 100)) / 12;

  const monthlyMaintenance =
    (input.targetHousePrice * (input.maintenanceRate / 100)) / 12;

  const estimatedMonthlyHousingCost =
    estimatedMortgagePayment + monthlyPropertyTax + monthlyMaintenance;

  const housingCostRatio =
    monthlyIncome > 0 ? estimatedMonthlyHousingCost / monthlyIncome : 1;

  const nonHousingDebtPayment =
    input.debtPayment + input.creditCardDebt * 0.03;

  const debtToIncomeRatio =
    monthlyIncome > 0
      ? (estimatedMonthlyHousingCost + nonHousingDebtPayment) / monthlyIncome
      : 1;

  const homePriceToIncome =
    input.income > 0 ? input.targetHousePrice / input.income : 999;

  let score = 100;

  if (downPaymentGap > 0) score -= 25;
  if (housingCostRatio > 0.3) score -= 15;
  if (housingCostRatio > 0.4) score -= 15;
  if (debtToIncomeRatio > 0.36) score -= 15;
  if (debtToIncomeRatio > 0.43) score -= 15;
  if (homePriceToIncome > 4) score -= 10;
  if (homePriceToIncome > 6) score -= 10;

  score = clamp(score, 0, 100);
  const status = getStatusFromScore(score);

  return {
    goal: input.goal,
    title: "Home Purchase Affordability Analysis",
    status,
    goalScore: score,
    scoreAdjustment: getScoreAdjustment(score),
    summary:
      status === "strong"
        ? "The home purchase goal looks financially reasonable based on down payment strength, income coverage, and debt pressure."
        : status === "watch"
        ? "The home purchase goal may be possible, but some affordability ratios are stretched and should be reviewed carefully."
        : "The home purchase goal looks risky based on the current affordability inputs. The model suggests improving down payment strength, lowering target price, or reducing debt before buying.",
    recommendationImpact:
      status === "strong"
        ? "Goal analysis supports the overall recommendation."
        : status === "watch"
        ? "Goal analysis makes the recommendation more cautious."
        : "Goal analysis materially weakens the recommendation because the selected home target may not be affordable.",
    metrics: [
      {
        label: "Required Down Payment",
        value: formatCurrency(requiredDownPayment),
        detail: `${input.downPaymentPercent}% of target home price`,
      },
      {
        label: "Available for Down Payment",
        value: formatCurrency(availableForDownPayment),
        detail: "Savings plus emergency funds above 3 months of expenses",
      },
      {
        label: "Down Payment Gap",
        value: formatCurrency(Math.max(downPaymentGap, 0)),
        detail: downPaymentGap > 0 ? "Additional cash needed" : "No gap",
      },
      {
        label: "Monthly Housing Cost",
        value: formatCurrency(estimatedMonthlyHousingCost),
        detail: "Mortgage + property tax + maintenance",
      },
      {
        label: "Housing Cost / Income",
        value: formatPercent(housingCostRatio * 100),
        detail: "Below 30% is usually stronger",
      },
      {
        label: "Debt-to-Income Ratio",
        value: formatPercent(debtToIncomeRatio * 100),
        detail: "Below 36% is usually stronger",
      },
      {
        label: "Home Price / Income",
        value: `${homePriceToIncome.toFixed(1)}x`,
        detail: "Lower multiples are more affordable",
      },
    ],
    decisionRules: [
      "Housing cost above 30% of monthly income creates caution.",
      "Debt-to-income above 36% creates caution.",
      "Debt-to-income above 43% creates a major affordability warning.",
      "A down payment gap lowers the goal score.",
      "A home price above 4x income creates affordability pressure.",
    ],
  };
}

function analyzeRentVsBuy(input: FinancialInput): GoalAnalysis {
  const buyRent = generateBuyRentAnalysis(input);
  const absoluteDifference = Math.abs(buyRent.difference);

  const monthlyIncome = input.income / 12;
  const rentToIncome = monthlyIncome > 0 ? input.monthlyRent / monthlyIncome : 1;

  let score = 70;

  if (buyRent.recommendation === "buy") score += 10;
  if (buyRent.recommendation === "rent") score += 5;

  if (rentToIncome > 0.3) score -= 10;
  if (rentToIncome > 0.4) score -= 15;

  if (absoluteDifference > input.income) score += 10;

  score = clamp(score, 0, 100);
  const status = getStatusFromScore(score);

  return {
    goal: input.goal,
    title: "Rent vs Buy NPV Analysis",
    status,
    goalScore: score,
    scoreAdjustment: getScoreAdjustment(score),
    summary: buyRent.summary,
    recommendationImpact:
      status === "strong"
        ? "The rent vs buy model gives a clear enough signal to support the final recommendation."
        : status === "watch"
        ? "The rent vs buy model gives a usable signal, but the decision is sensitive to assumptions."
        : "The rent vs buy model is risky or stretched, so the final recommendation should be cautious.",
    metrics: [
      {
        label: "PV Cost of Renting",
        value: formatCurrency(buyRent.rentPV),
        detail: "Present value cost over holding period",
      },
      {
        label: "PV Cost of Buying",
        value: formatCurrency(buyRent.buyPV),
        detail: "Present value cost over holding period",
      },
      {
        label: "NPV Difference",
        value: formatCurrency(buyRent.difference),
        detail: "Difference between renting and buying",
      },
      {
        label: "Model Signal",
        value: buyRent.recommendation.toUpperCase(),
        detail: "Lower PV cost is treated as better",
      },
      {
        label: "Rent / Income",
        value: formatPercent(rentToIncome * 100),
        detail: "Monthly rent divided by monthly income",
      },
    ],
    decisionRules: [
      "The lower present value cost is treated as the better modeled choice.",
      "Rent above 30% of income creates affordability caution.",
      "A larger NPV difference creates a stronger decision signal.",
      "The result depends heavily on mortgage rate, rent, home appreciation, and holding period.",
    ],
  };
}

function analyzeRetirement(input: FinancialInput): GoalAnalysis {
  const yearsUntilRetirement = Math.max(input.retirementAge - input.age, 0);

  const startingAssets = totalCurrentAssets(input);
  const annualSurplus = Math.max(
    input.income - input.monthlyExpenses * 12 - input.debtPayment * 12,
    0
  );

  const investmentReturn = input.expectedInvestmentReturn / 100;
  const expenseGrowth = input.expenseGrowthRate / 100;

  const projectedStartingAssets =
    startingAssets * Math.pow(1 + investmentReturn, yearsUntilRetirement);

  const projectedAnnualContributions =
    investmentReturn === 0
      ? annualSurplus * yearsUntilRetirement
      : annualSurplus *
        ((Math.pow(1 + investmentReturn, yearsUntilRetirement) - 1) /
          investmentReturn);

  const projectedAssetsAtRetirement =
    projectedStartingAssets + projectedAnnualContributions;

  const projectedAnnualExpensesAtRetirement =
    input.monthlyExpenses *
    12 *
    Math.pow(1 + expenseGrowth, yearsUntilRetirement);

  const retirementNeed = projectedAnnualExpensesAtRetirement * 25;
  const retirementGap = projectedAssetsAtRetirement - retirementNeed;

  const coverageRatio =
    retirementNeed > 0 ? projectedAssetsAtRetirement / retirementNeed : 0;

  let score = coverageRatio * 100;

  if (yearsUntilRetirement < 10 && coverageRatio < 1) score -= 15;
  if (annualSurplus <= 0) score -= 15;

  score = clamp(score, 0, 100);
  const status = getStatusFromScore(score);

  return {
    goal: input.goal,
    title: "Retirement Readiness Analysis",
    status,
    goalScore: score,
    scoreAdjustment: getScoreAdjustment(score),
    summary:
      status === "strong"
        ? "The retirement model suggests the user is on track based on projected assets, annual surplus, expected returns, and future expenses."
        : status === "watch"
        ? "The retirement model shows partial readiness, but the result depends heavily on savings rate, returns, and expense growth."
        : "The retirement model shows a projected shortfall. The user may need higher savings, lower expenses, later retirement, or stronger asset growth.",
    recommendationImpact:
      status === "strong"
        ? "Retirement analysis supports the overall recommendation."
        : status === "watch"
        ? "Retirement analysis adds caution because the long-term gap is not fully solved."
        : "Retirement analysis weakens the recommendation because the projected retirement gap is material.",
    metrics: [
      {
        label: "Years Until Retirement",
        value: `${yearsUntilRetirement}`,
        detail: "Retirement age minus current age",
      },
      {
        label: "Projected Assets at Retirement",
        value: formatCurrency(projectedAssetsAtRetirement),
        detail: "Current assets plus projected annual surplus",
      },
      {
        label: "Projected Annual Expenses",
        value: formatCurrency(projectedAnnualExpensesAtRetirement),
        detail: "Current expenses grown by expense growth assumption",
      },
      {
        label: "Estimated Retirement Need",
        value: formatCurrency(retirementNeed),
        detail: "Projected annual expenses × 25",
      },
      {
        label: "Retirement Surplus / Gap",
        value: formatCurrency(retirementGap),
        detail: retirementGap >= 0 ? "Projected surplus" : "Projected shortfall",
      },
      {
        label: "Coverage Ratio",
        value: `${coverageRatio.toFixed(2)}x`,
        detail: "Projected assets divided by estimated retirement need",
      },
    ],
    decisionRules: [
      "Retirement need is estimated using a 25x annual expense multiple.",
      "Projected assets include current assets plus annual surplus invested until retirement.",
      "Coverage below 1.0x creates a retirement gap.",
      "A short retirement timeline increases caution if the gap is large.",
    ],
  };
}

function analyzeInvestAssets(input: FinancialInput): GoalAnalysis {
  const emergencyFundTarget = input.monthlyExpenses * 3;
  const emergencyFundGap = emergencyFundTarget - input.emergencyFund;
  const highInterestDebt = input.creditCardAPR >= 15 && input.creditCardDebt > 0;

  const availableInvestableAssets = investableAssets(input);
  const monthlySurplus = Math.max(
    input.income / 12 - input.monthlyExpenses - input.debtPayment,
    0
  );

  let suggestedCash = 15;
  let suggestedBonds = 25;
  let suggestedEquity = 60;

  if (input.riskTolerance === "risk_averse") {
    suggestedCash = 25;
    suggestedBonds = 45;
    suggestedEquity = 30;
  }
  
  if (input.riskTolerance === "risk_seeker") {
    suggestedCash = 10;
    suggestedBonds = 15;
    suggestedEquity = 75;
  }

  if (input.timeHorizon === "under_1_year" || input.timeHorizon === "1_5_years") {
    suggestedCash += 20;
    suggestedEquity -= 20;
  }

  if (highInterestDebt || emergencyFundGap > 0) {
    suggestedCash = Math.max(suggestedCash, 35);
    suggestedEquity = Math.min(suggestedEquity, 40);
  }

  suggestedCash = clamp(suggestedCash, 0, 100);
  suggestedBonds = clamp(suggestedBonds, 0, 100);
  suggestedEquity = clamp(100 - suggestedCash - suggestedBonds, 0, 100);

  let score = 75;

  if (emergencyFundGap > 0) score -= 25;
  if (highInterestDebt) score -= 30;
  if (monthlySurplus <= 0) score -= 15;
  if (availableInvestableAssets <= 0) score -= 10;

  score = clamp(score, 0, 100);
  const status = getStatusFromScore(score);

  return {
    goal: input.goal,
    title: "Investment Readiness Analysis",
    status,
    goalScore: score,
    scoreAdjustment: getScoreAdjustment(score),
    summary:
      status === "strong"
        ? "The investing goal looks reasonable because the user has investable assets, manageable debt pressure, and enough room to take risk."
        : status === "watch"
        ? "The investing goal is possible, but the user should review emergency fund strength, debt cost, and time horizon before taking more risk."
        : "The investing goal is risky right now because emergency fund weakness, high-interest debt, or weak surplus may matter more than investing.",
    recommendationImpact:
      status === "strong"
        ? "Investment analysis supports the overall recommendation."
        : status === "watch"
        ? "Investment analysis makes the recommendation more cautious."
        : "Investment analysis weakens the recommendation because debt or liquidity issues should likely come first.",
    metrics: [
      {
        label: "Investable Assets",
        value: formatCurrency(availableInvestableAssets),
        detail: "Savings + stocks + bonds",
      },
      {
        label: "Emergency Fund Gap",
        value: formatCurrency(Math.max(emergencyFundGap, 0)),
        detail: "Target is 3 months of expenses",
      },
      {
        label: "Monthly Surplus",
        value: formatCurrency(monthlySurplus),
        detail: "Income after expenses and debt payment",
      },
      {
        label: "High-Interest Debt Flag",
        value: highInterestDebt ? "YES" : "NO",
        detail: "Credit card APR at or above 15%",
      },
      {
        label: "Suggested Cash",
        value: `${suggestedCash.toFixed(0)}%`,
        detail: "Directional allocation, not investment advice",
      },
      {
        label: "Suggested Bonds",
        value: `${suggestedBonds.toFixed(0)}%`,
        detail: "Directional allocation, not investment advice",
      },
      {
        label: "Suggested Equity",
        value: `${suggestedEquity.toFixed(0)}%`,
        detail: "Directional allocation, not investment advice",
      },
    ],
    decisionRules: [
      "Emergency fund gaps reduce investment readiness.",
      "High-interest credit card debt should usually be addressed before aggressive investing.",
      "Longer time horizons support more risk capacity.",
      "Risk tolerance adjusts the directional cash/bond/equity mix.",
    ],
  };
}

function analyzeScholarship(input: FinancialInput): GoalAnalysis {
  const educationCost = input.educationCost || 0;
  const scholarshipValue = educationCost * (input.scholarshipPercent / 100);
  const netEducationCost = Math.max(educationCost - scholarshipValue, 0);

  const annualIncomeBenefit =
    input.income * (input.expectedIncomeIncrease / 100);

  const discountRate = input.discountRate / 100;
  const benefitYears = 10;

  let pvIncomeBenefit = 0;

  for (let year = 1; year <= benefitYears; year++) {
    pvIncomeBenefit +=
      annualIncomeBenefit / Math.pow(1 + discountRate, year);
  }

  const educationNPV = pvIncomeBenefit - netEducationCost;

  const paybackPeriod =
    annualIncomeBenefit > 0
      ? netEducationCost / annualIncomeBenefit
      : Number.POSITIVE_INFINITY;

  const roi =
    netEducationCost > 0 ? educationNPV / netEducationCost : 0;

  let score = 50;

  if (educationNPV > 0) score += 25;
  if (paybackPeriod <= 5) score += 20;
  else if (paybackPeriod <= 10) score += 10;
  else score -= 15;

  if (input.scholarshipPercent >= 50) score += 10;
  if (annualIncomeBenefit <= 0) score -= 25;
  if (educationCost <= 0) score -= 20;

  score = clamp(score, 0, 100);
  const status = getStatusFromScore(score);

  return {
    goal: input.goal,
    title: "Scholarship ROI Analysis",
    status,
    goalScore: score,
    scoreAdjustment: getScoreAdjustment(score),
    summary:
      status === "strong"
        ? "The scholarship or education decision looks financially attractive based on net cost, expected income benefit, payback period, and estimated NPV."
        : status === "watch"
        ? "The scholarship or education decision may be reasonable, but the income benefit or payback period should be reviewed carefully."
        : "The scholarship or education decision looks financially weak under the current assumptions because the modeled payback or NPV is not strong.",
    recommendationImpact:
      status === "strong"
        ? "Scholarship ROI analysis supports the overall recommendation."
        : status === "watch"
        ? "Scholarship ROI analysis adds caution because the payoff depends on income assumptions."
        : "Scholarship ROI analysis weakens the recommendation because the modeled return may not justify the net cost.",
    metrics: [
      {
        label: "Total Education Cost",
        value: formatCurrency(educationCost),
        detail: "User-entered estimated cost",
      },
      {
        label: "Scholarship Value",
        value: formatCurrency(scholarshipValue),
        detail: `${input.scholarshipPercent}% scholarship`,
      },
      {
        label: "Net Education Cost",
        value: formatCurrency(netEducationCost),
        detail: "Cost after scholarship",
      },
      {
        label: "Annual Income Benefit",
        value: formatCurrency(annualIncomeBenefit),
        detail: "Current income × expected income increase",
      },
      {
        label: "PV of Income Benefit",
        value: formatCurrency(pvIncomeBenefit),
        detail: "10-year present value of estimated income benefit",
      },
      {
        label: "Education NPV",
        value: formatCurrency(educationNPV),
        detail: "PV income benefit minus net education cost",
      },
      {
        label: "Payback Period",
        value: Number.isFinite(paybackPeriod)
          ? `${paybackPeriod.toFixed(1)} years`
          : "N/A",
        detail: "Net cost divided by annual income benefit",
      },
      {
        label: "ROI",
        value: formatPercent(roi * 100),
        detail: "Education NPV divided by net cost",
      },
    ],
    decisionRules: [
      "Positive education NPV supports the decision.",
      "Payback under 5 years is strong.",
      "Payback over 10 years is risky.",
      "A larger scholarship improves the goal score.",
      "Expected income increase is the key assumption.",
    ],
  };
}

export function generateGoalAnalysis(input: FinancialInput): GoalAnalysis {
  if (input.goal === "buy_house") {
    return analyzeBuyHouse(input);
  }

  if (input.goal === "rent_vs_buy") {
    return analyzeRentVsBuy(input);
  }

  if (input.goal === "retirement") {
    return analyzeRetirement(input);
  }

  if (input.goal === "invest_assets") {
    return analyzeInvestAssets(input);
  }

  if (input.goal === "scholarship") {
    return analyzeScholarship(input);
  }

  return analyzeInvestAssets(input);
}

export function applyGoalWeightToScore<
  T extends {
    totalScore: number;
    emergencyFundScore: number;
    debtHealthScore: number;
    assetStrengthScore: number;
    goalFitScore: number;
  }
>(score: T, goalAnalysis: GoalAnalysis): T {
  const goalFitScore = Math.round(clamp(goalAnalysis.goalScore / 4, 0, 25));

  return {
    ...score,
    goalFitScore,
    totalScore: Math.round(
      clamp(
        score.emergencyFundScore +
          score.debtHealthScore +
          score.assetStrengthScore +
          goalFitScore,
        0,
        100
      )
    ),
  };
}

export function applyGoalWeightToRecommendation(
  baseRecommendation: string,
  goalAnalysis: GoalAnalysis
): string {
  const statusLabel =
    goalAnalysis.status === "strong"
      ? "strong"
      : goalAnalysis.status === "watch"
      ? "mixed"
      : "risky";

  return `${baseRecommendation}

Goal-specific decision overlay: ${goalAnalysis.title} is ${statusLabel}. ${goalAnalysis.recommendationImpact} ${goalAnalysis.summary}`;
}