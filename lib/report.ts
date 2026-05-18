import jsPDF from "jspdf";
import { FinancialResult } from "@/types/financial";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function shouldShowHousingData(result: FinancialResult): boolean {
  return result.goal === "buy_house" || result.goal === "rent_vs_buy";
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 6
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function checkPageBreak(doc: jsPDF, y: number, neededSpace = 30): number {
  if (y + neededSpace > 275) {
    doc.addPage();
    addPageBackground(doc);
    addFooter(doc);
    return 24;
  }

  return y;
}

function addPageBackground(doc: jsPDF) {
  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, 210, 297, "F");
}

function addFooter(doc: jsPDF) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "FInsight is for educational purposes only and does not provide financial, investment, tax, or legal advice.",
    14,
    287
  );
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(34, 211, 238);
  doc.text(title.toUpperCase(), 14, y);

  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.3);
  doc.line(14, y + 3, 196, y + 3);

  return y + 12;
}

function addMetricCard(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width = 86
) {
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(x, y, width, 24, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(label.toUpperCase(), x + 4, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(value, x + 4, y + 18);
}

function addKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number
): number {
  y = checkPageBreak(doc, y, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(value, x + 72, y);

  return y + 7;
}

function addBulletList(
  doc: jsPDF,
  items: string[],
  x: number,
  y: number,
  maxWidth: number
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);

  for (const item of items) {
    y = checkPageBreak(doc, y, 16);

    doc.setTextColor(34, 211, 238);
    doc.text("•", x, y);

    doc.setTextColor(226, 232, 240);
    const lines = doc.splitTextToSize(item, maxWidth);
    doc.text(lines, x + 5, y);
    y += lines.length * 5 + 3;
  }

  return y;
}

export function downloadPDFReport(result: FinancialResult) {
  const showHousingData = shouldShowHousingData(result);
  const doc = new jsPDF("p", "mm", "a4");

  addPageBackground(doc);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("FInsight", 14, 24);

  doc.setFontSize(10);
  doc.setTextColor(34, 211, 238);
  doc.text("FINANCIAL MODELING REPORT", 14, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 24);

  // Hero score
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(14, 42, 182, 42, 5, 5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Financial Readiness Score", 22, 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(`${result.score.totalScore}`, 22, 72);

  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text("/ 100", 52, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  
  const scoreDescription =
    "A directional readiness score based on emergency fund, debt health, asset strength, and goal fit.";
  
  const scoreDescriptionLines = doc.splitTextToSize(scoreDescription, 100);
  doc.text(scoreDescriptionLines, 80, 58);
  
  doc.setFillColor(30, 41, 59);
  doc.rect(80, 70, 100, 4, "F");
  
  doc.setFillColor(34, 211, 238);
  doc.rect(80, 70, Math.max(4, result.score.totalScore), 4, "F");


  addFooter(doc);

  let y = 98;

  // Financial snapshot
  y = addSectionTitle(doc, "Financial Snapshot", y);

  addMetricCard(doc, "Income PV", formatCurrency(result.incomePV), 14, y);
  addMetricCard(doc, "Assets", formatCurrency(result.assetValue), 110, y);

  y += 32;

  addMetricCard(doc, "Debt PV", formatCurrency(result.debtPV), 14, y);
  addMetricCard(doc, "Expense PV", formatCurrency(result.expensePV), 110, y);

  y += 34;

  y = checkPageBreak(doc, y, 28);
  doc.setFillColor(6, 78, 59);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, y, 182, 28, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(209, 250, 229);
  doc.text("Net Position", 22, y + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(formatCurrency(result.netPosition), 22, y + 22);

  y += 42;

  // Score breakdown
  y = addSectionTitle(doc, "Score Breakdown", y);

  y = addKeyValue(
    doc,
    "Emergency Fund Score",
    `${result.score.emergencyFundScore} / 25`,
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Debt Health Score",
    `${result.score.debtHealthScore} / 25`,
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Asset Strength Score",
    `${result.score.assetStrengthScore} / 25`,
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Goal Fit Score",
    `${result.score.goalFitScore} / 25`,
    14,
    y
  );

  y += 8;

  // Recommendation
  y = addSectionTitle(doc, "Recommendation", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  y = addWrappedText(doc, result.recommendation, 14, y, 182, 6);
  y += 6;

  // Action plan
  y = addSectionTitle(doc, "Priority Action Plan", y);

  y = addBulletList(doc, result.actionPlan, 14, y, 175);
  y += 4;

  // Scenario comparison
  y = addSectionTitle(doc, "Scenario Comparison", y);

  y = addKeyValue(
    doc,
    "Current Plan Net Position",
    formatCurrency(result.scenarioComparison.currentNetPosition),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Improved Plan Net Position",
    formatCurrency(result.scenarioComparison.improvedNetPosition),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Difference",
    formatCurrency(result.scenarioComparison.difference),
    14,
    y
  );

  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  y = addWrappedText(doc, result.scenarioComparison.summary, 14, y, 182, 5);
  y += 6;

  // Buy vs Rent only for housing goals
  if (showHousingData) {
    y = addSectionTitle(doc, "Buy vs Rent NPV Model", y);

    y = addKeyValue(
      doc,
      "PV Cost of Renting",
      formatCurrency(result.buyRentAnalysis.rentPV),
      14,
      y
    );
    y = addKeyValue(
      doc,
      "PV Cost of Buying",
      formatCurrency(result.buyRentAnalysis.buyPV),
      14,
      y
    );
    y = addKeyValue(
      doc,
      "NPV Difference",
      formatCurrency(result.buyRentAnalysis.difference),
      14,
      y
    );
    y = addKeyValue(
      doc,
      "Model Recommendation",
      result.buyRentAnalysis.recommendation.toUpperCase(),
      14,
      y
    );

    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    y = addWrappedText(doc, result.buyRentAnalysis.summary, 14, y, 182, 5);
    y += 6;
  }

  // Sensitivity
  y = addSectionTitle(doc, "Sensitivity Analysis", y);

  y = addKeyValue(
    doc,
    "Downside Case",
    formatCurrency(result.sensitivityAnalysis.downsideCase),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Base Case",
    formatCurrency(result.sensitivityAnalysis.baseCase),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Upside Case",
    formatCurrency(result.sensitivityAnalysis.upsideCase),
    14,
    y
  );

  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  y = addWrappedText(
    doc,
    "Sensitivity analysis tests net position around the user's selected income growth and discount rate assumptions.",
    14,
    y,
    182,
    5
  );
  y += 6;

  // Monte Carlo
  y = addSectionTitle(doc, "Monte Carlo Simulation", y);

  y = addKeyValue(
    doc,
    "Simulations Run",
    `${result.monteCarloResult.simulations}`,
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Probability Positive",
    formatPercent(result.monteCarloResult.probabilityPositive),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "10th Percentile",
    formatCurrency(result.monteCarloResult.tenthPercentile),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Median",
    formatCurrency(result.monteCarloResult.median),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "90th Percentile",
    formatCurrency(result.monteCarloResult.ninetiethPercentile),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Average Outcome",
    formatCurrency(result.monteCarloResult.averageNetPosition),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Worst Case",
    formatCurrency(result.monteCarloResult.worstCase),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Best Case",
    formatCurrency(result.monteCarloResult.bestCase),
    14,
    y
  );

  y += 6;

  // Methodology
  y = addSectionTitle(doc, "Model Methodology and Assumptions", y);

  const methodology = [
    "Net Position = Income PV + Current Assets - Debt PV - Expense PV",
    "Income PV discounts projected future income back to present value.",
    "Debt PV uses the annuity present value formula for recurring debt payments.",
    "Sensitivity analysis varies income growth and discount rate assumptions.",
    "Monte Carlo randomizes income growth, discount rate, investment return, and expense growth.",
    ...(showHousingData
      ? [
          "Buy vs Rent NPV compares the present value cost of renting versus buying over the holding period.",
        ]
      : []),
  ];

  y = addBulletList(doc, methodology, 14, y, 175);
  y += 4;

  y = addSectionTitle(doc, "Default Model Assumptions", y);

  const assumptions = [
    "Default discount rate: 5%, adjustable by user",
    "Default base income growth: 2%, adjustable by user",
    "Default expense growth / inflation: 2.5%, adjustable by user",
    "Default expected investment return: 6%, adjustable by user",
    "Default Monte Carlo trials: 1,000, adjustable by user",
    "Emergency fund target: 3 months of expenses",
    "High-interest debt threshold: 15% APR",
    ...(showHousingData
      ? ["Mortgage term used in Buy vs Rent model: 30 years"]
      : []),
  ];

  y = addBulletList(doc, assumptions, 14, y, 175);
  y += 4;

  y = addSectionTitle(doc, "Limitations", y);

  const limitations = [
    "The model is directional and scenario-based, not predictive.",
    "The model does not include taxes.",
    "The model does not use live market, mortgage, or inflation data.",
    "The model does not include exact state-specific cost-of-living adjustments.",
    "The model uses simplified assumptions for educational purposes.",
    "The model does not replace a certified financial planner.",
  ];

  y = addBulletList(doc, limitations, 14, y, 175);

  addFooter(doc);

  doc.save("finsight-financial-modeling-report.pdf");
}

// Optional legacy text report support, in case anything still imports it.
export function generateTextReport(result: FinancialResult): string {
  const showHousingData = shouldShowHousingData(result);

  const housingSection = showHousingData
    ? `

Buy vs Rent NPV Model:
PV Cost of Renting: ${formatCurrency(result.buyRentAnalysis.rentPV)}
PV Cost of Buying: ${formatCurrency(result.buyRentAnalysis.buyPV)}
NPV Difference: ${formatCurrency(result.buyRentAnalysis.difference)}
Recommendation: ${result.buyRentAnalysis.recommendation.toUpperCase()}`
    : "";

  return `
FInsight Financial Modeling Report

Financial Readiness Score: ${result.score.totalScore} / 100

Income PV: ${formatCurrency(result.incomePV)}
Assets: ${formatCurrency(result.assetValue)}
Debt PV: ${formatCurrency(result.debtPV)}
Expense PV: ${formatCurrency(result.expensePV)}
Net Position: ${formatCurrency(result.netPosition)}

Recommendation:
${result.recommendation}

Priority Action Plan:
${result.actionPlan.map((item, index) => `${index + 1}. ${item}`).join("\n")}
${housingSection}

Monte Carlo:
Probability Positive: ${formatPercent(result.monteCarloResult.probabilityPositive)}
Median Net Position: ${formatCurrency(result.monteCarloResult.median)}

Disclaimer:
FInsight is for educational purposes only and does not provide financial, investment, tax, or legal advice.
`.trim();
}

export function downloadTextReport(result: FinancialResult) {
  downloadPDFReport(result);
}