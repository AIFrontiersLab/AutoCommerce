import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface SerpOrganicItem {
  title: string;
  link: string;
  snippet?: string;
}

export interface SerpOrganicFetchResult {
  items: SerpOrganicItem[];
  /** True when a non-empty API key was read from the server environment (after trim). */
  keyConfigured: boolean;
  /** SerpApi error message, HTTP failure, or JSON parse error — safe to show in the app UI. */
  fetchError: string | null;
  /** Key worked and no API error, but there were zero usable organic rows (rare for normal queries). */
  organicEmpty: boolean;
}

function stripInlineComment(value: string): string {
  const idx = value.search(/\s+#/);
  return (idx === -1 ? value : value.slice(0, idx)).trim();
}

/**
 * Fallback when `process.env` is empty (unsaved file at server start, or key split across lines).
 * Only runs on the server; never shipped to the client bundle for browser code paths.
 */
function readSerpApiKeyFromDotEnvLocal(): string | undefined {
  if (typeof window !== "undefined") return undefined;
  try {
    const p = join(process.cwd(), ".env.local");
    if (!existsSync(p)) return undefined;
    let text = readFileSync(p, "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const lines = text.split(/\r?\n/);

    const tryBlock = (pattern: RegExp): string | undefined => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? "";
        const m = line.match(pattern);
        if (!m) continue;
        let v = stripInlineComment(m[1]!.trim()).replace(/^["']|["']$/g, "");
        if (v) return v;
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          const n = (lines[j] ?? "").trim();
          if (!n || n.startsWith("#")) continue;
          if (/^[\w]+\s*=/.test(n)) break;
          v = stripInlineComment(n).replace(/^["']|["']$/g, "");
          if (v) return v;
        }
      }
      return undefined;
    };

    return tryBlock(/^SERPAPI_API_KEY\s*=\s*(.*)$/) ?? tryBlock(/^SERP_API_KEY\s*=\s*(.*)$/);
  } catch {
    return undefined;
  }
}

/**
 * Read SerpApi key: `process.env` first, then parse `.env.local` from disk (picks up saves without restart).
 */
export function getSerpApiKeyFromEnv(): string | undefined {
  const primary = process.env.SERPAPI_API_KEY?.trim();
  if (primary) return primary;
  const alias = process.env.SERP_API_KEY?.trim();
  if (alias) return alias;
  return readSerpApiKeyFromDotEnvLocal();
}

/**
 * Optional live web results via [SerpApi](https://serpapi.com) (Google organic).
 * Without a configured API key, `items` is empty and `keyConfigured` is false.
 */
export async function fetchOrganicSearchResults(
  query: string,
  max = 10,
): Promise<SerpOrganicFetchResult> {
  const apiKey = getSerpApiKeyFromEnv();
  if (!apiKey) {
    return { items: [], keyConfigured: false, fetchError: null, organicEmpty: false };
  }
  if (!query.trim()) {
    return { items: [], keyConfigured: true, fetchError: null, organicEmpty: false };
  }

  const q = query.trim().slice(0, 240);
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", q);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("num", String(Math.min(20, Math.max(5, max))));

  let res: Response;
  try {
    res = await fetch(url.toString(), { cache: "no-store" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error calling SerpApi";
    return { items: [], keyConfigured: true, fetchError: msg, organicEmpty: false };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return {
      items: [],
      keyConfigured: true,
      fetchError: `SerpApi response was not JSON (HTTP ${res.status}).`,
      organicEmpty: false,
    };
  }

  const body = data as { error?: string; organic_results?: { title?: string; link?: string; snippet?: string }[] };

  if (typeof body.error === "string" && body.error.length > 0) {
    return { items: [], keyConfigured: true, fetchError: body.error, organicEmpty: false };
  }

  if (!res.ok) {
    return {
      items: [],
      keyConfigured: true,
      fetchError: `SerpApi HTTP ${res.status}.`,
      organicEmpty: false,
    };
  }

  const rows = body.organic_results ?? [];
  const items = rows
    .filter((r) => r.title && r.link)
    .slice(0, max)
    .map((r) => ({
      title: r.title as string,
      link: r.link as string,
      snippet: r.snippet,
    }));

  return {
    items,
    keyConfigured: true,
    fetchError: null,
    organicEmpty: items.length === 0,
  };
}
