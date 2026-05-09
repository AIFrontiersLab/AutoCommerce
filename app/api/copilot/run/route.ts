import { NextResponse } from "next/server";
import { buildCopilotState } from "@/lib/copilotState";

/** Always read fresh `process.env` and run SerpApi on the server (no static caching of responses). */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: string };
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const state = await buildCopilotState(prompt || " ");
    return NextResponse.json({ ok: true, state });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
