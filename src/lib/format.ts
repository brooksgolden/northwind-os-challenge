export function formatCurrency(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && Math.abs(n) >= 1000) {
    const k = n / 1000
    return '$' + (Math.abs(n) >= 100000 ? Math.round(k) : k.toFixed(1)) + 'k'
  }
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function formatLbs(n: number): string {
  return formatNumber(n) + ' lbs'
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** Whole days from aIso to bIso (positive if bIso is later). */
export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso + 'T00:00:00').getTime()
  const b = new Date(bIso + 'T00:00:00').getTime()
  return Math.round((b - a) / 86_400_000)
}

export function relativeDays(daysOld: number): string {
  if (daysOld <= 0) return 'today'
  if (daysOld === 1) return 'yesterday'
  return `${daysOld} days ago`
}
