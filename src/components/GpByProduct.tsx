import type { ProductGP } from '../lib/margin'
import { formatCurrency } from '../lib/format'

/** Horizontal GP% bars, scaled 0–100%. The "GP% by segment" lens. */
export function GpByProduct({ data }: { data: ProductGP[] }) {
  return (
    <div className="space-y-2.5">
      {data.map((p) => (
        <div key={p.name} className="grid grid-cols-[130px_1fr_auto] items-center gap-3 text-xs">
          <span className="truncate text-right text-ink-soft">{p.name}</span>
          <div className="h-5 overflow-hidden rounded-md bg-surface-muted">
            <div className="h-full rounded-md bg-bean" style={{ width: `${Math.round(p.gpPct)}%` }} />
          </div>
          <span className="tabular-nums text-ink">
            <strong>{Math.round(p.gpPct)}%</strong>
            <span className="text-ink-soft"> · {formatCurrency(p.gp, { compact: true })} GP</span>
          </span>
        </div>
      ))}
    </div>
  )
}
