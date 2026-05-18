import { FinancialInput } from "@/types/financial";

function getEmergencyFundMonths(input: FinancialInput): number {
  if (input.monthlyExpenses <= 0) return 0;
  return input.emergencyFund / input.monthlyExpenses;
}

export function getRecommendation(
  input: FinancialInput,
  netPosition: number
): string {
  const emergencyFundMonths = getEmergencyFundMonths(input);

  if (input.creditCardDebt > 0 && input.creditCardAPR >= 15) {
    return "Your first priority should be paying down high-interest credit card debt before making major investments. A 15%+ APR is expensive and will usually beat most investment returns.";
  }

  if (emergencyFundMonths < 3) {
    return "Your first priority should be building an emergency fund with at least 3 months of expenses before taking on major financial risk.";
  }

  if (input.goal === "retirement") {
    if (netPosition <= 0) {
      return "You are not financially ready to retire yet. Focus on reducing debt, increasing savings, and building retirement investments.";
    }

    if (input.age < 50) {
      return "You are likely too young to focus only on retirement readiness. Keep investing, grow income, and avoid high-interest debt.";
    }

    if (input.riskTolerance === "risk_averse") {
      return "You may be on track for retirement, but your strategy should favor stable assets, emergency savings, and lower-risk investments.";
    }

    return "You may be in a decent position for retirement planning, but you should stress-test your income, expenses, and market assumptions.";
  }

  if (input.goal === "buy_house" || input.goal === "rent_vs_buy") {
    if (
      input.timeHorizon === "under_1_year" ||
      input.timeHorizon === "1_5_years"
    ) {
      return "Buying may be too aggressive for this time horizon. Renting is likely safer unless your net position is very strong.";
    }

    const conservativeAffordableHouse = netPosition * 0.2;
    const neutralAffordableHouse = netPosition * 0.25;
    const aggressiveAffordableHouse = netPosition * 0.33;

    if (
      input.riskTolerance === "risk_averse" &&
      input.targetHousePrice <= conservativeAffordableHouse
    ) {
      return "Buying could be reasonable, but only conservatively. Your target house price fits within a safer range based on your net position.";
    }

    if (
      input.riskTolerance === "risk_neutral" &&
      input.targetHousePrice <= neutralAffordableHouse
    ) {
      return "Buying looks reasonable based on your net position, target house price, and balanced risk profile.";
    }

    if (
      input.riskTolerance === "risk_seeker" &&
      input.targetHousePrice <= aggressiveAffordableHouse
    ) {
      return "Buying may be possible, but this is a more aggressive move. Make sure you are comfortable with less flexibility and higher fixed costs.";
    }

    return "Renting may be the better move for now. Your target house price looks high relative to your current financial position.";
  }

  if (input.goal === "scholarship") {
    if (input.scholarshipPercent >= 75) {
      return "Take the scholarship. Covering 75% or more of the cost is usually a strong financial decision.";
    }

    if (
      input.scholarshipPercent >= 50 &&
      input.expectedIncomeIncrease >= 20
    ) {
      return "The scholarship is likely worth taking because it covers a meaningful share of cost and your expected income increase is strong.";
    }

    if (
      input.scholarshipPercent >= 25 &&
      input.expectedIncomeIncrease >= 40
    ) {
      return "The scholarship may be worth it, but only if the expected income increase is realistic and your career timeline is long enough.";
    }

    return "This scholarship may not be financially worth it unless the program creates a major income boost or career advantage.";
  }

  if (input.goal === "invest_assets") {
    if (input.riskTolerance === "risk_averse") {
      return "Prioritize emergency savings, bonds, diversified ETFs, and avoiding high-interest debt.";
    }

    if (input.riskTolerance === "risk_neutral") {
      return "A balanced mix of ETFs, bonds, and cash reserves would likely fit your profile.";
    }

    return "You may be comfortable with higher equity exposure, but avoid overconcentration and keep an emergency fund first.";
  }

  return "Based on your inputs, focus first on improving your net position by increasing assets, reducing liabilities, and matching investments to your time horizon.";
}