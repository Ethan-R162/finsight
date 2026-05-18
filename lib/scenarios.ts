import { FinancialInput, ScenarioComparison } from "@/types/financial";
import { calculateNetPosition } from "@/lib/calculations";

export function generateScenarioComparison(
  input: FinancialInput
): ScenarioComparison {
  const currentNetPosition = calculateNetPosition(input);

  const improvedInput: FinancialInput = {
    ...input,
    savings: input.savings * 1.2,
    emergencyFund: input.emergencyFund * 1.2,
    creditCardDebt: input.creditCardDebt * 0.8,
    monthlyExpenses: input.monthlyExpenses * 0.9,
  };

  const improvedNetPosition = calculateNetPosition(improvedInput);

  const difference = improvedNetPosition - currentNetPosition;

  const winner = improvedNetPosition >= currentNetPosition ? "improved" : "current";

  const summary =
    winner === "improved"
      ? "The improved scenario creates a stronger financial position by increasing savings, lowering expenses, and reducing credit card debt."
      : "The current scenario is stronger based on the current model assumptions, but this may indicate that the improvement assumptions need to be adjusted.";

  return {
    currentNetPosition,
    improvedNetPosition,
    difference,
    winner,
    summary,
  };
}