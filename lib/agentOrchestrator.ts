/**
 * LangGraph-style orchestration (linear state machine for MVP).
 *
 * Production: port nodes to LangGraph `StateGraph` with checkpoints, human-in-the-loop
 * approval edges before checkout, and tool bindings (Playwright, Supabase, OpenAI Responses).
 */

import type { AgentActivityStep, CopilotRunState } from "./types";

export const DEMO_ACTIVITY_BLUEPRINT: Omit<AgentActivityStep, "status">[] = [
  { id: "amazon-seller-rep", label: "Amazon seller reputation", agent: "TrustAgent" },
  { id: "walmart-seller-rep", label: "Walmart seller reputation", agent: "TrustAgent" },
  { id: "target-seller-rep", label: "Target seller reputation", agent: "TrustAgent" },
  { id: "fake-account-discount", label: "Fake account discount", agent: "TrustAgent" },
];

export function initialActivitySteps(): AgentActivityStep[] {
  return DEMO_ACTIVITY_BLUEPRINT.map((b) => ({ ...b, status: "pending" as const }));
}

function detailForStep(
  id: string,
  state: CopilotRunState,
): { detail?: string; status?: AgentActivityStep["status"] } {
  const amazon = state.products.find((p) => p.marketplace === "Amazon");
  const walmart = state.products.find((p) => p.marketplace === "Walmart");
  const target = state.products.find((p) => p.marketplace === "Target");
  const warn = state.fakeDiscountWarnings[0];

  switch (id) {
    case "amazon-seller-rep":
      return {
        detail: amazon
          ? `${amazon.sellerName} — rating ${amazon.sellerRating}/5, composite trust ${amazon.trustScore}%.`
          : "No Amazon listing in filtered set.",
      };
    case "walmart-seller-rep":
      return {
        detail: walmart
          ? `${walmart.sellerName} — rating ${walmart.sellerRating}/5, composite trust ${walmart.trustScore}%.`
          : "No Walmart listing in filtered set.",
      };
    case "target-seller-rep":
      return {
        detail: target
          ? `${target.sellerName} — rating ${target.sellerRating}/5, composite trust ${target.trustScore}%.`
          : "No Target listing in filtered set.",
      };
    case "fake-account-discount":
      return {
        detail: warn ?? "No suspicious new-account or stacked-promo discount patterns in filtered listings.",
        status: warn ? "warning" : "complete",
      };
    default:
      return {};
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runAnimatedAgentDemo(
  state: CopilotRunState,
  handlers: {
    onSteps: (steps: AgentActivityStep[]) => void;
    onState: (state: CopilotRunState) => void;
    stepDelayMs?: number;
  },
): Promise<CopilotRunState> {
  const stepDelay = handlers.stepDelayMs ?? 520;
  let steps = initialActivitySteps();

  for (let i = 0; i < steps.length; i++) {
    steps = steps.map((s, idx) => ({
      ...s,
      status:
        idx < i ? "complete" : idx === i ? "running" : ("pending" as AgentActivityStep["status"]),
    }));
    handlers.onSteps(steps);
    await delay(stepDelay * 0.65 + Math.random() * 180);

    const meta = detailForStep(steps[i]!.id, state);
    steps = steps.map((s, idx) => {
      if (idx !== i) return s;
      return {
        ...s,
        status: meta.status ?? "complete",
        detail: meta.detail,
      };
    });
    handlers.onSteps(steps);
    await delay(stepDelay * 0.35);
  }

  handlers.onState(state);
  return state;
}
