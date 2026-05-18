import { FinancialInput } from "@/types/financial";

export function generateActionPlan(input: FinancialInput, netPosition: number): string[] {
  const actions: string[] = [];

  const emergencyFundMonths =
    input.monthlyExpenses > 0 ? input.emergencyFund / input.monthlyExpenses : 0;

  if (input.creditCardDebt > 0 && input.creditCardAPR >= 15) {
    actions.push(
      "Pay down high-interest credit card debt before making major new investments."
    );
  }

  if (emergencyFundMonths < 3) {
    actions.push(
      "Build your emergency fund to at least 3 months of expenses."
    );
  }

  if (input.goal === "buy_house" || input.goal === "rent_vs_buy") {
    if (input.timeHorizon === "under_1_year" || input.timeHorizon === "1_5_years") {
      actions.push(
        "Delay buying a home unless your savings and income are very stable."
      );
    }

    const estimatedDownPayment = input.targetHousePrice * 0.2;

    if (input.savings + input.emergencyFund < estimatedDownPayment) {
      actions.push(
        "Increase savings toward a 20% down payment before buying."
      );
    }

    actions.push(
      "Compare the monthly cost of renting versus owning before making a housing decision."
    );
  }

  if (input.goal === "scholarship") {
    if (input.scholarshipPercent < 50) {
      actions.push(
        "Run a full cost-benefit analysis because the scholarship covers less than half of the cost."
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
        "Favor emergency savings, bonds, diversified ETFs, and lower-volatility assets."
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
  }

  if (actions.length === 0) {
    actions.push(
      "Maintain your current financial base and continue improving savings, income, and investment discipline."
    );
  }

  return actions.slice(0, 4);
}