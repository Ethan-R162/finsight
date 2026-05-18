import { AuditItem, FinancialInput, ModelAudit } from "@/types/financial";

function getMonthlyIncome(input: FinancialInput) {
  return input.income > 0 ? input.income / 12 : 0;
}

function getEmergencyFundMonths(input: FinancialInput) {
  if (input.monthlyExpenses <= 0) return 0;
  return input.emergencyFund / input.monthlyExpenses;
}

function isHousingGoal(input: FinancialInput) {
  return input.goal === "buy_house" || input.goal === "rent_vs_buy";
}

export function generateModelAudit(
  input: FinancialInput,
  netPosition: number,
  assetValue: number,
  debtPV: number
): ModelAudit {
  const items: AuditItem[] = [];

  const monthlyIncome = getMonthlyIncome(input);
  const emergencyFundMonths = getEmergencyFundMonths(input);
  const expenseRatio =
    monthlyIncome > 0 ? input.monthlyExpenses / monthlyIncome : 0;
  const debtPaymentRatio =
    monthlyIncome > 0 ? input.debtPayment / monthlyIncome : 0;

  if (emergencyFundMonths >= 6) {
    items.push({
      severity: "strong",
      title: "Strong emergency fund",
      message:
        "Your emergency fund covers at least six months of expenses, which gives the model more stability.",
    });
  } else if (emergencyFundMonths >= 3) {
    items.push({
      severity: "info",
      title: "Acceptable emergency fund",
      message:
        "Your emergency fund covers at least three months of expenses, but building toward six months would improve resilience.",
    });
  } else if (emergencyFundMonths >= 1) {
    items.push({
      severity: "warning",
      title: "Emergency fund is thin",
      message:
        "Your emergency fund covers less than three months of expenses, so the model may be more exposed to short-term shocks.",
    });
  } else {
    items.push({
      severity: "risk",
      title: "Very low emergency fund",
      message:
        "Your emergency fund covers less than one month of expenses. This is a major risk flag before taking on large financial goals.",
    });
  }

  if (expenseRatio > 1) {
    items.push({
      severity: "risk",
      title: "Expenses exceed income",
      message:
        "Monthly expenses are higher than monthly income, which can make the recommendation unreliable unless this is temporary.",
    });
  } else if (expenseRatio > 0.7) {
    items.push({
      severity: "warning",
      title: "High expense ratio",
      message:
        "Monthly expenses are more than 70% of monthly income, leaving limited room for savings, investing, or debt reduction.",
    });
  } else {
    items.push({
      severity: "strong",
      title: "Expense ratio looks manageable",
      message:
        "Monthly expenses appear reasonable compared with income, which supports a healthier financial position.",
    });
  }

  if (input.creditCardDebt > 0 && input.creditCardAPR >= 15) {
    items.push({
      severity: "risk",
      title: "High-interest credit card debt",
      message:
        "Credit card APR is above 15%, so paying this down may be more urgent than investing or taking on new obligations.",
    });
  }

  if (debtPaymentRatio > 0.5) {
    items.push({
      severity: "risk",
      title: "Debt payments are very high",
      message:
        "Monthly debt payments are more than 50% of monthly income, which is a major affordability concern.",
    });
  } else if (debtPaymentRatio > 0.36) {
    items.push({
      severity: "warning",
      title: "Debt payments are elevated",
      message:
        "Monthly debt payments are above 36% of monthly income, which may limit flexibility.",
    });
  }

  if (debtPV > assetValue) {
    items.push({
      severity: "warning",
      title: "Debt value exceeds assets",
      message:
        "The present value of debt is greater than current assets, which weakens the overall net position.",
    });
  }

  if (isHousingGoal(input) && input.income > 0) {
    const housePriceToIncome = input.targetHousePrice / input.income;

    if (housePriceToIncome > 8) {
      items.push({
        severity: "risk",
        title: "House price looks aggressive",
        message:
          "The target house price is more than 8x annual income, which may be difficult to support without major assets or outside help.",
      });
    } else if (housePriceToIncome > 5) {
      items.push({
        severity: "warning",
        title: "House price is high relative to income",
        message:
          "The target house price is more than 5x annual income, so affordability should be reviewed carefully.",
      });
    }
  }

  if (input.discountRate < 2) {
    items.push({
      severity: "warning",
      title: "Discount rate may be too low",
      message:
        "A very low discount rate can make future cash flows look too valuable in today's dollars.",
    });
  } else if (input.discountRate > 12) {
    items.push({
      severity: "warning",
      title: "Discount rate may be too high",
      message:
        "A very high discount rate can heavily reduce the value of future cash flows and make the model overly conservative.",
    });
  }

  if (input.monteCarloRuns < 1000) {
    items.push({
      severity: "info",
      title: "Monte Carlo trial count is limited",
      message:
        "The model will still run, but using at least 1,000 trials gives a more stable simulation result.",
    });
  } else {
    items.push({
      severity: "strong",
      title: "Monte Carlo trial count looks good",
      message:
        "The simulation uses at least 1,000 trials, which gives a stronger range of possible outcomes.",
    });
  }

  if (netPosition < 0) {
    items.push({
      severity: "risk",
      title: "Negative net position",
      message:
        "The model shows a negative net position after considering income, assets, debt, and expenses.",
    });
  } else {
    items.push({
      severity: "strong",
      title: "Positive net position",
      message:
        "The model shows a positive net position after considering income, assets, debt, and expenses.",
    });
  }

  const hasRisk = items.some((item) => item.severity === "risk");
  const hasWarning = items.some((item) => item.severity === "warning");

  return {
    overallStatus: hasRisk ? "risky" : hasWarning ? "watch" : "healthy",
    items,
  };
}