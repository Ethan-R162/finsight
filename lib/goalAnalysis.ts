import {
  FinancialInput,
  GoalAnalysis,
  GoalAnalysisStatus,
  GoalMetric,
  GoalScenario,
  GoalScoreDriver,
  ScoreBreakdown,
} from "@/types/financial";
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
  if (months <= 0) return 0;

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

function addDriver(
  drivers: GoalScoreDriver[],
  label: string,
  impact: number,
  explanation: string
) {
  drivers.push({
    label,
    impact,
    explanation,
  });
}

function getLiquidSafetyAssets(input: FinancialInput): number {
  return input.savings + input.emergencyFund;
}

function getLiquidSafetyMonths(input: FinancialInput): number {
  if (input.monthlyExpenses <= 0) return 0;
  return getLiquidSafetyAssets(input) / input.monthlyExpenses;
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

function cloneInputWithChanges(
  input: FinancialInput,
  changes: Partial<FinancialInput>
): FinancialInput {
  return {
    ...input,
    ...changes,
  };
}

function buildScenario(
  name: "Conservative" | "Base" | "Optimistic",
  goalScore: number,
  summary: string,
  metrics: GoalMetric[]
): GoalScenario {
  const cleanScore = Math.round(clamp(goalScore, 0, 100));

  return {
    name,
    status: getStatusFromScore(cleanScore),
    goalScore: cleanScore,
    summary,
    metrics,
  };
}

/* -------------------------------------------------------------------------- */
/*                               BUY HOUSE MODEL                              */
/* -------------------------------------------------------------------------- */

function calculateHomeAffordability(input: FinancialInput) {
  const monthlyIncome = input.income / 12;

  const requiredDownPayment =
    input.targetHousePrice * (input.downPaymentPercent / 100);

  const liquidSafetyAssets = getLiquidSafetyAssets(input);
  const protectedLiquidSafety = input.monthlyExpenses * 3;
  const availableForDownPayment = Math.max(
    liquidSafetyAssets - protectedLiquidSafety,
    0
  );

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

  const nonHousingDebtPayment = input.debtPayment + input.creditCardDebt * 0.03;

  const debtToIncomeRatio =
    monthlyIncome > 0
      ? (estimatedMonthlyHousingCost + nonHousingDebtPayment) / monthlyIncome
      : 1;

  const homePriceToIncome =
    input.income > 0 ? input.targetHousePrice / input.income : 999;

  const marginOfSafety = 0.3 - housingCostRatio;

  return {
    monthlyIncome,
    liquidSafetyAssets,
    protectedLiquidSafety,
    requiredDownPayment,
    availableForDownPayment,
    downPaymentGap,
    loanAmount,
    estimatedMortgagePayment,
    monthlyPropertyTax,
    monthlyMaintenance,
    estimatedMonthlyHousingCost,
    housingCostRatio,
    debtToIncomeRatio,
    homePriceToIncome,
    marginOfSafety,
  };
}

function scoreHomeAffordability(input: FinancialInput) {
  const data = calculateHomeAffordability(input);
  const drivers: GoalScoreDriver[] = [];

  let score = 100;

  if (data.downPaymentGap > 0) {
    score -= 25;
    addDriver(
      drivers,
      "Down payment gap",
      -25,
      "The user does not have enough liquid cash for the modeled down payment after protecting a 3-month liquid safety cushion."
    );
  } else {
    addDriver(
      drivers,
      "Down payment coverage",
      0,
      "The user appears to have enough liquid cash for the down payment while keeping a 3-month liquid safety cushion."
    );
  }

  if (data.housingCostRatio > 0.4) {
    score -= 30;
    addDriver(
      drivers,
      "Housing cost above 40% of income",
      -30,
      "Monthly ownership cost is highly stretched relative to monthly income."
    );
  } else if (data.housingCostRatio > 0.3) {
    score -= 15;
    addDriver(
      drivers,
      "Housing cost above 30% of income",
      -15,
      "Monthly ownership cost is above the common 30% affordability threshold."
    );
  }

  if (data.debtToIncomeRatio > 0.43) {
    score -= 30;
    addDriver(
      drivers,
      "Debt-to-income above 43%",
      -30,
      "Total debt burden is very high relative to monthly income."
    );
  } else if (data.debtToIncomeRatio > 0.36) {
    score -= 15;
    addDriver(
      drivers,
      "Debt-to-income above 36%",
      -15,
      "Total debt and housing payments exceed a common underwriting caution level."
    );
  }

  if (data.homePriceToIncome > 6) {
    score -= 20;
    addDriver(
      drivers,
      "Home price above 6x income",
      -20,
      "The target home price is extremely high relative to annual income."
    );
  } else if (data.homePriceToIncome > 4) {
    score -= 10;
    addDriver(
      drivers,
      "Home price above 4x income",
      -10,
      "The target home price is high relative to annual income."
    );
  }

  if (drivers.length === 1 && drivers[0].impact === 0) {
    addDriver(
      drivers,
      "Affordability ratios",
      0,
      "No major affordability penalties were triggered."
    );
  }

  return {
    score: Math.round(clamp(score, 0, 100)),
    drivers,
    data,
  };
}

function analyzeBuyHouse(input: FinancialInput): GoalAnalysis {
  const base = scoreHomeAffordability(input);
  const status = getStatusFromScore(base.score);

  const conservativeInput = cloneInputWithChanges(input, {
    mortgageRate: input.mortgageRate + 1,
    propertyTaxRate: input.propertyTaxRate + 0.25,
    maintenanceRate: input.maintenanceRate + 0.25,
  });

  const optimisticInput = cloneInputWithChanges(input, {
    mortgageRate: Math.max(input.mortgageRate - 0.5, 0),
    propertyTaxRate: Math.max(input.propertyTaxRate - 0.1, 0),
    maintenanceRate: Math.max(input.maintenanceRate - 0.1, 0),
  });

  const conservative = scoreHomeAffordability(conservativeInput);
  const optimistic = scoreHomeAffordability(optimisticInput);

  const scenarios = [
    buildScenario(
      "Conservative",
      conservative.score,
      "Mortgage rate, taxes, and maintenance are stressed higher.",
      [
        {
          label: "Monthly Housing Cost",
          value: formatCurrency(conservative.data.estimatedMonthlyHousingCost),
        },
        {
          label: "Housing Cost / Income",
          value: formatPercent(conservative.data.housingCostRatio * 100),
        },
        {
          label: "Debt-to-Income",
          value: formatPercent(conservative.data.debtToIncomeRatio * 100),
        },
      ]
    ),
    buildScenario("Base", base.score, "Current user assumptions.", [
      {
        label: "Monthly Housing Cost",
        value: formatCurrency(base.data.estimatedMonthlyHousingCost),
      },
      {
        label: "Housing Cost / Income",
        value: formatPercent(base.data.housingCostRatio * 100),
      },
      {
        label: "Debt-to-Income",
        value: formatPercent(base.data.debtToIncomeRatio * 100),
      },
    ]),
    buildScenario(
      "Optimistic",
      optimistic.score,
      "Mortgage rate, taxes, and maintenance are slightly improved.",
      [
        {
          label: "Monthly Housing Cost",
          value: formatCurrency(optimistic.data.estimatedMonthlyHousingCost),
        },
        {
          label: "Housing Cost / Income",
          value: formatPercent(optimistic.data.housingCostRatio * 100),
        },
        {
          label: "Debt-to-Income",
          value: formatPercent(optimistic.data.debtToIncomeRatio * 100),
        },
      ]
    ),
  ];

  return {
    goal: input.goal,
    title: "Home Purchase Affordability Analysis",
    status,
    goalScore: base.score,
    scoreAdjustment: getScoreAdjustment(base.score),
    marginOfSafety: formatPercent(base.data.marginOfSafety * 100),
    summary:
      status === "strong"
        ? "The home purchase goal looks financially reasonable based on down payment strength, housing cost coverage, and debt-to-income pressure."
        : status === "watch"
        ? "The home purchase goal may be possible, but some affordability ratios are stretched and should be reviewed carefully."
        : "The home purchase goal looks risky under the current assumptions. The model suggests improving down payment strength, lowering target price, or reducing debt before buying.",
    recommendationImpact:
      status === "strong"
        ? "The goal model supports the final recommendation."
        : status === "watch"
        ? "The goal model makes the final recommendation more cautious."
        : "The goal model materially weakens the final recommendation because the selected home target may not be affordable.",
    metrics: [
      {
        label: "Required Down Payment",
        value: formatCurrency(base.data.requiredDownPayment),
        detail: `${input.downPaymentPercent}% of target home price`,
      },
      {
        label: "Available for Down Payment",
        value: formatCurrency(base.data.availableForDownPayment),
        detail:
          "Combined savings and emergency fund after protecting 3 months of expenses",
      },
      {
        label: "Down Payment Gap",
        value: formatCurrency(Math.max(base.data.downPaymentGap, 0)),
        detail:
          base.data.downPaymentGap > 0 ? "Additional cash needed" : "No gap",
      },
      {
        label: "Monthly Housing Cost",
        value: formatCurrency(base.data.estimatedMonthlyHousingCost),
        detail: "Mortgage + property tax + maintenance",
      },
      {
        label: "Housing Cost / Income",
        value: formatPercent(base.data.housingCostRatio * 100),
        detail: "Below 30% is usually stronger",
      },
      {
        label: "Debt-to-Income Ratio",
        value: formatPercent(base.data.debtToIncomeRatio * 100),
        detail: "Below 36% is usually stronger",
      },
      {
        label: "Home Price / Income",
        value: `${base.data.homePriceToIncome.toFixed(1)}x`,
        detail: "Lower multiples are more affordable",
      },
      {
        label: "Margin of Safety",
        value: formatPercent(base.data.marginOfSafety * 100),
        detail: "Distance from the 30% housing-cost threshold",
      },
    ],
    decisionRules: [
      "Housing cost above 30% of monthly income creates caution.",
      "Housing cost above 40% creates a severe affordability warning.",
      "Debt-to-income above 36% creates caution.",
      "Debt-to-income above 43% creates a major affordability warning.",
      "A down payment gap lowers the goal score.",
      "A home price above 4x income creates affordability pressure.",
    ],
    scoreDrivers: base.drivers,
    scenarios,
  };
}

/* -------------------------------------------------------------------------- */
/*                              RENT VS BUY MODEL                             */
/* -------------------------------------------------------------------------- */

function scoreRentVsBuy(input: FinancialInput) {
  const buyRent = generateBuyRentAnalysis(input);
  const monthlyIncome = input.income / 12;
  const rentToIncome = monthlyIncome > 0 ? input.monthlyRent / monthlyIncome : 1;
  const absoluteDifference = Math.abs(buyRent.difference);

  const drivers: GoalScoreDriver[] = [];
  let score = 70;

  if (buyRent.recommendation === "buy") {
    score += 10;
    addDriver(
      drivers,
      "Buy has lower modeled PV cost",
      10,
      "The buy case is cheaper than renting under the current assumptions."
    );
  } else {
    score += 5;
    addDriver(
      drivers,
      "Rent has lower modeled PV cost",
      5,
      "The rent case is cheaper than buying under the current assumptions."
    );
  }

  if (rentToIncome > 0.4) {
    score -= 25;
    addDriver(
      drivers,
      "Rent above 40% of income",
      -25,
      "Current rent is highly stretched relative to income."
    );
  } else if (rentToIncome > 0.3) {
    score -= 10;
    addDriver(
      drivers,
      "Rent above 30% of income",
      -10,
      "Current rent is above the common 30% affordability threshold."
    );
  }

  if (absoluteDifference > input.income) {
    score += 10;
    addDriver(
      drivers,
      "Large NPV separation",
      10,
      "The modeled difference between renting and buying is large relative to annual income."
    );
  }

  return {
    score: Math.round(clamp(score, 0, 100)),
    drivers,
    buyRent,
    rentToIncome,
    absoluteDifference,
  };
}

function analyzeRentVsBuy(input: FinancialInput): GoalAnalysis {
  const base = scoreRentVsBuy(input);
  const status = getStatusFromScore(base.score);

  const conservativeInput = cloneInputWithChanges(input, {
    mortgageRate: input.mortgageRate + 1,
    homeAppreciationRate: input.homeAppreciationRate - 1,
    maintenanceRate: input.maintenanceRate + 0.25,
  });

  const optimisticInput = cloneInputWithChanges(input, {
    mortgageRate: Math.max(input.mortgageRate - 0.5, 0),
    homeAppreciationRate: input.homeAppreciationRate + 1,
    maintenanceRate: Math.max(input.maintenanceRate - 0.1, 0),
  });

  const conservative = scoreRentVsBuy(conservativeInput);
  const optimistic = scoreRentVsBuy(optimisticInput);

  const scenarios = [
    buildScenario(
      "Conservative",
      conservative.score,
      "Mortgage rate and ownership costs are stressed higher while appreciation is reduced.",
      [
        {
          label: "PV Cost of Renting",
          value: formatCurrency(conservative.buyRent.rentPV),
        },
        {
          label: "PV Cost of Buying",
          value: formatCurrency(conservative.buyRent.buyPV),
        },
        {
          label: "NPV Difference",
          value: formatCurrency(conservative.buyRent.difference),
        },
      ]
    ),
    buildScenario("Base", base.score, "Current user assumptions.", [
      {
        label: "PV Cost of Renting",
        value: formatCurrency(base.buyRent.rentPV),
      },
      {
        label: "PV Cost of Buying",
        value: formatCurrency(base.buyRent.buyPV),
      },
      {
        label: "NPV Difference",
        value: formatCurrency(base.buyRent.difference),
      },
    ]),
    buildScenario(
      "Optimistic",
      optimistic.score,
      "Mortgage rate improves and home appreciation is higher.",
      [
        {
          label: "PV Cost of Renting",
          value: formatCurrency(optimistic.buyRent.rentPV),
        },
        {
          label: "PV Cost of Buying",
          value: formatCurrency(optimistic.buyRent.buyPV),
        },
        {
          label: "NPV Difference",
          value: formatCurrency(optimistic.buyRent.difference),
        },
      ]
    ),
  ];

  const marginOfSafety =
    input.income > 0 ? base.absoluteDifference / input.income : 0;

  return {
    goal: input.goal,
    title: "Rent vs Buy NPV Analysis",
    status,
    goalScore: base.score,
    scoreAdjustment: getScoreAdjustment(base.score),
    marginOfSafety: `${marginOfSafety.toFixed(2)}x income`,
    summary: base.buyRent.summary,
    recommendationImpact:
      status === "strong"
        ? "The rent vs buy model gives a clear enough signal to support the final recommendation."
        : status === "watch"
        ? "The rent vs buy model gives a usable signal, but the decision is sensitive to assumptions."
        : "The rent vs buy model is risky or stretched, so the final recommendation should be cautious.",
    metrics: [
      {
        label: "PV Cost of Renting",
        value: formatCurrency(base.buyRent.rentPV),
        detail: "Present value cost over holding period",
      },
      {
        label: "PV Cost of Buying",
        value: formatCurrency(base.buyRent.buyPV),
        detail: "Present value cost over holding period",
      },
      {
        label: "NPV Difference",
        value: formatCurrency(base.buyRent.difference),
        detail: "Difference between renting and buying",
      },
      {
        label: "Model Signal",
        value: base.buyRent.recommendation.toUpperCase(),
        detail: "Lower PV cost is treated as better",
      },
      {
        label: "Rent / Income",
        value: formatPercent(base.rentToIncome * 100),
        detail: "Monthly rent divided by monthly income",
      },
      {
        label: "Margin of Safety",
        value: `${marginOfSafety.toFixed(2)}x income`,
        detail: "Absolute NPV difference divided by annual income",
      },
    ],
    decisionRules: [
      "The lower present value cost is treated as the better modeled choice.",
      "Rent above 30% of income creates affordability caution.",
      "Rent above 40% of income creates a severe affordability warning.",
      "A larger NPV difference creates a stronger decision signal.",
      "The result depends heavily on mortgage rate, rent, home appreciation, and holding period.",
    ],
    scoreDrivers: base.drivers,
    scenarios,
  };
}

/* -------------------------------------------------------------------------- */
/*                              RETIREMENT MODEL                              */
/* -------------------------------------------------------------------------- */

function scoreRetirement(input: FinancialInput) {
  const yearsUntilRetirement = Math.max(input.retirementAge - input.age, 0);

  const startingAssets = totalCurrentAssets(input);

  const annualSurplus =
    input.occupationStatus === "retired" || input.age >= input.retirementAge
      ? 0
      : Math.max(
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

  const drivers: GoalScoreDriver[] = [];
  let score = coverageRatio * 100;

  if (coverageRatio >= 1) {
    addDriver(
      drivers,
      "Retirement coverage above 1.0x",
      0,
      "Projected assets cover the estimated retirement need."
    );
  } else {
    addDriver(
      drivers,
      "Retirement coverage below 1.0x",
      Math.round((coverageRatio - 1) * 100),
      "Projected assets do not fully cover the estimated retirement need."
    );
  }

  if (yearsUntilRetirement < 10 && coverageRatio < 1) {
    score -= 15;
    addDriver(
      drivers,
      "Short retirement timeline",
      -15,
      "There are fewer than 10 years until retirement and the model shows a gap."
    );
  }

  if (annualSurplus <= 0 && yearsUntilRetirement > 0) {
    score -= 15;
    addDriver(
      drivers,
      "No modeled annual surplus",
      -15,
      "The model does not show excess annual cash flow available for retirement contributions."
    );
  }

  score = Math.round(clamp(score, 0, 100));

  return {
    score,
    drivers,
    yearsUntilRetirement,
    projectedAssetsAtRetirement,
    projectedAnnualExpensesAtRetirement,
    retirementNeed,
    retirementGap,
    coverageRatio,
    annualSurplus,
  };
}

function analyzeRetirement(input: FinancialInput): GoalAnalysis {
  const base = scoreRetirement(input);

  const conservativeInput = cloneInputWithChanges(input, {
    expectedInvestmentReturn: Math.max(input.expectedInvestmentReturn - 2, 0),
    expenseGrowthRate: input.expenseGrowthRate + 1,
  });

  const optimisticInput = cloneInputWithChanges(input, {
    expectedInvestmentReturn: input.expectedInvestmentReturn + 2,
    expenseGrowthRate: Math.max(input.expenseGrowthRate - 0.5, 0),
  });

  const conservative = scoreRetirement(conservativeInput);
  const optimistic = scoreRetirement(optimisticInput);

  const status = getStatusFromScore(base.score);

  const scenarios = [
    buildScenario(
      "Conservative",
      conservative.score,
      "Investment return is reduced and expense growth is increased.",
      [
        {
          label: "Projected Assets",
          value: formatCurrency(conservative.projectedAssetsAtRetirement),
        },
        {
          label: "Retirement Need",
          value: formatCurrency(conservative.retirementNeed),
        },
        {
          label: "Coverage Ratio",
          value: `${conservative.coverageRatio.toFixed(2)}x`,
        },
      ]
    ),
    buildScenario("Base", base.score, "Current user assumptions.", [
      {
        label: "Projected Assets",
        value: formatCurrency(base.projectedAssetsAtRetirement),
      },
      {
        label: "Retirement Need",
        value: formatCurrency(base.retirementNeed),
      },
      {
        label: "Coverage Ratio",
        value: `${base.coverageRatio.toFixed(2)}x`,
      },
    ]),
    buildScenario(
      "Optimistic",
      optimistic.score,
      "Investment return is increased and expense growth is reduced.",
      [
        {
          label: "Projected Assets",
          value: formatCurrency(optimistic.projectedAssetsAtRetirement),
        },
        {
          label: "Retirement Need",
          value: formatCurrency(optimistic.retirementNeed),
        },
        {
          label: "Coverage Ratio",
          value: `${optimistic.coverageRatio.toFixed(2)}x`,
        },
      ]
    ),
  ];

  return {
    goal: input.goal,
    title: "Retirement Readiness Analysis",
    status,
    goalScore: base.score,
    scoreAdjustment: getScoreAdjustment(base.score),
    marginOfSafety: `${base.coverageRatio.toFixed(2)}x coverage`,
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
        value: `${base.yearsUntilRetirement}`,
        detail: "Retirement age minus current age",
      },
      {
        label: "Projected Assets at Retirement",
        value: formatCurrency(base.projectedAssetsAtRetirement),
        detail: "Current assets plus projected annual surplus",
      },
      {
        label: "Projected Annual Expenses",
        value: formatCurrency(base.projectedAnnualExpensesAtRetirement),
        detail: "Current expenses grown by expense growth assumption",
      },
      {
        label: "Estimated Retirement Need",
        value: formatCurrency(base.retirementNeed),
        detail: "Projected annual expenses × 25",
      },
      {
        label: "Retirement Surplus / Gap",
        value: formatCurrency(base.retirementGap),
        detail:
          base.retirementGap >= 0 ? "Projected surplus" : "Projected shortfall",
      },
      {
        label: "Coverage Ratio",
        value: `${base.coverageRatio.toFixed(2)}x`,
        detail: "Projected assets divided by estimated retirement need",
      },
      {
        label: "Margin of Safety",
        value: `${base.coverageRatio.toFixed(2)}x coverage`,
        detail: "Coverage above 1.0x means projected assets exceed need",
      },
    ],
    decisionRules: [
      "Retirement need is estimated using a 25x annual expense multiple.",
      "Projected assets include current assets plus annual surplus invested until retirement.",
      "Coverage below 1.0x creates a retirement gap.",
      "A short retirement timeline increases caution if the gap is large.",
    ],
    scoreDrivers: base.drivers,
    scenarios,
  };
}

/* -------------------------------------------------------------------------- */
/*                              INVESTING MODEL                               */
/* -------------------------------------------------------------------------- */

function scoreInvestAssets(input: FinancialInput) {
  const liquidSafetyAssets = getLiquidSafetyAssets(input);
  const liquidSafetyTarget = input.monthlyExpenses * 3;
  const liquidSafetyGap = liquidSafetyTarget - liquidSafetyAssets;
  const liquidSafetyMonths = getLiquidSafetyMonths(input);

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

  if (
    input.timeHorizon === "under_1_year" ||
    input.timeHorizon === "1_5_years"
  ) {
    suggestedCash += 20;
    suggestedEquity -= 20;
  }

  if (highInterestDebt || liquidSafetyGap > 0) {
    suggestedCash = Math.max(suggestedCash, 35);
    suggestedEquity = Math.min(suggestedEquity, 40);
  }

  suggestedCash = clamp(suggestedCash, 0, 100);
  suggestedBonds = clamp(suggestedBonds, 0, 100);
  suggestedEquity = clamp(100 - suggestedCash - suggestedBonds, 0, 100);

  const drivers: GoalScoreDriver[] = [];
  let score = 75;

  if (liquidSafetyGap > 0) {
    score -= 25;
    addDriver(
      drivers,
      "Liquid safety gap",
      -25,
      "Combined savings and emergency fund are below the 3-month expense target."
    );
  } else {
    addDriver(
      drivers,
      "Liquid safety covered",
      0,
      "Combined savings and emergency fund meet or exceed the 3-month expense target."
    );
  }

  if (highInterestDebt) {
    score -= 30;
    addDriver(
      drivers,
      "High-interest credit card debt",
      -30,
      "Credit card APR is at or above 15%, which weakens investment readiness."
    );
  }

  if (monthlySurplus <= 0) {
    score -= 15;
    addDriver(
      drivers,
      "No monthly surplus",
      -15,
      "The model does not show monthly cash flow available for new investments."
    );
  }

  if (availableInvestableAssets <= 0) {
    score -= 10;
    addDriver(
      drivers,
      "No investable assets",
      -10,
      "Savings, stocks, and bonds are currently near zero."
    );
  }

  score = Math.round(clamp(score, 0, 100));

  return {
    score,
    drivers,
    liquidSafetyTarget,
    liquidSafetyGap,
    liquidSafetyMonths,
    highInterestDebt,
    availableInvestableAssets,
    monthlySurplus,
    suggestedCash,
    suggestedBonds,
    suggestedEquity,
  };
}

function analyzeInvestAssets(input: FinancialInput): GoalAnalysis {
  const base = scoreInvestAssets(input);

  const conservativeInput = cloneInputWithChanges(input, {
    creditCardAPR: input.creditCardAPR + 3,
    monthlyExpenses: input.monthlyExpenses * 1.1,
  });

  const optimisticInput = cloneInputWithChanges(input, {
    creditCardDebt: Math.max(input.creditCardDebt * 0.75, 0),
    monthlyExpenses: input.monthlyExpenses * 0.95,
  });

  const conservative = scoreInvestAssets(conservativeInput);
  const optimistic = scoreInvestAssets(optimisticInput);

  const status = getStatusFromScore(base.score);

  const scenarios = [
    buildScenario(
      "Conservative",
      conservative.score,
      "Expenses are stressed higher and credit card APR increases.",
      [
        {
          label: "Liquid Safety Gap",
          value: formatCurrency(Math.max(conservative.liquidSafetyGap, 0)),
        },
        {
          label: "Monthly Surplus",
          value: formatCurrency(conservative.monthlySurplus),
        },
        {
          label: "High-Interest Debt",
          value: conservative.highInterestDebt ? "YES" : "NO",
        },
      ]
    ),
    buildScenario("Base", base.score, "Current user assumptions.", [
      {
        label: "Liquid Safety Gap",
        value: formatCurrency(Math.max(base.liquidSafetyGap, 0)),
      },
      {
        label: "Monthly Surplus",
        value: formatCurrency(base.monthlySurplus),
      },
      {
        label: "High-Interest Debt",
        value: base.highInterestDebt ? "YES" : "NO",
      },
    ]),
    buildScenario(
      "Optimistic",
      optimistic.score,
      "Expenses decline slightly and credit card debt is reduced.",
      [
        {
          label: "Liquid Safety Gap",
          value: formatCurrency(Math.max(optimistic.liquidSafetyGap, 0)),
        },
        {
          label: "Monthly Surplus",
          value: formatCurrency(optimistic.monthlySurplus),
        },
        {
          label: "High-Interest Debt",
          value: optimistic.highInterestDebt ? "YES" : "NO",
        },
      ]
    ),
  ];

  return {
    goal: input.goal,
    title: "Investment Readiness Analysis",
    status,
    goalScore: base.score,
    scoreAdjustment: getScoreAdjustment(base.score),
    marginOfSafety: `${base.liquidSafetyMonths.toFixed(1)} months of expenses`,
    summary:
      status === "strong"
        ? "The investing goal looks reasonable because the user has investable assets, manageable debt pressure, and enough liquidity to take risk."
        : status === "watch"
        ? "The investing goal is possible, but the user should review liquid safety strength, debt cost, and time horizon before taking more risk."
        : "The investing goal is risky right now because weak liquid safety, high-interest debt, or weak surplus may matter more than investing.",
    recommendationImpact:
      status === "strong"
        ? "Investment analysis supports the overall recommendation."
        : status === "watch"
        ? "Investment analysis makes the recommendation more cautious."
        : "Investment analysis weakens the recommendation because debt or liquidity issues should likely come first.",
    metrics: [
      {
        label: "Investable Assets",
        value: formatCurrency(base.availableInvestableAssets),
        detail: "Savings + stocks + bonds",
      },
      {
        label: "Liquid Safety Gap",
        value: formatCurrency(Math.max(base.liquidSafetyGap, 0)),
        detail: "Target is 3 months of expenses using savings + emergency fund",
      },
      {
        label: "Monthly Surplus",
        value: formatCurrency(base.monthlySurplus),
        detail: "Income after expenses and debt payment",
      },
      {
        label: "High-Interest Debt Flag",
        value: base.highInterestDebt ? "YES" : "NO",
        detail: "Credit card APR at or above 15%",
      },
      {
        label: "Suggested Cash",
        value: `${base.suggestedCash.toFixed(0)}%`,
        detail: "Directional allocation, not investment advice",
      },
      {
        label: "Suggested Bonds",
        value: `${base.suggestedBonds.toFixed(0)}%`,
        detail: "Directional allocation, not investment advice",
      },
      {
        label: "Suggested Equity",
        value: `${base.suggestedEquity.toFixed(0)}%`,
        detail: "Directional allocation, not investment advice",
      },
      {
        label: "Margin of Safety",
        value: `${base.liquidSafetyMonths.toFixed(1)} months`,
        detail:
          "Combined savings and emergency fund coverage in months of expenses",
      },
    ],
    decisionRules: [
      "Liquid safety gaps reduce investment readiness.",
      "High-interest credit card debt should usually be addressed before aggressive investing.",
      "Longer time horizons support more risk capacity.",
      "Risk tolerance adjusts the directional cash/bond/equity mix.",
    ],
    scoreDrivers: base.drivers,
    scenarios,
  };
}

/* -------------------------------------------------------------------------- */
/*                              SCHOLARSHIP MODEL                             */
/* -------------------------------------------------------------------------- */

function scoreScholarship(input: FinancialInput) {
  const educationCost = input.educationCost || 0;
  const scholarshipValue = educationCost * (input.scholarshipPercent / 100);
  const netEducationCost = Math.max(educationCost - scholarshipValue, 0);

  const annualIncomeBenefit =
    input.income * (input.expectedIncomeIncrease / 100);

  const discountRate = input.discountRate / 100;
  const benefitYears = 10;

  let pvIncomeBenefit = 0;

  for (let year = 1; year <= benefitYears; year++) {
    pvIncomeBenefit += annualIncomeBenefit / Math.pow(1 + discountRate, year);
  }

  const educationNPV = pvIncomeBenefit - netEducationCost;

  const paybackPeriod =
    annualIncomeBenefit > 0
      ? netEducationCost / annualIncomeBenefit
      : Number.POSITIVE_INFINITY;

  const roi = netEducationCost > 0 ? educationNPV / netEducationCost : 0;

  const drivers: GoalScoreDriver[] = [];
  let score = 50;

  if (educationNPV > 0) {
    score += 25;
    addDriver(
      drivers,
      "Positive education NPV",
      25,
      "The present value of expected income benefit exceeds the net education cost."
    );
  } else {
    score -= 15;
    addDriver(
      drivers,
      "Negative education NPV",
      -15,
      "The present value of expected income benefit does not cover the net education cost."
    );
  }

  if (paybackPeriod <= 5) {
    score += 20;
    addDriver(
      drivers,
      "Payback under 5 years",
      20,
      "The education cost is recovered quickly through modeled income benefit."
    );
  } else if (paybackPeriod <= 10) {
    score += 10;
    addDriver(
      drivers,
      "Payback between 5 and 10 years",
      10,
      "The education cost is recovered within a moderate time period."
    );
  } else {
    score -= 15;
    addDriver(
      drivers,
      "Payback over 10 years",
      -15,
      "The education cost takes a long time to recover through modeled income benefit."
    );
  }

  if (input.scholarshipPercent >= 50) {
    score += 10;
    addDriver(
      drivers,
      "Large scholarship",
      10,
      "The scholarship covers at least half of the estimated education cost."
    );
  }

  if (annualIncomeBenefit <= 0) {
    score -= 25;
    addDriver(
      drivers,
      "No income benefit",
      -25,
      "Expected income increase is zero or negative, weakening the education ROI case."
    );
  }

  if (educationCost <= 0) {
    score -= 20;
    addDriver(
      drivers,
      "Missing education cost",
      -20,
      "The model needs an estimated total education cost to evaluate ROI."
    );
  }

  score = Math.round(clamp(score, 0, 100));

  return {
    score,
    drivers,
    educationCost,
    scholarshipValue,
    netEducationCost,
    annualIncomeBenefit,
    pvIncomeBenefit,
    educationNPV,
    paybackPeriod,
    roi,
  };
}

function analyzeScholarship(input: FinancialInput): GoalAnalysis {
  const base = scoreScholarship(input);

  const conservativeInput = cloneInputWithChanges(input, {
    expectedIncomeIncrease: input.expectedIncomeIncrease * 0.5,
    educationCost: input.educationCost * 1.1,
  });

  const optimisticInput = cloneInputWithChanges(input, {
    expectedIncomeIncrease: input.expectedIncomeIncrease * 1.25,
    educationCost: input.educationCost * 0.95,
  });

  const conservative = scoreScholarship(conservativeInput);
  const optimistic = scoreScholarship(optimisticInput);

  const status = getStatusFromScore(base.score);

  const marginOfSafety =
    base.netEducationCost > 0
      ? base.pvIncomeBenefit / base.netEducationCost
      : 0;

  const scenarios = [
    buildScenario(
      "Conservative",
      conservative.score,
      "Income benefit is reduced by 50% and education cost is increased by 10%.",
      [
        {
          label: "Education NPV",
          value: formatCurrency(conservative.educationNPV),
        },
        {
          label: "Payback Period",
          value: Number.isFinite(conservative.paybackPeriod)
            ? `${conservative.paybackPeriod.toFixed(1)} years`
            : "N/A",
        },
        {
          label: "ROI",
          value: formatPercent(conservative.roi * 100),
        },
      ]
    ),
    buildScenario("Base", base.score, "Current user assumptions.", [
      {
        label: "Education NPV",
        value: formatCurrency(base.educationNPV),
      },
      {
        label: "Payback Period",
        value: Number.isFinite(base.paybackPeriod)
          ? `${base.paybackPeriod.toFixed(1)} years`
          : "N/A",
      },
      {
        label: "ROI",
        value: formatPercent(base.roi * 100),
      },
    ]),
    buildScenario(
      "Optimistic",
      optimistic.score,
      "Income benefit increases by 25% and education cost is reduced by 5%.",
      [
        {
          label: "Education NPV",
          value: formatCurrency(optimistic.educationNPV),
        },
        {
          label: "Payback Period",
          value: Number.isFinite(optimistic.paybackPeriod)
            ? `${optimistic.paybackPeriod.toFixed(1)} years`
            : "N/A",
        },
        {
          label: "ROI",
          value: formatPercent(optimistic.roi * 100),
        },
      ]
    ),
  ];

  return {
    goal: input.goal,
    title: "Scholarship ROI Analysis",
    status,
    goalScore: base.score,
    scoreAdjustment: getScoreAdjustment(base.score),
    marginOfSafety: `${marginOfSafety.toFixed(2)}x benefit/cost`,
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
        value: formatCurrency(base.educationCost),
        detail: "User-entered estimated cost",
      },
      {
        label: "Scholarship Value",
        value: formatCurrency(base.scholarshipValue),
        detail: `${input.scholarshipPercent}% scholarship`,
      },
      {
        label: "Net Education Cost",
        value: formatCurrency(base.netEducationCost),
        detail: "Cost after scholarship",
      },
      {
        label: "Annual Income Benefit",
        value: formatCurrency(base.annualIncomeBenefit),
        detail: "Current income × expected income increase",
      },
      {
        label: "PV of Income Benefit",
        value: formatCurrency(base.pvIncomeBenefit),
        detail: "10-year present value of estimated income benefit",
      },
      {
        label: "Education NPV",
        value: formatCurrency(base.educationNPV),
        detail: "PV income benefit minus net education cost",
      },
      {
        label: "Payback Period",
        value: Number.isFinite(base.paybackPeriod)
          ? `${base.paybackPeriod.toFixed(1)} years`
          : "N/A",
        detail: "Net cost divided by annual income benefit",
      },
      {
        label: "ROI",
        value: formatPercent(base.roi * 100),
        detail: "Education NPV divided by net cost",
      },
      {
        label: "Margin of Safety",
        value: `${marginOfSafety.toFixed(2)}x`,
        detail: "PV income benefit divided by net education cost",
      },
    ],
    decisionRules: [
      "Positive education NPV supports the decision.",
      "Payback under 5 years is strong.",
      "Payback over 10 years is risky.",
      "A larger scholarship improves the goal score.",
      "Expected income increase is the key assumption.",
    ],
    scoreDrivers: base.drivers,
    scenarios,
  };
}

/* -------------------------------------------------------------------------- */
/*                              PUBLIC FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

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

export function applyGoalWeightToScore(
  score: ScoreBreakdown,
  goalAnalysis: GoalAnalysis
): ScoreBreakdown {
  const goalFitScore = Math.round(clamp(goalAnalysis.goalScore / 4, 0, 25));

  const weightedTotal = Math.round(
    clamp(
      score.emergencyFundScore +
        score.debtHealthScore +
        score.assetStrengthScore +
        goalFitScore,
      0,
      100
    )
  );

  return {
    ...score,
    goalFitScore,
    totalScore: Math.min(score.totalScore, weightedTotal),
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

  const finalDecision =
    goalAnalysis.goalScore >= 80
      ? "The selected goal appears financially strong under the current assumptions."
      : goalAnalysis.goalScore >= 65
      ? "The selected goal appears reasonable, but the user should proceed carefully."
      : goalAnalysis.goalScore >= 50
      ? "The selected goal is possible, but the user should improve the weak areas before committing."
      : "The selected goal is not recommended yet under the current assumptions.";

  return `${baseRecommendation}

Goal-specific decision overlay: ${goalAnalysis.title} is ${statusLabel}. ${finalDecision} ${goalAnalysis.recommendationImpact}`;
}