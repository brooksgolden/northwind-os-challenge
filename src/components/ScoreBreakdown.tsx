import type { LeadScore } from '../lib/scoring'

/** Transparent view of how a lead score was built: one row per factor. */
export function ScoreBreakdown({ score }: { score: LeadScore }) {
  return (
    <div className="space-y-2">
      {score.factors.map((f) => (
        <div key={f.label} className="grid grid-cols-[64px_1fr_auto] items-center gap-2 text-xs">
          <span className="font-medium text-ink">{f.label}</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-bean"
                style={{ width: `${Math.round(f.normalized * 100)}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-ink-soft">{f.detail}</span>
          </div>
          <span className="tabular-nums text-ink-soft">
            +{Math.round(f.points)}
            <span className="opacity-50"> /{Math.round(f.weight * 100)}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
