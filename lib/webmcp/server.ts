import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildCopilotState } from "@/lib/copilotState";
import { polishCopilotProse } from "@/lib/copilotPolishProse";
import { MOCK_CATALOG_ALL } from "@/lib/mockProducts";
import { fetchOrganicSearchResults } from "@/lib/serpWebSearch";

/**
 * Stateless MCP server instance for one HTTP request (Streamable HTTP transport).
 * Tools mirror server-side copilot and research capabilities without exposing API keys to clients.
 */
export function createAutoCommerceMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "autonomous-commerce-copilot",
      version: "0.1.0",
    },
    {
      capabilities: { logging: {} },
      instructions:
        "Autonomous Commerce Copilot WebMCP: run the full copilot pipeline, polish negotiation copy via OpenAI (when configured), query SerpApi organic results, or read the seeded mock catalog. Never promise checkout or autonomous purchasing.",
    },
  );

  server.registerTool(
    "copilot_run",
    {
      title: "Run copilot pipeline",
      description:
        "Runs memory, research, comparison, trust, coupon, price, and negotiation agents; returns full CopilotRunState JSON (same as POST /api/copilot/run).",
      inputSchema: {
        prompt: z
          .string()
          .describe("Buyer goal or product question (e.g. laptop under $2000).")
          .default(" "),
      },
    },
    async ({ prompt }) => {
      try {
        const state = await buildCopilotState(prompt || " ");
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: true, state }) }],
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: false, error: message }) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "polish_prose",
    {
      title: "Polish negotiation copy",
      description:
        "Uses OpenAI Responses API when OPENAI_API_KEY is set; otherwise returns an error payload (same behavior as /api/copilot/responses).",
      inputSchema: {
        draft: z.string().optional().describe("Negotiation draft to rewrite."),
        system: z.string().optional().describe("Optional system instructions override."),
        user: z.string().optional().describe("Optional full user message; if set, draft default rewrite is skipped."),
      },
    },
    async (body) => {
      try {
        const result = await polishCopilotProse(body);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: false, error: message }) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "web_search_organic",
    {
      title: "SerpApi organic web search",
      description:
        "Google organic results via SerpApi using server-side SERPAPI_API_KEY (never returned to the client).",
      inputSchema: {
        query: z.string().describe("Search query."),
        max: z.number().int().min(1).max(20).optional().describe("Max organic rows (default 10)."),
      },
    },
    async ({ query, max }) => {
      const serp = await fetchOrganicSearchResults(query, max ?? 10);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              items: serp.items,
              keyConfigured: serp.keyConfigured,
              fetchError: serp.fetchError,
              organicEmpty: serp.organicEmpty,
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    "catalog_list_seed",
    {
      title: "List seeded mock catalog slice",
      description: "Returns the first N normalized Product rows from the local mock catalog (MOCK_CATALOG_ALL).",
      inputSchema: {
        limit: z.number().int().min(1).max(200).optional().describe("Number of products (default 30)."),
      },
    },
    async ({ limit }) => {
      const n = limit ?? 30;
      const slice = MOCK_CATALOG_ALL.slice(0, n);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              total: MOCK_CATALOG_ALL.length,
              returned: slice.length,
              products: slice,
            }),
          },
        ],
      };
    },
  );

  return server;
}
