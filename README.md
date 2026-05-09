# Autonomous Commerce Copilot

**Autonomous Commerce Infrastructure** — a Next.js demo for product discovery, price intelligence, coupon reasoning, and negotiation copy, with a **LangGraph-style** multi-agent trace in the UI. Live Google organic results merge with a seeded mock catalog when [SerpApi](https://serpapi.com) is configured. The app is **guard-railed**: it never completes a purchase and does not promise checkout or legal outcomes.

---

## What you get

| Surface | Description |
|--------|-------------|
| **Landing** (`/`) | Product story: Search, Compare, Coupon, Negotiate, Checkout (conceptual pillars). |
| **Agent runtime** (`/agent`) | Mission prompt, live agent activity, comparison grid, copilot summary, trust and scam signals. |
| **REST APIs** | Server-side copilot run and optional OpenAI polish. |
| **WebMCP** (`/api/mcp`) | [Model Context Protocol](https://modelcontextprotocol.io) over **Streamable HTTP** so remote MCP clients can call the same capabilities without exposing API keys in the browser. |

---

## Features

- **Search** — SKU-style discovery over a demo catalog plus optional SerpApi organic hits mapped into normalized listings.
- **Compare** — Spec match, shipping, value, and overall scoring with enriched product rows.
- **Coupon** — Promo stack ranking and synthetic discount checks (demo heuristics).
- **Negotiate** — Tone-aware negotiation drafts with optional OpenAI Responses polish (`OPENAI_API_KEY`).
- **Trust & safety** — Seller trust narratives, price confidence, fake-discount warnings, and explicit human-approval messaging before any real checkout story.

---

## Architecture

- **Framework:** [Next.js 15](https://nextjs.org) (App Router), React 19, TypeScript, Tailwind CSS 4.
- **Agents** (orchestrated in `lib/copilotState.ts`): Memory → Research → Comparison → Trust → Coupon → Price intelligence → Negotiation, then final recommendation assembly.
- **Data:** `lib/mockProducts.ts` seeds listings; `lib/serpWebSearch.ts` + `lib/webResultsToProducts.ts` augment with web results when a Serp key is present.
- **Persistence (optional):** Supabase-backed memory in `lib/agents/memoryAgent.ts` when `NEXT_PUBLIC_SUPABASE_*` is set.

---

## WebMCP (`/api/mcp`)

Stateless [Streamable HTTP](https://spec.modelcontextprotocol.io/) endpoint using `@modelcontextprotocol/sdk` (`WebStandardStreamableHTTPServerTransport`). Tool definitions live in `lib/webmcp/server.ts`.

| Tool | Purpose |
|------|---------|
| `copilot_run` | Full pipeline → `CopilotRunState` JSON (same as `POST /api/copilot/run`). |
| `polish_prose` | OpenAI Responses copy polish (same behavior as `POST /api/copilot/responses`). |
| `web_search_organic` | SerpApi organic results (server-side key only). |
| `catalog_list_seed` | Slice of the seeded mock catalog. |

**Auth:** Set `WEB_MCP_SECRET` and send `Authorization: Bearer <secret>`. If unset, the endpoint is open — use only for local development.

**CORS:** Preflight and response headers are set for MCP clients that run in the browser.

---

## API routes

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/copilot/run` | Run `buildCopilotState(prompt)`; returns `{ ok, state }`. |
| `POST` | `/api/copilot/responses` | Optional OpenAI polish for negotiation / summary copy. |
| `GET` / `POST` / `DELETE` | `/api/mcp` | MCP Streamable HTTP session (stateless per request). |
| `OPTIONS` | `/api/mcp` | CORS preflight. |

---

## Getting started

**Requirements:** Node.js 18+

```bash
npm install
cp .env.example .env.local
# Edit .env.local — at minimum optional keys below
npm run dev
```

Development serves **HTTPS** on port **443** (self-signed certificate via `next dev --experimental-https`), bound to **all interfaces** (`0.0.0.0`) so you can open it from another device on your network, for example [https://10.0.0.151:443](https://10.0.0.151:443) (replace with your machine’s LAN IP).

On the same machine: [https://localhost:443](https://localhost:443) and [https://localhost:443/agent](https://localhost:443/agent).

Your browser will warn about the self-signed cert — use “Advanced” → proceed (or install a local CA via [mkcert](https://github.com/FiloSottile/mkcert) and pass `--experimental-https-key` / `--experimental-https-cert` to `next dev` if you prefer trusted TLS).

On macOS and Linux, binding to port **443** usually requires elevated privileges (for example `sudo npm run dev`). `npm start` (production) still speaks **plain HTTP** on 443; terminate **HTTPS** in front (nginx, Caddy, etc.) or use a platform that provides TLS for you.

**Production build**

```bash
npm run build
npm start
```

**Lint & E2E**

```bash
npm run lint
npm run test:e2e
```

---

## Environment variables

Copy `.env.example` to `.env.local`. All keys are optional unless you want that capability.

| Variable | Used for |
|----------|-----------|
| `SERPAPI_API_KEY` (or `SERP_API_KEY`) | Live Google organic results in research. |
| `OPENAI_API_KEY` | Responses API polish in UI and MCP `polish_prose`. |
| `OPENAI_RESPONSES_MODEL` | Override default model (e.g. `gpt-4o-mini`). |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | User memory persistence. |
| `WEB_MCP_SECRET` | Bearer protection for `/api/mcp`. |

Restart `next dev` after changing env files if values are not picked up.

---

## Project layout (high level)

```
app/
  page.tsx              # Landing
  agent/page.tsx        # Copilot dashboard
  api/copilot/run/      # Agent pipeline
  api/copilot/responses/# OpenAI polish
  api/mcp/              # WebMCP Streamable HTTP
components/             # UI (e.g. AgentDashboard)
lib/
  agents/               # Memory, research, comparison, trust, coupon, price, negotiation
  copilotState.ts       # Pipeline orchestration
  webmcp/server.ts      # MCP tool registration
  mockProducts.ts       # Seeded catalog
  serpWebSearch.ts      # SerpApi client
```

---

## Disclaimer

This repository is a **demonstration**. Marketplace data is mocked or derived from public search APIs; negotiation text is illustrative. **Do not** treat outputs as financial, legal, or purchasing advice. No autonomous checkout is performed.

---

## License

Private project (`"private": true` in `package.json`). Adjust licensing if you open-source the repo.
