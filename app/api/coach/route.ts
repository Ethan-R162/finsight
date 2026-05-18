import OpenAI from "openai";
import { FinancialResult } from "@/types/financial";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

function createModelSummary(result: FinancialResult) {
  return {
    financialReadinessScore: `${result.score.totalScore}/100`,
    scoreBreakdown: {
      emergencyFund: `${result.score.emergencyFundScore}/25`,
      debtHealth: `${result.score.debtHealthScore}/25`,
      assetStrength: `${result.score.assetStrengthScore}/25`,
      goalFit: `${result.score.goalFitScore}/25`,
    },
    financialSnapshot: {
      incomePV: formatCurrency(result.incomePV),
      assets: formatCurrency(result.assetValue),
      debtPV: formatCurrency(result.debtPV),
      expensePV: formatCurrency(result.expensePV),
      netPosition: formatCurrency(result.netPosition),
    },
    recommendation: result.recommendation,
    actionPlan: result.actionPlan,
    scenarioComparison: {
      currentPlan: formatCurrency(result.scenarioComparison.currentNetPosition),
      improvedPlan: formatCurrency(result.scenarioComparison.improvedNetPosition),
      difference: formatCurrency(result.scenarioComparison.difference),
      summary: result.scenarioComparison.summary,
    },
    buyRentNPV: {
      rentPV: formatCurrency(result.buyRentAnalysis.rentPV),
      buyPV: formatCurrency(result.buyRentAnalysis.buyPV),
      difference: formatCurrency(result.buyRentAnalysis.difference),
      recommendation: result.buyRentAnalysis.recommendation,
      summary: result.buyRentAnalysis.summary,
    },
    sensitivityAnalysis: {
      downsideCase: formatCurrency(result.sensitivityAnalysis.downsideCase),
      baseCase: formatCurrency(result.sensitivityAnalysis.baseCase),
      upsideCase: formatCurrency(result.sensitivityAnalysis.upsideCase),
      note:
        "Sensitivity analysis tests net position around selected income growth and discount rate assumptions.",
    },
    monteCarlo: {
      simulations: result.monteCarloResult.simulations,
      probabilityPositive: formatPercent(
        result.monteCarloResult.probabilityPositive
      ),
      tenthPercentile: formatCurrency(result.monteCarloResult.tenthPercentile),
      median: formatCurrency(result.monteCarloResult.median),
      ninetiethPercentile: formatCurrency(
        result.monteCarloResult.ninetiethPercentile
      ),
      averageOutcome: formatCurrency(
        result.monteCarloResult.averageNetPosition
      ),
      worstCase: formatCurrency(result.monteCarloResult.worstCase),
      bestCase: formatCurrency(result.monteCarloResult.bestCase),
    },
  };
}

function localFallbackAnswer(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("monte carlo")) {
    return "Monte Carlo simulation tests the model across many randomized cases instead of relying on one base case. In FInsight, it randomizes income growth, discount rate, investment return, and expense growth. The key output is the probability of a positive net position, plus downside, median, and upside outcomes. This is a stress-testing tool, not a prediction.";
  }

  if (lowerQuestion.includes("sensitivity")) {
    return "Sensitivity analysis shows how the modeled net position changes when core assumptions change. In FInsight, the table tests different income growth and discount rate assumptions. If the result changes heavily across the table, the model is sensitive to assumptions and should be interpreted more cautiously.";
  }

  if (
    lowerQuestion.includes("buy") ||
    lowerQuestion.includes("rent") ||
    lowerQuestion.includes("house")
  ) {
    return "The Buy vs Rent NPV model compares the present value cost of renting against the present value cost of buying. Buying includes down payment, mortgage payments, property tax, maintenance, closing costs, home appreciation, and remaining loan balance. The lower present value cost is treated as the better modeled option under the selected assumptions.";
  }

  if (lowerQuestion.includes("discount rate")) {
    return "The discount rate converts future cash flows into today's dollars. A higher discount rate usually reduces the present value of future income and expenses. In FInsight, changing the discount rate affects the NPV model, sensitivity analysis, and Monte Carlo outputs.";
  }

  if (lowerQuestion.includes("score")) {
    return "The Financial Readiness Score is a 100-point score built from four categories: emergency fund, debt health, asset strength, and goal fit. It is meant to summarize the model output into an easier-to-read dashboard metric.";
  }

  return "FInsight AI Coach is currently using a fallback explanation. The model first calculates NPV, score, sensitivity analysis, Monte Carlo simulation, and Buy vs Rent outputs. The AI layer explains those outputs, but it does not replace the underlying financial model or provide financial advice.";
}

export async function POST(request: Request) {
  let questionForFallback = "";

  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          answer:
            "AI Coach is not connected because the OPENAI_API_KEY environment variable is missing. The model outputs are still valid because they are generated by the formula-based financial engine.",
        },
        { status: 200 }
      );
    }

    const body = (await request.json()) as {
      question: string;
      result: FinancialResult;
    };

    const question = body.question?.trim();
    questionForFallback = question || "";

    if (!question) {
      return Response.json(
        { answer: "Please enter a question about the model results." },
        { status: 400 }
      );
    }

    const modelSummary = createModelSummary(body.result);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are FInsight AI Coach, a financial modeling tutor. Your job is to explain formulas, assumptions, model outputs, sensitivity analysis, Monte Carlo simulation, and buy-vs-rent NPV results. Do not provide personalized financial, tax, legal, or investment advice. Do not recommend specific securities. Do not override the model. Use only the model outputs provided. Be clear, concise, and educational.",
        },
        {
          role: "user",
          content: `User question: ${question}

FInsight model output:
${JSON.stringify(modelSummary, null, 2)}

Answer the user's question in a helpful tutoring style. Use simple language, but include financial modeling terms where useful. Keep the answer under 220 words.`,
        },
      ],
    });

    return Response.json({ answer: response.output_text });
  } catch (error) {
    console.error("AI coach error:", error);

    return Response.json({
      answer: localFallbackAnswer(questionForFallback),
    });
  }
}