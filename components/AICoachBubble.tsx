"use client";

import { useEffect, useRef, useState } from "react";
import { FinancialResult } from "@/types/financial";

type Props = {
  result: FinancialResult | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type SuggestedQuestion = {
  label: string;
  question: string;
};

export default function AICoachBubble({ result }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hasResults = Boolean(result);

  const suggestedQuestions: SuggestedQuestion[] = hasResults
    ? [
        {
          label: "Explain my results",
          question: "Explain my results in simple terms.",
        },
        {
          label: "Biggest risk",
          question: "What is my biggest risk based on the model?",
        },
        {
          label: "Challenge assumptions",
          question:
            "Challenge my assumptions. Which assumptions might be too optimistic or risky?",
        },
        {
          label: "What first?",
          question: "What should I do first based on my results?",
        },
        {
          label: "Audit explanation",
          question: "Explain my model audit in simple terms.",
        },
        {
          label: "Most important assumption",
          question: "Which assumption matters most for my result and why?",
        },
      ]
    : [
        {
          label: "Choose goal",
          question: "What goal should I choose?",
        },
        {
          label: "Discount rate",
          question: "What discount rate should I use?",
        },
        {
          label: "Monthly expenses",
          question: "How should I estimate monthly expenses?",
        },
        {
          label: "Monte Carlo",
          question: "What does Monte Carlo mean?",
        },
        {
          label: "Input accuracy",
          question: "How accurate do my inputs need to be?",
        },
      ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function askCoach(questionOverride?: string) {
    const finalQuestion = questionOverride || question;

    if (!finalQuestion.trim()) {
      setError("Ask a question first.");
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: finalQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion,
          result,
          mode: hasResults ? "results" : "form_help",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.answer || "Failed to get AI Coach response.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get AI Coach response."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askCoach();
    }
  }

  function clearChat() {
    setMessages([]);
    setQuestion("");
    setError(null);
  }

  return (
    <div className="fixed bottom-4 right-5 z-50">
      {isOpen && (
        <div className="mb-3 flex h-[34rem] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-cyan-500/20">
          <div className="border-b border-white/10 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  FInsight AI Coach
                </p>

                <p className="mt-1 text-xs leading-5 text-white/80">
                  {hasResults
                    ? "Ask about your results, risks, assumptions, audit, or next steps."
                    : "Ask for help while filling out the financial model."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/15 px-2 py-1 text-sm text-white transition hover:bg-white/25"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="border-b border-white/10 bg-slate-900/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Mode
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {hasResults ? "Results Coach" : "Form Help"}
                </p>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">
                  Suggested questions
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Pick one to quickly test the coach.
                </p>

                <div className="mt-3 grid gap-2">
                  {suggestedQuestions.map((item) => (
                    <button
                      key={item.question}
                      type="button"
                      onClick={() => askCoach(item.question)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-left text-xs leading-5 text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                    >
                      <span className="font-semibold text-cyan-300">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-slate-400">
                        {item.question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`whitespace-pre-wrap rounded-2xl p-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-6 bg-cyan-400/10 text-cyan-100"
                    : "mr-6 border border-white/10 bg-white/[0.04] text-slate-100"
                }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading && (
              <div className="mr-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
                Thinking...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasResults
                  ? "Ask about your score, audit, assumptions, or risk..."
                  : "Ask for help with the form..."
              }
              className="min-h-16 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
            />

            <button
              type="button"
              onClick={() => askCoach()}
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Thinking..." : "Ask FInsight"}
            </button>

            <p className="mt-2 text-center text-[11px] leading-4 text-slate-500">
              Educational support only. Not financial, tax, legal, or investment
              advice.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-3 font-semibold text-white shadow-2xl shadow-cyan-500/30 transition hover:scale-[1.03]"
      >
        <span className="text-lg">💬</span>
        <span>Ask FInsight</span>
      </button>
    </div>
  );
}