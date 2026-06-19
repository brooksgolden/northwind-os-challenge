# NOTES

## What I prioritized, and what I cut

I optimized for the rubric: **shipping speed and quality together** — does it run first try, sensible
empty states, nothing broken, good judgment.

**Shipped (and polished):** the two core pieces, plus one bonus.
- Dashboard that tells a story (insight line + KPIs with a real trend delta, not just numbers).
- A triage workflow where the *prioritization is the product*: a transparent, explainable score, not
  a flat list.
- One bonus, done well: an AI "draft a reply" that actually calls a model. I picked this bonus over
  filtering/detail pages because it's the only one that demonstrates *how I work with AI*, which the
  brief explicitly asks to see. (I added lightweight search/filter/sort anyway — it was nearly free
  and a triage list is unusable without it.)

**Deliberately cut:** auth, a real backend/DB, tests, an inquiry detail page, and deployment. The
brief says not to gold-plate, and each of those adds surface area (and "doesn't run first try" risk)
without proving anything new. State persists to `localStorage`; the mock data stays read-only.

## The triage prioritization rule

A lead's score (0–100 → **Hot ≥70 / Warm ≥45 / Cold**) is a weighted blend of the four signals an
operator would actually weigh by hand:

| Signal | Weight | Why |
|---|---|---|
| **Volume** (lbs/mo) | 40% | Direct proxy for revenue. The single biggest reason to call one lead before another. |
| **Channel** | 25% | Intent varies a lot by source: referral/trade-show convert; cold inbound/instagram are colder. |
| **Recency** | 20% | Lead intent decays. A fresh request beats a 3-week-old one at the same size. |
| **Status** | 15% | `qualified` is vetted, `new` needs first touch, `contacted` is mid-flight, `closed` is done. |

Two deliberate choices: it's **transparent** (every card expands to show the four contributions, so an
operator trusts it instead of obeying a black box), and it's **live** — marking a lead `contacted`
lowers its status weight, so it naturally falls down the queue once it's handled. `closed` leads can
never be Hot. "Today" is anchored to the latest date in the dataset so recency stays meaningful.

## How I'd extend this to production

- **Real persistence + multi-user:** swap the `localStorage` overlay for a small API + Postgres; the
  data layer is already isolated behind selectors, so this is a contained change.
- **Calibrate the score with outcomes:** the weights are sensible defaults. With real win/loss data
  I'd fit them (logistic regression) and A/B the thresholds instead of hard-coding 70/45.
- **AI reply → API provider:** flip `DRAFT_PROVIDER=api` (already wired) so it doesn't depend on a
  local CLI; add streaming, a per-rep tone/voice profile, and log edits to improve the prompt.
- **Hardening:** loading/error/empty states for live data, optimistic updates, e2e tests on the triage
  actions, and auth/roles.

## How I built it

- **Stack:** Vite + React + TS + Tailwind + Recharts — chosen because the closest sibling project in
  this ecosystem (a "Northwind Coffee" Claude Code workshop) used exactly this, and Vite is the
  lowest-risk way to guarantee a one-command, first-try run.
- **AI, in two ways.** (1) *Building it:* I drove the whole build with Claude Code — research, scaffold,
  components, and verification — working in parallel where steps were independent (dependency install
  ran in the background while I wrote the data layer and scoring; typecheck + a headless DOM pass
  verified rendering and the persisted actions without me clicking by hand). (2) *In the product:* the
  draft-reply feature calls Claude through my subscription via the Claude Code CLI today, with a
  one-line switch to the Anthropic API for production and a template fallback so it never hard-fails.
- **Judgment up front:** before writing code I profiled the data and researched what a strong
  submission looks like, so the dashboard answers real questions and the triage rule is defensible
  rather than arbitrary.
