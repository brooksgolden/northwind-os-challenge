# Northwind Coffee — Command Center

The first slice of an internal operating system for **Northwind Coffee**, a (fictional) specialty
wholesale roaster. It replaces the spreadsheets-and-inboxes status quo with two things an operator
actually uses every day:

1. **A dashboard** — revenue, volume, and pipeline at a glance, with the story up top.
2. **An inquiry-triage workflow** — inbound wholesale leads, scored and sorted by priority, with
   actions that stick and an AI-drafted reply for each one.

> Built for the [Northwind OS Challenge](./CHALLENGE.md). All data in `data/` is fictional and treated
> as read-only. See [NOTES.md](./NOTES.md) for priorities, the triage rule, and how this was built.

## Run it

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**. That's the whole setup — no env vars, no API keys, no backend.

## What's inside

- **Dashboard** — KPI strip (90-day revenue with trend, lbs shipped, new inquiries, active accounts),
  a weekly revenue trend, revenue by region and by product, an auto-generated insight line, and a
  "top inquiries to action" list that links straight into triage.
- **Triage** — every open inquiry scored **Hot / Warm / Cold** with a transparent, expandable
  breakdown ("why?"). Search, filter by region, and sort by priority / volume / recency. Per-inquiry
  actions: change status, **mark contacted**, and **assign an owner** — all persisted to
  `localStorage` (the mock data stays untouched).
- **AI "Draft a reply"** — one click drafts a tailored response to any inquiry. See below.

## The AI draft-reply (pluggable provider)

The "Draft a reply" button calls a tiny dev API (`/api/draft-reply`, Vite middleware so it still runs
from one command). The provider is a one-line switch via `DRAFT_PROVIDER`:

| `DRAFT_PROVIDER` | Behavior | When |
|---|---|---|
| `cli` *(default)* | Drafts via the local **Claude Code CLI** (your Claude subscription, no API cost) | Now / development |
| `api` | Drafts via the **Anthropic API** (`ANTHROPIC_API_KEY`) | Production swap |
| `template` | Deterministic, context-aware offline draft | No model available |

**Any provider degrades gracefully to the template on failure**, so the feature always returns a
usable draft — including for anyone who clones this without the Claude CLI installed. See
[`.env.example`](./.env.example).

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Recharts. No router, no state library — the app is
small enough not to need them.

## Project shape

```
data/                 # read-only mock "database" (sales, inquiries, accounts)
server/draftReply.ts  # provider logic for the AI reply (cli / api / template)
src/lib/              # data selectors, lead scoring, persistence hook, formatting
src/components/       # charts, cards, triage UI
src/pages/            # Dashboard, Triage
vite.config.ts        # React + Tailwind + the /api/draft-reply dev endpoint
```
