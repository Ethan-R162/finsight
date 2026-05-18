export type RiskTolerance = "risk_averse" | "risk_neutral" | "risk_seeker";

export type TimeHorizon =
  | "under_1_year"
  | "1_5_years"
  | "5_10_years"
  | "10_20_years"
  | "20_plus_years";

export type Goal =
  | "buy_house"
  | "rent_vs_buy"
  | "scholarship"
  | "retirement"
  | "invest_assets";

export type CityType = "city" | "suburban" | "rural";

export type OccupationStatus =
  | "student"
  | "employed"
  | "self_employed"
  | "retired"
  | "unemployed";

export type Industry =
  | "finance"
  | "technology"
  | "healthcare"
  | "real_estate"
  | "education"
  | "retail"
  | "other";

export type FinancialInput = {
  age: number;
  retirementAge: number;

  income: number;
  savings: number;
  emergencyFund: number;
  monthlyExpenses: number;

  stockValue: number;
  bondValue: number;
  realEstateValue: number;

  debtPayment: number;
  debtInterestRate: number;
  debtYearsRemaining: number;

  creditCardDebt: number;
  creditCardAPR: number;

  dependents: number;
  cityType: CityType;
  occupationStatus: OccupationStatus;
  industry: Industry;

  targetHousePrice: number;
  scholarshipPercent: number;
  expectedIncomeIncrease: number;

  monthlyRent: number;
  downPaymentPercent: number;
  mortgageRate: number;
  holdingPeriodYears: number;
  homeAppreciationRate: number;
  propertyTaxRate: number;
  maintenanceRate: number;
  closingCostPercent: number;

  discountRate: number;
  baseIncomeGrowthRate: number;
  expenseGrowthRate: number;
  expectedInvestmentReturn: number;
  monteCarloRuns: number;

  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  goal: Goal;
};

export type ScoreBreakdown = {
  emergencyFundScore: number;
  debtHealthScore: number;
  assetStrengthScore: number;
  goalFitScore: number;
  totalScore: number;
};

export type ScenarioComparison = {
  currentNetPosition: number;
  improvedNetPosition: number;
  difference: number;
  winner: "current" | "improved";
  summary: string;
};

export type SensitivityCell = {
  discountRate: number;
  incomeGrowthRate: number;
  netPosition: number;
};

export type SensitivityAnalysis = {
  discountRates: number[];
  incomeGrowthRates: number[];
  table: SensitivityCell[];
  baseCase: number;
  downsideCase: number;
  upsideCase: number;
};

export type MonteCarloResult = {
  simulations: number;
  probabilityPositive: number;
  tenthPercentile: number;
  median: number;
  ninetiethPercentile: number;
  averageNetPosition: number;
  worstCase: number;
  bestCase: number;
};

export type BuyRentAnalysis = {
  rentPV: number;
  buyPV: number;
  difference: number;
  recommendation: "rent" | "buy";
  summary: string;
};

export type ModelAssumptions = {
  discountRate: number;
  baseIncomeGrowthRate: number;
  expenseGrowthRate: number;
  expectedInvestmentReturn: number;
  monteCarloRuns: number;
};
export type AuditSeverity = "strong" | "info" | "warning" | "risk";

export type AuditItem = {
  severity: AuditSeverity;
  title: string;
  message: string;
};

export type ModelAudit = {
  overallStatus: "healthy" | "watch" | "risky";
  items: AuditItem[];
};
export type FinancialResult = {
  goal: Goal;
  incomePV: number;
  assetValue: number;
  debtPV: number;
  expensePV: number;
  netPosition: number;
  recommendation: string;
  score: ScoreBreakdown;
  actionPlan: string[];
  scenarioComparison: ScenarioComparison;
  sensitivityAnalysis: SensitivityAnalysis;
  monteCarloResult: MonteCarloResult;
  buyRentAnalysis: BuyRentAnalysis;
  modelAssumptions: ModelAssumptions;
  modelAudit: ModelAudit;
};