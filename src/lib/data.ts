import salesJson from '../../data/sales.json'
import inquiriesJson from '../../data/inquiries.json'
import accountsJson from '../../data/accounts.json'
import type { Account, Inquiry, Sale } from './types'
import { daysBetween } from './format'

// The mock files in /data are the read-only "database".
export const sales = salesJson as unknown as Sale[]
export const inquiries = inquiriesJson as unknown as Inquiry[]
export const accounts = accountsJson as unknown as Account[]

export const REGIONS = ['Pacific Northwest', 'Bay Area', 'Mountain West', 'Southwest'] as const

/**
 * Anchor "today" to the latest date in the (fictional) dataset, so recency,
 * trends and "new this period" stay meaningful regardless of the real clock.
 */
export const ANCHOR_DATE: string = [
  ...sales.map((s) => s.date),
  ...inquiries.map((i) => i.received_date),
].sort().at(-1)!

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function totalRevenue(rows: Sale[] = sales): number {
  return sum(rows.map((r) => r.revenue))
}
export function totalUnits(rows: Sale[] = sales): number {
  return sum(rows.map((r) => r.units_lbs))
}

export interface NamedTotal {
  name: string
  revenue: number
  units: number
}

function rollup(rows: Sale[], key: (s: Sale) => string): NamedTotal[] {
  const m = new Map<string, NamedTotal>()
  for (const r of rows) {
    const k = key(r)
    const e = m.get(k) ?? { name: k, revenue: 0, units: 0 }
    e.revenue += r.revenue
    e.units += r.units_lbs
    m.set(k, e)
  }
  return [...m.values()].sort((a, b) => b.revenue - a.revenue)
}

export const revenueByRegion = (rows: Sale[] = sales) => rollup(rows, (r) => r.region)
export const revenueByProduct = (rows: Sale[] = sales) => rollup(rows, (r) => r.product)

export interface WeekPoint {
  weekStart: string
  revenue: number
  units: number
}

function mondayOf(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const offset = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

/** Monday-anchored weekly revenue for the trend line (~13 buckets over 90 days). */
export function revenueByWeek(rows: Sale[] = sales): WeekPoint[] {
  const m = new Map<string, WeekPoint>()
  for (const r of rows) {
    const wk = mondayOf(r.date)
    const e = m.get(wk) ?? { weekStart: wk, revenue: 0, units: 0 }
    e.revenue += r.revenue
    e.units += r.units_lbs
    m.set(wk, e)
  }
  return [...m.values()].sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

export interface PeriodDelta {
  current: number
  previous: number
  pct: number | null
}

/** Revenue in the last `days` vs the `days` before that, relative to ANCHOR_DATE. */
export function revenueDelta(days = 30, rows: Sale[] = sales): PeriodDelta {
  let current = 0
  let previous = 0
  for (const r of rows) {
    const age = daysBetween(r.date, ANCHOR_DATE)
    if (age < days) current += r.revenue
    else if (age < days * 2) previous += r.revenue
  }
  const pct = previous > 0 ? ((current - previous) / previous) * 100 : null
  return { current, previous, pct }
}

export function countBy<T>(arr: T[], key: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of arr) {
    const k = key(t)
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}
