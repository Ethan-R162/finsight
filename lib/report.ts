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

function formatGoalStatus(status: string): string {
  if (status === "strong") return "Strong";
  if (status === "watch") return "Watch";
  return "Risky";
}

function addPageBackground(doc: jsPDF) {
  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, 210, 297, "F");
}

function addFooter(doc: jsPDF) {
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.25);
  doc.line(14, 282, 196, 282);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("FInsight Financial Modeling Report", 14, 287);
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

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
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
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);

  const valueLines = doc.splitTextToSize(value, width - 8);
  doc.text(valueLines.slice(0, 1), x + 4, y + 18);
}

function addKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number
): number {
  y = checkPageBreak(doc, y, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(label, x, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);

  const valueLines = doc.splitTextToSize(value, 92);
  doc.text(valueLines, x + 72, y);

  return y + Math.max(7, valueLines.length * 5);
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

  for (const item of items) {
    y = checkPageBreak(doc, y, 16);

    doc.setTextColor(34, 211, 238);
    doc.text("-", x, y);

    doc.setTextColor(226, 232, 240);

    const lines = doc.splitTextToSize(item, maxWidth);
    doc.text(lines, x + 5, y);

    y += lines.length * 5 + 3;
  }

  return y;
}

function addParagraph(
  doc: jsPDF,
  text: string,
  y: number,
  maxWidth = 182
): number {
  y = checkPageBreak(doc, y, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);

  return addWrappedText(doc, text, 14, y, maxWidth, 5);
}

function addSmallHeader(doc: jsPDF, text: string, y: number): number {
  y = checkPageBreak(doc, y, 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(text, 14, y);

  return y + 7;
}

function addScoreHero(doc: jsPDF, result: FinancialResult) {
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
    "A directional readiness score based on liquid safety, debt health, asset strength, and goal fit.";

  const scoreDescriptionLines = doc.splitTextToSize(scoreDescription, 92);

  doc.text(scoreDescriptionLines, 80, 58, {
    lineHeightFactor: 1.4,
  });

  doc.setFillColor(30, 41, 59);
  doc.rect(80, 72, 92, 4, "F");

  doc.setFillColor(34, 211, 238);
  doc.rect(
    80,
    72,
    Math.max(4, Math.min(92, (result.score.totalScore / 100) * 92)),
    4,
    "F"
  );
}

export function downloadPDFReport(result: FinancialResult) {
  const doc = new jsPDF("p", "mm", "a4");
  const goalAnalysis = result.goalAnalysis;

  addPageBackground(doc);

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

  addScoreHero(doc, result);
  addFooter(doc);

  let y = 98;

  y = addSectionTitle(doc, "Financial Snapshot", y);

  addMetricCard(doc, "Income PV", formatCurrency(result.incomePV), 14, y);
  addMetricCard(doc, "Assets", formatCurrency(result.assetValue), 110, y);

  y += 32;

  addMetricCard(doc, "Debt PV", formatCurrency(result.debtPV), 14, y);
  addMetricCard(doc, "Expense PV", formatCurrency(result.expensePV), 110, y);

  y += 34;

  y = checkPageBreak(doc, y, 28);

  doc.setFillColor(
    result.netPosition >= 0 ? 6 : 127,
    result.netPosition >= 0 ? 78 : 29,
    result.netPosition >= 0 ? 59 : 29
  );
  doc.setDrawColor(
    result.netPosition >= 0 ? 16 : 248,
    result.netPosition >= 0 ? 185 : 113,
    result.netPosition >= 0 ? 129 : 113
  );
  doc.roundedRect(14, y, 182, 28, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text("Net Position", 22, y + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(formatCurrency(result.netPosition), 22, y + 22);

  y += 42;

  y = addSectionTitle(doc, "Score Breakdown", y);

  y = addKeyValue(
    doc,
    "Liquid Safety Score",
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

  y = addSectionTitle(doc, "Goal-Specific Model", y);

  y = addKeyValue(doc, "Goal Model", goalAnalysis.title, 14, y);
  y = addKeyValue(
    doc,
    "Goal Status",
    formatGoalStatus(goalAnalysis.status),
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Goal Score",
    `${goalAnalysis.goalScore} / 100`,
    14,
    y
  );
  y = addKeyValue(
    doc,
    "Margin of Safety",
    goalAnalysis.marginOfSafety,
    14,
    y
  );

  y += 4;
  y = addParagraph(doc, goalAnalysis.summary, y);
  y += 4;
  y = addParagraph(doc, goalAnalysis.recommendationImpact, y);
  y += 6;

  y = addSmallHeader(doc, "Goal Metrics", y);

  for (const metric of goalAnalysis.metrics) {
    y = addKeyValue(doc, metric.label, metric.value, 14, y);

    if (metric.detail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      y = addWrappedText(doc, metric.detail, 22, y, 160, 4);
      y += 2;
    }
  }

  y += 4;
  y = addSmallHeader(doc, "Goal Score Drivers", y);

  for (const driver of goalAnalysis.scoreDrivers) {
    const impact =
      driver.impact > 0 ? `+${driver.impact}` : `${driver.impact}`;

    y = addKeyValue(doc, driver.label, impact, 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    y = addWrappedText(doc, driver.explanation, 22, y, 160, 4);
    y += 2;
  }

  y += 4;
  y = addSmallHeader(doc, "Conservative / Base / Optimistic Cases", y);

  for (const scenario of goalAnalysis.scenarios) {
    y = checkPageBreak(doc, y, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(34, 211, 238);
    doc.text(
      `${scenario.name} Case - ${scenario.goalScore}/100 - ${formatGoalStatus(
        scenario.status
      )}`,
      14,
      y
    );
    y += 6;

    y = addParagraph(doc, scenario.summary, y);

    for (const metric of scenario.metrics) {
      y = addKeyValue(doc, metric.label, metric.value, 22, y);
    }

    y += 3;
  }

  y += 4;

  y = addSectionTitle(doc, "Recommendation", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  y = addWrappedText(doc, result.recommendation, 14, y, 182, 6);
  y += 6;

  y = addSectionTitle(doc, "Priority Action Plan", y);
  y = addBulletList(doc, result.actionPlan, 14, y, 175);
  y += 4;

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
  y = addParagraph(doc, result.scenarioComparison.summary, y);
  y += 6;

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
  y = addParagraph(
    doc,
    "Sensitivity analysis tests net position around the user's selected income growth and discount rate assumptions. This shows how sensitive the result is to changes in core financial assumptions.",
    y
  );
  y += 6;

  y = addSectionTitle(doc, "Monte Carlo Simulation", y);

  y = addKeyValue(
    doc,
    "Simulations",
    result.monteCarloResult.simulations.toLocaleString(),
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

  y = addSectionTitle(doc, "Model Audit", y);

  y = addKeyValue(
    doc,
    "Overall Status",
    result.modelAudit.overallStatus.toUpperCase(),
    14,
    y
  );

  y += 3;

  for (const item of result.modelAudit.items) {
    y = checkPageBreak(doc, y, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${item.title} (${item.severity})`, 14, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    y = addWrappedText(doc, item.message, 18, y, 170, 4);
    y += 3;
  }

  y += 4;

  y = addSectionTitle(doc, "Model Methodology", y);

  const methodology = [
    "Core Net Position = Income PV + Current Assets - Debt PV - Expense PV.",
    "Income PV discounts projected future income back to present value.",
    "Debt PV uses the annuity present value formula for recurring debt payments.",
    "Expense PV discounts projected future expenses back to present value.",
    "The final readiness score includes liquid safety, debt health, asset strength, and goal fit.",
    "Liquid Safety is based on combined savings and emergency fund compared with monthly expenses.",
    "Goal Fit is generated by the selected goal-specific model and converted from a 0-100 goal score into a 25-point score component.",
    "Each goal model includes metrics, score drivers, margin of safety, and conservative/base/optimistic cases.",
    "Sensitivity analysis varies income growth and discount rate assumptions.",
    "Monte Carlo simulation randomizes income growth, discount rate, investment return, and expense growth.",
  ];

  y = addBulletList(doc, methodology, 14, y, 175);
  y += 4;

  y = addSectionTitle(doc, "Goal Model Methodology", y);

  const goalMethodology = [
    "Buy House: evaluates down payment gap, monthly housing cost, housing cost divided by income, debt-to-income ratio, home price divided by income, and housing margin of safety.",
    "Rent vs Buy: compares the present value cost of renting versus buying over the holding period and measures the NPV difference.",
    "Retirement: estimates projected assets at retirement, projected annual expenses, retirement need, retirement gap, and coverage ratio.",
    "Invest Assets: evaluates liquid safety gap, high-interest debt, investable assets, monthly surplus, risk tolerance, time horizon, and directional allocation logic.",
    "Scholarship ROI: estimates scholarship value, net education cost, annual income benefit, present value of income benefit, education NPV, payback period, and ROI.",
  ];

  y = addBulletList(doc, goalMethodology, 14, y, 175);
  y += 4;

  y = addSectionTitle(doc, "Key Model Assumptions", y);

  const assumptions = [
    "Default discount rate: 5%, adjustable by user.",
    "Default base income growth: 2%, adjustable by user.",
    "Default expense growth / inflation: 2.5%, adjustable by user.",
    "Default expected investment return: 6%, adjustable by user.",
    "Default Monte Carlo trials: 1,000, adjustable by user.",
    "Liquid safety target: combined savings and emergency fund should cover at least 3 months of expenses.",
    "High-interest debt threshold: 15% APR.",
    "Mortgage term used for housing calculations: 30 years.",
    "Retirement need uses a 25x projected annual expense multiple.",
    "Scholarship ROI uses a 10-year present value window for estimated income benefits.",
    "City type adjustment: city users have higher projected expenses, suburban users use the baseline, and rural users have lower projected expenses.",
  ];

  y = addBulletList(doc, assumptions, 14, y, 175);

  addFooter(doc);

  doc.save("finsight-financial-modeling-report.pdf");
}

export function generateTextReport(result: FinancialResult): string {
  const goalAnalysis = result.goalAnalysis;

  return `
FInsight Financial Modeling Report

Financial Readiness Score: ${result.score.totalScore} / 100

Financial Snapshot:
Income PV: ${formatCurrency(result.incomePV)}
Assets: ${formatCurrency(result.assetValue)}
Debt PV: ${formatCurrency(result.debtPV)}
Expense PV: ${formatCurrency(result.expensePV)}
Net Position: ${formatCurrency(result.netPosition)}

Score Breakdown:
Liquid Safety: ${result.score.emergencyFundScore} / 25
Debt Health: ${result.score.debtHealthScore} / 25
Asset Strength: ${result.score.assetStrengthScore} / 25
Goal Fit: ${result.score.goalFitScore} / 25

Goal Analysis:
Goal Model: ${goalAnalysis.title}
Goal Status: ${formatGoalStatus(goalAnalysis.status)}
Goal Score: ${goalAnalysis.goalScore} / 100
Margin of Safety: ${goalAnalysis.marginOfSafety}
Summary: ${goalAnalysis.summary}
Recommendation Impact: ${goalAnalysis.recommendationImpact}

Goal Metrics:
${goalAnalysis.metrics
  .map((metric) => `- ${metric.label}: ${metric.value}`)
  .join("\n")}

Goal Score Drivers:
${goalAnalysis.scoreDrivers
  .map(
    (driver) =>
      `- ${driver.label}: ${driver.impact > 0 ? "+" : ""}${driver.impact} | ${
        driver.explanation
      }`
  )
  .join("\n")}

Goal Scenarios:
${goalAnalysis.scenarios
  .map(
    (scenario) =>
      `- ${scenario.name}: ${scenario.goalScore}/100 (${formatGoalStatus(
        scenario.status
      )}) - ${scenario.summary}`
  )
  .join("\n")}

Recommendation:
${result.recommendation}

Priority Action Plan:
${result.actionPlan.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Monte Carlo:
Probability Positive: ${formatPercent(result.monteCarloResult.probabilityPositive)}
10th Percentile: ${formatCurrency(result.monteCarloResult.tenthPercentile)}
Median Net Position: ${formatCurrency(result.monteCarloResult.median)}
90th Percentile: ${formatCurrency(result.monteCarloResult.ninetiethPercentile)}

`;
}

export function downloadTextReport(result: FinancialResult) {
  downloadPDFReport(result);
}