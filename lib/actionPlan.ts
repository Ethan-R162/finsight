import { FinancialInput } from "@/types/financial";

function getLiquidSafetyMonths(input: FinancialInput): number {
  const liquidSafetyAssets = input.savings + input.emergencyFund;

  if (input.monthlyExpenses <= 0) {
    return 0;
  }

  return liquidSafetyAssets / input.monthlyExpenses;
}

function getLiquidSafetyAssets(input: FinancialInput): number {
  return input.savings + input.emergencyFund;
}

function isHousingGoal(input: FinancialInput): boolean {
  return input.goal === "buy_house" || input.goal === "rent_vs_buy";
}

export function generateActionPlan(
  input: FinancialInput,
  netPosition: number
): string[] {
  const actions: string[] = [];

  const liquidSafetyAssets = getLiquidSafetyAssets(input);
  const liquidSafetyMonths = getLiquidSafetyMonths(input);

  if (input.creditCardDebt > 0 && input.creditCardAPR >= 15) {
    actions.push(
      "Pay down high-interest credit card debt before making major new investments."
    );
  }

  if (liquidSafetyMonths < 3) {
    actions.push(
      "Build your liquid safety cushion so combined savings and emergency cash cover at least 3 months of expenses."
    );
  } else if (liquidSafetyMonths < 6) {
    actions.push(
      "Your liquid safety cushion covers at least 3 months of expenses. Consider building toward 6 months for stronger protection."
    );
  }

  if (isHousingGoal(input)) {
    const estimatedDownPayment = input.targetHousePrice * 0.2;
    const housePriceToIncome =
      input.income > 0 ? input.targetHousePrice / input.income : 0;

    if (housePriceToIncome > 8) {
      actions.push(
        "Reconsider the target home price because it is very high relative to annual income."
      );
    } else if (housePriceToIncome > 5) {
      actions.push(
        "Review housing affordability carefully because the target home price is high relative to annual income."
      );
    }

    if (
      input.timeHorizon === "under_1_year" ||
      input.timeHorizon === "1_5_years"
    ) {
      actions.push(
        "Delay buying a home unless your income, liquid savings, and debt profile are very stable."
      );
    }

    if (liquidSafetyAssets < estimatedDownPayment) {
      actions.push(
        "Increase liquid savings toward a 20% down payment before buying."
      );
    }

    actions.push(
      "Compare the present value cost of renting versus owning before making a housing decision."
    );
  }

  if (input.goal === "scholarship") {
    if (input.scholarshipPercent < 50) {
      actions.push(
        "Run a full cost-benefit analysis because the scholarship covers less than half of the education cost."
      );
    }

    if (input.expectedIncomeIncrease < 20) {
      actions.push(
        "Be cautious if the expected income increase after the program is not strong."
      );
    }

    actions.push(
      "Compare total program cost against expected post-program income growth."
    );
  }

  if (input.goal === "retirement") {
    actions.push(
      "Review retirement savings, expected retirement spending, and annual contribution rate."
    );

    if (netPosition <= 0) {
      actions.push(
        "Focus on improving net position before relying on retirement readiness."
      );
    }
  }

  if (input.goal === "invest_assets") {
    if (input.riskTolerance === "risk_averse") {
      actions.push(
        "Favor liquid savings, bonds, diversified ETFs, and lower-volatility assets."
      );
    }

    if (input.riskTolerance === "risk_neutral") {
      actions.push(
        "Consider a balanced allocation across cash, bonds, and diversified equity ETFs."
      );
    }

    if (input.riskTolerance === "risk_seeker") {
      actions.push(
        "Higher equity exposure may fit your risk profile, but avoid overconcentration."
      );
    }

    if (liquidSafetyMonths >= 3 && input.creditCardDebt === 0) {
      actions.push(
        "Maintain your liquid safety cushion while gradually increasing long-term investment exposure."
      );
    }
  }

  if (actions.length === 0) {
    actions.push(
      "Maintain your current financial base and continue improving savings, income, and investment discipline."
    );
  }

  return actions.slice(0, 4);
}