import { NextResponse } from "next/server";
import { polishCopilotProse } from "@/lib/copilotPolishProse";

/**
 * OpenAI Responses API — optional enhancement for negotiation copy & executive summary.
 * Same logic as WebMCP tool `polish_prose` (see /api/mcp).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      system?: string;
      user?: string;
      draft?: string;
    };

    const result = await polishCopilotProse(body);
    if (!result.ok && result.missingApiKey) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, text: result.text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
