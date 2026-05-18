import OpenAI from "openai";
import { FinancialResult } from "@/types/financial";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function isHousingGoal(result: FinancialResult) {
  return result.goal === "buy_house" || result.goal === "rent_vs_buy";
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
    monteCarlo: result.monteCarloResult,
    modelAssumptions: result.modelAssumptions,
    modelAudit: result.modelAudit,
    ...(showHousingData
      ? {
          buyRentNPV: result.buyRentAnalysis,
        }
      : {}),
  };
}

function localFallbackAnswer(question: string, mode: string) {
  const lowerQuestion = question.toLowerCase();

  if (mode === "form_help") {
    if (lowerQuestion.includes("discount rate")) {
      return "The discount rate is the rate used to convert future money into today's dollars. A higher discount rate makes future cash flows less valuable. For a class model, a mid-single-digit rate like 5% is a reasonable starting assumption unless your professor gave a specific number.";
    }

    if (lowerQuestion.includes("monte carlo")) {
      return "Monte Carlo simulation means the model runs many randomized cases instead of only one fixed case. It changes assumptions like growth, returns, and expenses to estimate a range of possible outcomes.";
    }

    if (lowerQuestion.includes("monthly expenses")) {
      return "Use your average required monthly spending. Include rent, food, transportation, insurance, debt payments, utilities, and other recurring costs. Do not include one-time unusual purchases unless they are expected to continue.";
    }

    if (lowerQuestion.includes("goal")) {
      return "Choose the goal that best matches the decision you want the model to help with. If you are comparing housing choices, choose Rent vs Buy. If you are focused on long-term financial health, choose Retirement or Invest Assets.";
    }

    return "I can help you fill out the model. Ask me about discount rate, income growth, expenses, Monte Carlo simulation, risk tolerance, or which goal to choose.";
  }

  if (lowerQuestion.includes("audit")) {
    return "The model audit checks whether your inputs look reasonable before relying on the output. It flags issues like low emergency fund, high expenses, high-interest debt, aggressive home price assumptions, or unusual model assumptions.";
  }

  if (lowerQuestion.includes("risk")) {
    return "Your biggest risk is usually found by looking at the model audit, debt health score, emergency fund score, and Monte Carlo downside result. Start with any item marked as a risk or warning.";
  }

  if (lowerQuestion.includes("assumption")) {
    return "The most important assumptions are usually discount rate, income growth, expense growth, and investment return. The sensitivity analysis helps show how much the result changes when assumptions move.";
  }

  if (lowerQuestion.includes("monte carlo")) {
    return "The Monte Carlo simulation runs randomized versions of the model to estimate downside, median, and upside outcomes. It helps show whether your result is stable or highly dependent on optimistic assumptions.";
  }

  return "The AI Coach is currently using a local fallback answer. It can explain your score, recommendation, model audit, assumptions, Monte Carlo simulation, sensitivity analysis, and next steps.";
}

export async function POST(request: Request) {
  let questionForFallback = "";
  let modeForFallback = "results";

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

    if (!question) {
      return Response.json(
        { answer: "Please enter a question for the AI Coach." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        answer: localFallbackAnswer(question, mode),
      });
    }

    const systemPrompt =
      mode === "form_help"
        ? `You are FInsight AI Coach, a financial modeling assistant inside a student-built fintech app. 
You are helping the user complete the financial intake form before calculation.
Explain inputs, assumptions, and modeling concepts in simple language.
Do not give personalized legal, tax, or investment advice.
Keep answers practical, concise, and educational.`
        : `You are FInsight AI Coach, a financial modeling assistant inside a student-built fintech app.
You explain the user's model results, assumptions, score, audit flags, Monte Carlo simulation, sensitivity analysis, and recommendation.
Do not give personalized legal, tax, or investment advice.
Be clear, practical, and educational.`;

    const userContent =
      mode === "form_help"
        ? `User question: ${question}

The user is currently filling out the FInsight model before calculation.
Help them understand inputs such as income, expenses, risk tolerance, time horizon, discount rate, income growth, expense growth, investment return, Monte Carlo runs, and goal selection.
Keep the answer under 180 words.`
        : `User question: ${question}

FInsight model output:
${JSON.stringify(body.result ? createModelSummary(body.result) : null, null, 2)}

Answer the user's question based on the model output. Keep the answer under 220 words.`;

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
      answer: localFallbackAnswer(questionForFallback, modeForFallback),
    });
  }
}