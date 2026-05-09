"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  GitCompare,
  TicketPercent,
  MessagesSquare,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NeonFrontiersBackdrop } from "@/components/NeonFrontiersBackdrop";

const cards = [
  {
    title: "Search",
    body: "Autonomous SKU discovery across marketplaces with policy-aware filters.",
    icon: Search,
    accent: "from-cyan-400 via-sky-400 to-transparent",
  },
  {
    title: "Compare",
    body: "Spec matrices, all-in pricing, fulfillment SLAs, and value scoring.",
    icon: GitCompare,
    accent: "from-fuchsia-400 via-purple-400 to-transparent",
  },
  {
    title: "Coupon",
    body: "Stack-rank promo eligibility and synthetic cart checks (demo).",
    icon: TicketPercent,
    accent: "from-emerald-400 via-teal-300 to-transparent",
  },
  {
    title: "Negotiate",
    body: "Tone-calibrated outreach with acceptance priors and human edit loop.",
    icon: MessagesSquare,
    accent: "from-amber-400 via-orange-300 to-transparent",
  },
  {
    title: "Checkout",
    body: "Guard-railed automation — never completes purchase without explicit approval.",
    icon: ShoppingCart,
    accent: "from-sky-400 via-blue-400 to-transparent",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800">
      <NeonFrontiersBackdrop variant="light" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-sky-700 shadow-[0_8px_30px_-8px_rgba(14,165,233,0.35)] backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-sky-500" />
            Autonomous Commerce Infrastructure
          </div>
          <h1 className="mx-auto max-w-4xl bg-gradient-to-br from-slate-900 via-sky-800 to-fuchsia-700 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl">
            The Shopping App You&apos;ll Ever Need
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Autonomous Commerce Infrastructure for product discovery, price intelligence, coupon hunting, and AI
            negotiation.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/agent"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full border-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 px-8 text-base font-semibold text-black shadow-[0_0_40px_-6px_rgba(34,211,238,0.65)] hover:opacity-95",
              )}
            >
              Start Agent
            </Link>
            <Link
              href="/agent"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-sky-200 bg-white/80 px-8 text-base text-slate-700 shadow-[0_8px_28px_-10px_rgba(14,165,233,0.25)] backdrop-blur-md hover:border-sky-300 hover:bg-white",
              )}
            >
              View runtime
            </Link>
          </motion.div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.45 }}
            >
              <Card className="group h-full overflow-hidden border-white/60 bg-white/75 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl transition-shadow hover:border-sky-200/90 hover:shadow-[0_20px_50px_-12px_rgba(232,121,249,0.18)]">
                <div className={`h-1.5 w-full bg-gradient-to-r ${c.accent}`} />
                <CardContent className="p-5">
                  <c.icon className="mb-3 h-8 w-8 text-sky-600 transition-transform group-hover:scale-110" />
                  <h2 className="text-base font-semibold text-slate-800">{c.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        <footer className="mt-auto pt-20 text-center text-xs text-slate-500">
          Stack: Next.js 15 · TypeScript · Tailwind · shadcn/ui · Framer Motion · OpenAI Responses · Playwright ·
          Supabase-ready · Vercel
        </footer>
      </div>
    </div>
  );
}
