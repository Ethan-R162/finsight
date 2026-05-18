import OpenAI from "openai";
import { FinancialResult } from "@/types/financial";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isHousingGoal(result: FinancialResult) {
  return result.goal === "buy_house" || result.goal === "rent_vs_buy";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

function formatAuditStatus(status: string) {
  if (status === "healthy") return "Healthy";
  if (status === "watch") return "Watch";
  return "Risky";
}

function createModelSummary(result: FinancialResult) {
  const showHousingData = isHousingGoal(result);

  return {
    goal: result.goal,
    financialReadinessScore: result.score.totalScore,
    scoreBreakdown: result.score,
    netPosition: result.netPosition,
    recommendation: result.recommendation,
    actionPlan: result.actionPlan,
    presentValueOutputs: {
      incomePV: result.incomePV,
      assetValue: result.assetValue,
      debtPV: result.debtPV,
      expensePV: result.expensePV,
    },
    scenarioComparison: result.scenarioComparison,
    sensitivityAnalysis: {
      baseCase: result.sensitivityAnalysis.baseCase,
      downsideCase: result.sensitivityAnalysis.downsideCase,
      upsideCase: result.sensitivityAnalysis.upsideCase,
    },
    monteCarlo: {
      simulations: result.monteCarloResult.simulations,
      probabilityPositive: result.monteCarloResult.probabilityPositive,
      tenthPercentile: result.monteCarloResult.tenthPercentile,
      median: result.monteCarloResult.median,
      ninetiethPercentile: result.monteCarloResult.ninetiethPercentile,
      averageNetPosition: result.monteCarloResult.averageNetPosition,
      worstCase: result.monteCarloResult.worstCase,
      bestCase: result.monteCarloResult.bestCase,
    },
    modelAssumptions: result.modelAssumptions,
    modelAudit: result.modelAudit,
    ...(showHousingData
      ? {
          buyRentNPV: result.buyRentAnalysis,
        }
      : {}),
  };
}

function summarizeResultForFallback(result?: FinancialResult | null) {
  if (!result) {
    return "";
  }

  const auditStatus = formatAuditStatus(result.modelAudit.overallStatus);
  const biggestAuditItems = result.modelAudit.items
    .filter((item) => item.severity === "risk" || item.severity === "warning")
    .slice(0, 2)
    .map((item) => item.title);

  const auditText =
    biggestAuditItems.length > 0
      ? biggestAuditItems.join(", ")
      : "No major warning flags";

  return `Score: ${result.score.totalScore}/100. Net position: ${formatCurrency(
    result.netPosition
  )}. Positive Monte Carlo probability: ${formatPercent(
    result.monteCarloResult.probabilityPositive
  )}. Audit status: ${auditStatus}. Key flags: ${auditText}.`;
}

function localFallbackAnswer(
  question: string,
  mode: string,
  result?: FinancialResult | null
) {
  const lowerQuestion = question.toLowerCase();
  const resultSummary = summarizeResultForFallback(result);

  if (mode === "form_help") {
    if (lowerQuestion.includes("discount rate")) {
      return "The discount rate converts future money into today's dollars. A higher discount rate makes future cash flows less valuable. For this class model, a mid-single-digit rate like 5% to 7% is usually a reasonable starting range unless your professor gave a specific required assumption.";
    }

    if (lowerQuestion.includes("monte carlo")) {
      return "Monte Carlo simulation means the model runs many randomized versions of the same financial situation instead of relying on one fixed case. FInsight changes assumptions like income growth, investment return, discount rate, and expense growth to estimate downside, median, and upside outcomes.";
    }

    if (
      lowerQuestion.includes("monthly expenses") ||
      lowerQuestion.includes("expenses")
    ) {
      return "Use your average required monthly spending. Include rent, food, transportation, utilities, insurance, subscriptions, debt payments, and other recurring costs. Do not include unusual one-time purchases unless you expect them to continue.";
    }

    if (lowerQuestion.includes("goal")) {
      return "Choose the goal that best matches the decision you want the model to help with. Use Rent vs Buy for housing decisions, Invest Assets for portfolio direction, Retirement for long-term readiness, Scholarship for school-related decisions, and Buy House if your main goal is home ownership.";
    }

    if (lowerQuestion.includes("accurate") || lowerQuestion.includes("input")) {
      return "Your inputs do not need to be perfect, but they should be realistic. The model is most sensitive to income, expenses, debt, discount rate, and income growth. Small errors are fine, but overly optimistic assumptions can make the result look much stronger than it really is.";
    }

    return "I can help you fill out the model. Ask about goal selection, discount rate, income growth, monthly expenses, risk tolerance, time horizon, investment return, or Monte Carlo simulation.";
  }

  if (lowerQuestion.includes("challenge")) {
    return `${resultSummary}

To challenge the assumptions, look first at income growth, expense growth, discount rate, and investment return. If income growth is too high or expenses are too low, the model can become overly optimistic. A stronger test is to compare the base case to the downside case and ask whether the plan still works under less favorable assumptions.`;
  }

  if (lowerQuestion.includes("audit")) {
    return `${resultSummary}

The model audit is a quality-control check. It flags issues like low emergency fund, high debt pressure, high-interest credit card debt, aggressive housing assumptions, unusual discount rates, or weak net position. Treat risk and warning items as the first things to review before trusting the recommendation too heavily.`;
  }

  if (lowerQuestion.includes("risk")) {
    return `${resultSummary}

Your biggest risk is usually shown by the model audit, the debt health score, the emergency fund score, and the Monte Carlo downside result. Start with any audit item marked as risk or warning, then compare the 10th percentile or downside case against the base case.`;
  }

  if (lowerQuestion.includes("assumption")) {
    return `${resultSummary}

The most important assumptions are usually discount rate, income growth, expense growth, and expected investment return. These matter because they compound over time and directly affect present value. The sensitivity table shows which assumption changes the final net position the most.`;
  }

  if (lowerQuestion.includes("first") || lowerQuestion.includes("do")) {
    return `${resultSummary}

The first step should be the highest-impact risk flag. In most cases, that means building the emergency fund, reducing high-interest credit card debt, lowering monthly expenses, or using more conservative growth assumptions before making a major investing or housing decision.`;
  }

  if (lowerQuestion.includes("monte carlo")) {
    return `${resultSummary}

Monte Carlo simulation shows how stable the result is across many randomized scenarios. A high positive probability means most simulated cases ended with a positive net position. The 10th percentile is useful because it shows a realistic downside outcome, not just the average case.`;
  }

  return `${resultSummary}

The AI Coach can explain your score, recommendation, audit flags, assumptions, Monte Carlo simulation, sensitivity analysis, and next steps. For full formulas and limitations, use the Methodology page.`;
}

export async function POST(request: Request) {
  let questionForFallback = "";
  let modeForFallback = "results";
  let resultForFallback: FinancialResult | null = null;

  try {
    const body = (await request.json()) as {
      question: string;
      result?: FinancialResult | null;
      mode?: "form_help" | "results";
    };

    const question = body.question?.trim();
    const mode = body.mode || (body.result ? "results" : "form_help");

    questionForFallback = question || "";
    modeForFallback = mode;
    resultForFallback = body.result || null;

    if (!question) {
      return Response.json(
        { answer: "Please enter a question for the AI Coach." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        answer: localFallbackAnswer(question, mode, body.result),
      });
    }

    const systemPrompt =
      mode === "form_help"
        ? `You are FInsight AI Coach, an educational financial modeling assistant inside a student-built fintech web app.

Your job:
- Help the user understand form inputs and assumptions.
- Explain finance/modeling concepts in simple language.
- Keep answers concise, practical, and easy to understand.
- Refer users to the Methodology page for full formulas and limitations when useful.

Important boundaries:
- Do not give personalized legal, tax, investment, or financial advice.
- Do not tell the user to buy, sell, or trade any specific security.
- Do not guarantee outcomes.
- Frame guidance as educational model interpretation.`
        : `You are FInsight AI Coach, an educational financial modeling assistant inside a student-built fintech web app.

Your job:
- Explain the user's model results, score, recommendation, model audit, assumptions, sensitivity analysis, Monte Carlo simulation, and next steps.
- Identify the biggest risks and most important assumptions.
- Challenge overly optimistic assumptions when asked.
- Keep answers concise, practical, and easy to understand.
- Refer users to the Methodology page for full formulas and limitations when useful.

Important boundaries:
- Do not give personalized legal, tax, investment, or financial advice.
- Do not tell the user to buy, sell, or trade any specific security.
- Do not guarantee outcomes.
- Do not invent inputs that are not in the model output.
- Frame guidance as educational model interpretation.`;

    const userContent =
      mode === "form_help"
        ? `User question: ${question}

The user is filling out the FInsight model before calculation.

Relevant model inputs include:
- goal
- age and retirement age
- income
- monthly expenses
- savings and emergency fund
- stocks, bonds, and real estate value
- debt payment, debt interest rate, and years remaining
- credit card debt and APR
- dependents
- city type
- occupation status and industry
- risk tolerance
- time horizon
- discount rate
- base income growth rate
- expense growth rate
- expected investment return
- Monte Carlo runs

Answer under 180 words. Use simple language.`
        : `User question: ${question}

FInsight model output:
${JSON.stringify(body.result ? createModelSummary(body.result) : null, null, 2)}

Answer based only on the model output above.
Use simple language.
Keep the answer under 240 words.
When useful, mention that the full formulas and limitations are on the Methodology page.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    return Response.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error("AI coach error:", error);

    return Response.json({
      answer: localFallbackAnswer(
        questionForFallback,
        modeForFallback,
        resultForFallback
      ),
    });
  }
}