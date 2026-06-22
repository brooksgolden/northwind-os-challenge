# NOTES

## What I built
Core: a **dashboard** + an **inquiry-triage workflow**, plus one AI bonus. Then, based on the dashboards in the Custom AO tracker, I extended the revenue section with a **gross-profit / margin layer**.

## What I prioritized and cut, and why
I optimized for the rubric: shipping speed and quality together — runs first try, sensible empty states, nothing broken, sound judgment.
- **Kept tight, polished core** over breadth.
- **One bonus, chosen deliberately — the AI "draft a reply."** I picked it over filtering/search and an inquiry detail page because it's the only bonus that shows *how I work with AI*, which the brief explicitly asks to see. (Lightweight search/filter/sort was nearly free, so triage has it anyway.)
- **Cut:** auth, a real database, tests, deployment, and a detail page. The brief says don't gold-plate, and each adds "doesn't-run-first-try" risk without proving anything new. Triage state persists to `localStorage`; the mock data stays read-only.
- **Deferred on purpose (data gaps), not faked:** a New-vs-Returning revenue split and a GP-by-rep leaderboard. Both are central to how we read our Customs sales numbers, but the mock sales rows carry no customer id or rep — so I flagged them instead of inventing data.

## Triage prioritization rule
Score 0–100 → **Hot ≥70 / Warm ≥45 / Cold**, a transparent weighted blend: **Volume 40%** (revenue proxy), **Channel 25%** (referrals/trade-show convert; cold inbound/instagram don't), **Recency 20%** (intent decays), **Status 15%**. Every card expands to show the four contributions, so an operator trusts it; marking a lead contacted lowers its status weight so it drops down the queue; a closed lead can never be hot.

## The gross-profit layer (how we extended it, and the logic)
Our Customs team manages to **Gross Profit, not revenue** (GP and GP% are the spine of their sheet; reps even have GP quotas), so I put GP on the dashboard. The source data has revenue only, so `lib/margin.ts` adds a **cost-per-lb per product** — single origin and decaf cost more, cold-brew blend less — which lands a **~45% blended gross margin**, the midpoint of the 40–60% range typical for specialty wholesale roasting. From that one assumption it derives: **GP$ and GP% KPIs, GP% by product, a monthly revenue-vs-target chart, and a current-month forecast/pace tracker** (mirroring their weekly forecast view). The COGS figures and the $160k/$185k targets are **illustrative assumptions, not source data** — stated plainly in the hover tooltips on each (i) — and are one edit away from real numbers. The whole layer sits behind pure selectors, which is exactly the pattern for wiring in real data later.

## How I'd extend this to production
Mostly swaps, because the seams are already there: drop real COGS and targets into `lib/margin.ts` (no UI change); replace the `localStorage` triage overlay with a small API + Postgres (already isolated behind one hook); flip the AI reply from the Claude-subscription provider to the Anthropic API (`DRAFT_PROVIDER=api`); and, once orders carry a customer id and owning rep, add the deferred New-vs-Returning split and GP-by-rep leaderboard. Then calibrate the triage weights against real win/loss data.

## How I built it — tools, and why
**Vite + React + TypeScript + Tailwind + Recharts.** The deciding factor was that it has to **run first try, every time**: Vite is the lowest-risk way to guarantee a single-command launch, and it matches the stack of the closest project in this ecosystem. I drove the whole build with **Claude Code** — research, scaffolding, components, verification — running work **in parallel** where steps were independent (e.g. installing dependencies in the background while writing the data layer; using typecheck plus a headless DOM pass to verify rendering and the persisted triage actions instead of clicking by hand). The AI "draft a reply" uses a **pluggable provider**: Claude via my subscription (CLI) now, the Anthropic API for production, and a deterministic template fallback so it never hard-fails for someone cloning it cold.
