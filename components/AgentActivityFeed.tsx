"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { AgentActivityStep } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

function StatusIcon({ status }: { status: AgentActivityStep["status"] }) {
  if (status === "complete")
    return <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />;
  if (status === "running")
    return <Loader2 className="h-4 w-4 animate-spin text-sky-600" />;
  if (status === "warning")
    return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <Circle className="h-3 w-3 text-slate-300" />;
}

export function AgentActivityFeed({ steps }: { steps: AgentActivityStep[] }) {
  const done = steps.filter((s) => s.status === "complete" || s.status === "warning").length;
  const pct = Math.round((done / Math.max(1, steps.length)) * 100);

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-800">Live agent activity</h2>
          <p className="text-xs text-slate-500">LangGraph-style multi-agent trace (simulated latency)</p>
        </div>
        <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800">
          {pct}% complete
        </Badge>
      </div>
      <ScrollArea className="h-[280px] pr-3">
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {steps.map((s, i) => (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm",
                  s.status === "running" && "border-sky-200 bg-sky-50/90",
                  s.status === "complete" && "border-emerald-200 bg-emerald-50/80",
                  s.status === "warning" && "border-amber-200 bg-amber-50/80",
                  s.status === "pending" && "border-slate-200 bg-slate-50/80",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <StatusIcon status={s.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800">{s.label}</span>
                      {s.agent ? (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-600">
                          {s.agent}
                        </span>
                      ) : null}
                    </div>
                    {s.detail ? (
                      <p className="mt-1 font-mono text-xs text-slate-500">{s.detail}</p>
                    ) : null}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </ScrollArea>
    </div>
  );
}
