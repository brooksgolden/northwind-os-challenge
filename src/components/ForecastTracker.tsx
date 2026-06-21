import type { Pace } from '../lib/margin'
import { formatCurrency } from '../lib/format'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

/** Current-month GP pacing, mirroring the team's weekly forecast tracker. */
export function ForecastTracker({ pace }: { pace: Pace }) {
  const pct = Math.round(pace.pctOfForecast)
  return (
    <div className="space-y-1.5">
      <Row label="GP forecast" value={formatCurrency(pace.gpForecast)} />
      <Row label="Stretch" value={formatCurrency(pace.gpStretch)} />
      <Row label="GP so far (MTD)" value={formatCurrency(pace.gp)} />
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full ${pace.onPace ? 'bg-leaf' : 'bg-warm'}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-ink-soft">
        <span>{pct}% of forecast</span>
        <span>
          {Math.round(pace.pctMonthElapsed)}% of month · {pace.onPace ? 'on pace' : 'behind'}
        </span>
      </div>
    </div>
  )
}
