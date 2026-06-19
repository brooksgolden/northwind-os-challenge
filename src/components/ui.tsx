import type { ReactNode } from 'react'
import { IconArrowDown, IconArrowUp } from './icons'

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'bean' | 'leaf' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface-muted text-ink-soft border-line',
    bean: 'bg-bean/10 text-bean border-bean/20',
    leaf: 'bg-leaf/10 text-leaf border-leaf/20',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-wide text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function KpiCard({
  label,
  value,
  sub,
  delta,
  accent,
}: {
  label: string
  value: string
  sub?: string
  delta?: number | null
  accent?: ReactNode
}) {
  const up = typeof delta === 'number' && delta >= 0
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
        {accent}
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink tabular-nums">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {typeof delta === 'number' && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${up ? 'text-leaf' : 'text-hot'}`}>
            {up ? <IconArrowUp width={12} height={12} /> : <IconArrowDown width={12} height={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-ink-soft">{sub}</span>}
      </div>
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-muted px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}
