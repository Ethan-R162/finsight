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

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const result = (await request.json()) as FinancialResult;

    const modelSummary = {
      financialReadinessScore: result.score.totalScore,
      scoreBreakdown: result.score,
      incomePV: formatCurrency(result.incomePV),
      assetValue: formatCurrency(result.assetValue),
      debtPV: formatCurrency(result.debtPV),
      expensePV: formatCurrency(result.expensePV),
      netPosition: formatCurrency(result.netPosition),
      recommendation: result.recommendation,
      actionPlan: result.actionPlan,
      scenarioComparison: {
        currentNetPosition: formatCurrency(
          result.scenarioComparison.currentNetPosition
        ),
        improvedNetPosition: formatCurrency(
          result.scenarioComparison.improvedNetPosition
        ),
        difference: formatCurrency(result.scenarioComparison.difference),
        summary: result.scenarioComparison.summary,
      },
      buyRentAnalysis: {
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
      },
      monteCarlo: {
        simulations: result.monteCarloResult.simulations,
        probabilityPositive: `${(
          result.monteCarloResult.probabilityPositive * 100
        ).toFixed(0)}%`,
        tenthPercentile: formatCurrency(
          result.monteCarloResult.tenthPercentile
        ),
        median: formatCurrency(result.monteCarloResult.median),
        ninetiethPercentile: formatCurrency(
          result.monteCarloResult.ninetiethPercentile
        ),
        averageOutcome: formatCurrency(
          result.monteCarloResult.averageNetPosition
        ),
      },
    };

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are an analyst explaining a financial modeling output. Do not give personalized financial advice. Do not recommend specific securities. Explain the model results clearly, professionally, and concisely. Emphasize that this is educational and based on simplified assumptions.",
        },
        {
          role: "user",
          content: `Explain these FInsight model outputs in a clear analyst-style summary. Use 4 short sections:
1. Overall interpretation
2. Biggest drivers
3. Risk factors from sensitivity/Monte Carlo
4. What the user should review next

Keep it under 250 words. Here are the model outputs:

${JSON.stringify(modelSummary, null, 2)}`,
        },
      ],
    });

    const explanation = response.output_text;

    return Response.json({ explanation });
  } catch (error) {
    console.error("AI explanation error:", error);

    return Response.json(
      { error: "Failed to generate AI explanation." },
      { status: 500 }
    );
  }
}