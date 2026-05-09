import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAutoCommerceMcpServer } from "@/lib/webmcp/server";

export const dynamic = "force-dynamic";

const MCP_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, mcp-session-id, Last-Event-ID, mcp-protocol-version, Accept",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
};

function mergeHeaders(base: Headers, extra: Record<string, string>): Headers {
  const out = new Headers(base);
  for (const [k, v] of Object.entries(extra)) {
    out.set(k, v);
  }
  return out;
}

function withMcpCors(res: Response): Response {
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: mergeHeaders(res.headers, MCP_CORS_HEADERS),
  });
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json", ...MCP_CORS_HEADERS },
  });
}

/**
 * Optional gate: set WEB_MCP_SECRET in the environment, then send Authorization: Bearer <secret>.
 * If WEB_MCP_SECRET is unset, the endpoint is open (development only).
 */
function checkWebMcpAuth(req: Request): Response | null {
  const secret = process.env.WEB_MCP_SECRET?.trim();
  if (!secret) return null;
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return unauthorized();
  return null;
}

async function handleMcpRequest(req: Request): Promise<Response> {
  const authError = checkWebMcpAuth(req);
  if (authError) return authError;

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = createAutoCommerceMcpServer();
  await server.connect(transport);
  const res = await transport.handleRequest(req);
  return withMcpCors(res);
}

export async function GET(req: Request) {
  return handleMcpRequest(req);
}

export async function POST(req: Request) {
  return handleMcpRequest(req);
}

export async function DELETE(req: Request) {
  return handleMcpRequest(req);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: MCP_CORS_HEADERS });
}
