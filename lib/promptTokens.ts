const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "are",
  "this",
  "that",
  "from",
  "have",
  "has",
  "was",
  "were",
  "under",
  "over",
  "find",
  "best",
  "cheap",
  "cheapest",
  "deal",
  "buy",
  "get",
  "new",
  "used",
  "ram",
  "ssd",
  "need",
  "want",
  "looking",
  "shop",
  "price",
  "shipping",
  "free",
  "today",
  "please",
  "negotiate",
  "any",
  "can",
  "how",
  "what",
  "when",
]);

export function promptTokens(prompt: string): string[] {
  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** 0–1 overlap between listing text and the mission prompt (keyword bag). */
export function titleRelevance(title: string, prompt: string): number {
  const pt = new Set(promptTokens(prompt));
  if (pt.size === 0) return 0.5;
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  let hit = 0;
  for (const w of words) {
    if (pt.has(w)) hit++;
  }
  return Math.min(1, hit / Math.min(pt.size, 10));
}
