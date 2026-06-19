import { useState } from 'react'
import type { EffectiveInquiry } from '../../lib/useTriage'
import { REPS } from '../../lib/useTriage'
import type { InquiryStatus } from '../../lib/types'
import type { LeadScore } from '../../lib/scoring'
import { TierBadge } from '../TierBadge'
import { ScoreBreakdown } from '../ScoreBreakdown'
import { IconCheck, IconSparkles, IconUser } from '../icons'
import { daysBetween, formatDate, relativeDays } from '../../lib/format'
import { ANCHOR_DATE } from '../../lib/data'

const STATUSES: InquiryStatus[] = ['new', 'contacted', 'qualified', 'closed']

const STATUS_TONE: Record<InquiryStatus, string> = {
  new: 'text-bean',
  contacted: 'text-cold',
  qualified: 'text-leaf',
  closed: 'text-ink-soft',
}

export function InquiryCard({
  item,
  score,
  onMarkContacted,
  onAssign,
  onSetStatus,
  onDraft,
}: {
  item: EffectiveInquiry
  score: LeadScore
  onMarkContacted: (id: string) => void
  onAssign: (id: string, owner: string) => void
  onSetStatus: (id: string, status: InquiryStatus) => void
  onDraft: (item: EffectiveInquiry) => void
}) {
  const [showWhy, setShowWhy] = useState(false)
  const daysOld = Math.max(0, daysBetween(item.received_date, ANCHOR_DATE))
  const isContacted = item.status === 'contacted'
  const isClosed = item.status === 'closed'

  return (
    <div className={`card p-4 transition ${isClosed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-ink">{item.cafe_name}</h3>
            {item.touched && (
              <span className="rounded-full bg-leaf/10 px-1.5 py-0.5 text-[10px] font-medium text-leaf">edited</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-soft">
            {item.contact_name} · {item.region} · {item.requested_volume_lbs_month} lbs/mo · {item.channel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <TierBadge tier={score.tier} score={score.score} />
          <button onClick={() => setShowWhy((v) => !v)} className="text-[11px] text-ink-soft underline-offset-2 hover:underline">
            {showWhy ? 'hide' : 'why?'}
          </button>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-ink">{item.message}</p>

      {showWhy && (
        <div className="mt-3 rounded-lg border border-line bg-surface-muted p-3">
          <ScoreBreakdown score={score} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {/* Status */}
          <select
            value={item.status}
            onChange={(e) => onSetStatus(item.id, e.target.value as InquiryStatus)}
            className={`rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium capitalize outline-none focus:border-bean ${STATUS_TONE[item.status]}`}
            aria-label="Status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="text-ink">
                {s}
              </option>
            ))}
          </select>

          {/* Assignee */}
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface pl-2 text-xs text-ink-soft">
            <IconUser width={13} height={13} />
            <select
              value={item.assignee}
              onChange={(e) => onAssign(item.id, e.target.value)}
              className="bg-transparent py-1 pr-1 text-xs text-ink outline-none"
              aria-label="Assignee"
            >
              {REPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </span>

          <span className="text-[11px] text-ink-soft" title={formatDate(item.received_date)}>
            {relativeDays(daysOld)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && (
            <button
              onClick={() => onMarkContacted(item.id)}
              disabled={isContacted}
              className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-muted disabled:cursor-default disabled:opacity-50"
            >
              {isContacted ? <IconCheck width={13} height={13} className="text-leaf" /> : null}
              {isContacted ? 'Contacted' : 'Mark contacted'}
            </button>
          )}
          <button
            onClick={() => onDraft(item)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-bean px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-bean-deep"
          >
            <IconSparkles width={13} height={13} />
            Draft reply
          </button>
        </div>
      </div>
    </div>
  )
}
