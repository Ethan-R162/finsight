import { BuyRentAnalysis, FinancialInput } from "@/types/financial";
import { presentValueOfAnnuity } from "@/lib/calculations";

function percentToDecimal(value: number): number {
  return value / 100;
}

function calculateMonthlyMortgagePayment(
  loanAmount: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return loanAmount / months;
  }

  return (
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

function calculateRemainingLoanBalance(
  loanAmount: number,
  annualRate: number,
  yearsTotal: number,
  yearsPaid: number
): number {
  const monthlyRate = annualRate / 12;
  const totalMonths = yearsTotal * 12;
  const monthsPaid = yearsPaid * 12;

  const monthlyPayment = calculateMonthlyMortgagePayment(
    loanAmount,
    annualRate,
    yearsTotal
  );

  if (monthlyRate === 0) {
    return Math.max(loanAmount - monthlyPayment * monthsPaid, 0);
  }

  return (
    loanAmount * Math.pow(1 + monthlyRate, monthsPaid) -
    monthlyPayment *
      ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate)
  );
}

export function generateBuyRentAnalysis(input: FinancialInput): BuyRentAnalysis {
  const discountRate = percentToDecimal(input.discountRate);
  const monthlyDiscountRate = discountRate / 12;

  const holdingPeriodYears = Math.max(input.holdingPeriodYears, 1);
  const holdingPeriodMonths = holdingPeriodYears * 12;

  const homePrice = input.targetHousePrice;
  const downPayment = homePrice * percentToDecimal(input.downPaymentPercent);
  const loanAmount = Math.max(homePrice - downPayment, 0);

  const mortgageRate = percentToDecimal(input.mortgageRate);
  const homeAppreciationRate = percentToDecimal(input.homeAppreciationRate);
  const propertyTaxRate = percentToDecimal(input.propertyTaxRate);
  const maintenanceRate = percentToDecimal(input.maintenanceRate);
  const closingCostPercent = percentToDecimal(input.closingCostPercent);

  const rentPV = presentValueOfAnnuity(
    input.monthlyRent,
    monthlyDiscountRate,
    holdingPeriodMonths
  );

  const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
    loanAmount,
    mortgageRate,
    30
  );

  const monthlyPropertyTax = (homePrice * propertyTaxRate) / 12;
  const monthlyMaintenance = (homePrice * maintenanceRate) / 12;

  const monthlyOwnershipCost =
    monthlyMortgagePayment + monthlyPropertyTax + monthlyMaintenance;

  const ownershipCostPV = presentValueOfAnnuity(
    monthlyOwnershipCost,
    monthlyDiscountRate,
    holdingPeriodMonths
  );

  const closingCosts = homePrice * closingCostPercent;

  const futureHomeValue =
    homePrice * Math.pow(1 + homeAppreciationRate, holdingPeriodYears);

  const remainingLoanBalance = calculateRemainingLoanBalance(
    loanAmount,
    mortgageRate,
    30,
    holdingPeriodYears
  );

  const saleProceeds = Math.max(futureHomeValue - remainingLoanBalance, 0);

  const discountedSaleProceeds =
    saleProceeds / Math.pow(1 + discountRate, holdingPeriodYears);

  const buyPV = downPayment + closingCosts + ownershipCostPV - discountedSaleProceeds;

  const difference = rentPV - buyPV;

  const recommendation = difference > 0 ? "buy" : "rent";

  const summary =
    recommendation === "buy"
      ? "Buying has a lower present value cost than renting under these assumptions."
      : "Renting has a lower present value cost than buying under these assumptions.";

  return {
    rentPV,
    buyPV,
    difference,
    recommendation,
    summary,
  };
}