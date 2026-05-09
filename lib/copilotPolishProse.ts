import OpenAI from "openai";

export type CopilotPolishBody = {
  system?: string;
  user?: string;
  draft?: string;
};

export type CopilotPolishResult =
  | { ok: true; text: string }
  | { ok: false; error: string; missingApiKey?: true };

/**
 * OpenAI Responses API — shared by `/api/copilot/responses` and the WebMCP `polish_prose` tool.
 */
export async function polishCopilotProse(body: CopilotPolishBody): Promise<CopilotPolishResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "OPENAI_API_KEY not configured; using local templates only.",
      missingApiKey: true,
    };
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_RESPONSES_MODEL ?? "gpt-4.1-mini";

  const input =
    body.user ??
    `Rewrite the following buyer negotiation message to be concise and human. Keep price facts exact.\n\n${body.draft ?? ""}`;

  const response = await openai.responses.create({
    model,
    instructions:
      body.system ??
      "You are Autonomous Commerce Copilot. Never promise checkout or legal outcomes. No autonomous purchasing.",
    input,
  });

  const text =
    response.output_text ??
    response.output
      ?.flatMap((item) =>
        item.type === "message"
          ? item.content
              .filter((c) => c.type === "output_text")
              .map((c) => ("text" in c ? c.text : ""))
          : [],
      )
      .join("\n") ??
    "";

  return { ok: true, text };
}
