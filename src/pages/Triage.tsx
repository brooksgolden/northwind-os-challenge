import { useMemo, useState } from 'react'
import { ANCHOR_DATE, REGIONS, inquiries } from '../lib/data'
import { formatDate } from '../lib/format'
import { TIER_ORDER, scoreInquiry } from '../lib/scoring'
import type { Tier } from '../lib/scoring'
import { useTriage } from '../lib/useTriage'
import type { EffectiveInquiry } from '../lib/useTriage'
import { Pill, SectionCard, EmptyState } from '../components/ui'
import { InquiryCard } from '../components/triage/InquiryCard'
import { DraftReplyModal } from '../components/triage/DraftReplyModal'

type SortKey = 'score' | 'volume' | 'recent'

const TIER_CHIP: Record<Tier, string> = {
  hot: 'border-hot/25 bg-hot/10 text-hot',
  warm: 'border-warm/25 bg-warm/10 text-warm',
  cold: 'border-cold/25 bg-cold/10 text-cold',
}

export default function Triage() {
  const { effective, hydrated, touchedCount, markContacted, assign, setStatus, resetAll } = useTriage(inquiries)

  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('score')
  const [showClosed, setShowClosed] = useState(false)
  const [drafting, setDrafting] = useState<EffectiveInquiry | null>(null)

  // Score every (effective) inquiry, then filter + sort.
  const scored = useMemo(
    () => effective.map((item) => ({ item, score: scoreInquiry(item) })),
    [effective],
  )

  const tierCounts = useMemo(() => {
    const c = { hot: 0, warm: 0, cold: 0 }
    for (const { item, score } of scored) if (item.status !== 'closed') c[score.tier]++
    return c
  }, [scored])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scored
      .filter(({ item }) => (showClosed ? true : item.status !== 'closed'))
      .filter(({ item }) => (region === 'all' ? true : item.region === region))
      .filter(({ item }) =>
        q ? `${item.cafe_name} ${item.contact_name} ${item.message}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => {
        if (sort === 'volume') return b.item.requested_volume_lbs_month - a.item.requested_volume_lbs_month
        if (sort === 'recent') return b.item.received_date.localeCompare(a.item.received_date)
        // score: tier first, then numeric score
        const t = TIER_ORDER[a.score.tier] - TIER_ORDER[b.score.tier]
        return t !== 0 ? t : b.score.score - a.score.score
      })
  }, [scored, query, region, sort, showClosed])

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Inquiry Triage</h1>
          <p className="mt-1 text-sm text-ink-soft">Work inbound wholesale leads, highest-priority first</p>
        </div>
        <div className="flex items-center gap-2">
          {touchedCount > 0 && (
            <button
              onClick={resetAll}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface-muted"
            >
              Reset {touchedCount} change{touchedCount === 1 ? '' : 's'}
            </button>
          )}
          <Pill>Data through {formatDate(ANCHOR_DATE)}</Pill>
        </div>
      </header>

      {/* Tier summary */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {(['hot', 'warm', 'cold'] as Tier[]).map((t) => (
          <div key={t} className={`rounded-xl border px-4 py-3 ${TIER_CHIP[t]}`}>
            <div className="text-2xl font-semibold tabular-nums">{tierCounts[t]}</div>
            <div className="text-xs font-medium capitalize">{t} leads</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <SectionCard className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cafe, contact, message…"
            className="min-w-48 flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-bean"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-bean"
          >
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-bean"
          >
            <option value="score">Sort: Priority</option>
            <option value="volume">Sort: Volume</option>
            <option value="recent">Sort: Most recent</option>
          </select>
          <label className="flex select-none items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm text-ink-soft">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            Show closed
          </label>
        </div>
      </SectionCard>

      {/* List */}
      {!hydrated ? (
        <p className="px-1 py-8 text-center text-sm text-ink-soft">Loading inquiries…</p>
      ) : visible.length === 0 ? (
        <EmptyState title="No inquiries match" hint="Try clearing the search or region filter." />
      ) : (
        <div className="space-y-3">
          {visible.map(({ item, score }) => (
            <InquiryCard
              key={item.id}
              item={item}
              score={score}
              onMarkContacted={markContacted}
              onAssign={assign}
              onSetStatus={setStatus}
              onDraft={setDrafting}
            />
          ))}
        </div>
      )}

      {drafting && (
        <DraftReplyModal inquiry={drafting} onClose={() => setDrafting(null)} onMarkContacted={markContacted} />
      )}
    </div>
  )
}
