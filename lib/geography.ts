import { FinancialInput } from "@/types/financial";

export function getCityExpenseMultiplier(
  cityType: FinancialInput["cityType"]
): number {
  if (cityType === "city") return 1.08;
  if (cityType === "suburban") return 1.0;
  return 0.92;
}

export function getCityExpenseGrowthAdjustment(
  cityType: FinancialInput["cityType"]
): number {
  if (cityType === "city") return 0.003;
  if (cityType === "suburban") return 0;
  return -0.002;
}

export function getCityTypeLabel(cityType: FinancialInput["cityType"]): string {
  if (cityType === "city") return "City";
  if (cityType === "suburban") return "Suburban";
  return "Rural";
}