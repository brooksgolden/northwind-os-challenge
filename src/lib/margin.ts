import { sales, ANCHOR_DATE } from './data'
import type { Sale } from './types'

/**
 * Profitability layer.
 *
 * IMPORTANT: the Northwind source data (data/sales.json) contains revenue only —
 * no cost of goods. The cost figures below were researched externally and added
 * specifically so the dashboard can show profitability. They are assumptions, not
 * source data. Swap in real COGS to make these live. See COGS_NOTE / TARGET_NOTE.
 *
 * Cost per lb is set per product so gross margin varies realistically (single
 * origin and decaf cost more; cold-brew blend less), landing a ~45% blend — in
 * line with the 40–60% typical for specialty wholesale roasting.
 */
export const COST_PER_LB: Record<string, number> = {
  'Seasonal Roast': 8.76,
  'Ethiopia Single Origin': 10.06,
  'Swiss Water Decaf': 9.58,
  'House Espresso': 7.66,
  'Cold Brew Blend': 7.78,
}

const FALLBACK_COGS_RATIO = 0.55 // unknown product → assume 55% COGS

const rowCost = (s: Sale): number => {
  const c = COST_PER_LB[s.product]
  return c != null ? c * s.units_lbs : s.revenue * FALLBACK_COGS_RATIO
}

const sumRev = (rows: Sale[]) => rows.reduce((a, s) => a + s.revenue, 0)

export function grossProfit(rows: Sale[] = sales): number {
  return rows.reduce((a, s) => a + (s.revenue - rowCost(s)), 0)
}

export function grossMarginPct(rows: Sale[] = sales): number {
  const rev = sumRev(rows)
  return rev ? (grossProfit(rows) / rev) * 100 : 0
}

export function avgPricePerLb(rows: Sale[] = sales): number {
  const u = rows.reduce((a, s) => a + s.units_lbs, 0)
  return u ? sumRev(rows) / u : 0
}

export interface ProductGP {
  name: string
  revenue: number
  gp: number
  gpPct: number
}

export function gpByProduct(rows: Sale[] = sales): ProductGP[] {
  const m = new Map<string, { revenue: number; gp: number }>()
  for (const s of rows) {
    const e = m.get(s.product) ?? { revenue: 0, gp: 0 }
    e.revenue += s.revenue
    e.gp += s.revenue - rowCost(s)
    m.set(s.product, e)
  }
  return [...m.entries()]
    .map(([name, v]) => ({ name, revenue: v.revenue, gp: v.gp, gpPct: v.revenue ? (v.gp / v.revenue) * 100 : 0 }))
    .sort((a, b) => b.gpPct - a.gpPct)
}

export interface MonthPoint {
  month: string
  label: string
  revenue: number
  gp: number
  partial: boolean
}

export function monthlyRevenue(rows: Sale[] = sales): MonthPoint[] {
  const m = new Map<string, { revenue: number; gp: number }>()
  for (const s of rows) {
    const k = s.date.slice(0, 7)
    const e = m.get(k) ?? { revenue: 0, gp: 0 }
    e.revenue += s.revenue
    e.gp += s.revenue - rowCost(s)
    m.set(k, e)
  }
  const keys = [...m.keys()].sort()
  return keys.map((k, i) => ({
    month: k,
    label: new Date(k + '-01T00:00:00').toLocaleDateString('en-US', { month: 'short' }),
    revenue: m.get(k)!.revenue,
    gp: m.get(k)!.gp,
    // contiguous ~90-day window: first & last months don't cover the full month
    partial: i === 0 || i === keys.length - 1,
  }))
}

// Illustrative goals — NOT from the source data.
export const MONTHLY_REVENUE_TARGET = 160_000
export const MONTHLY_REVENUE_STRETCH = 185_000

export interface Pace {
  monthLabel: string
  revenue: number
  gp: number
  gpForecast: number
  gpStretch: number
  pctOfForecast: number
  pctMonthElapsed: number
  onPace: boolean
}

export function currentMonthPace(rows: Sale[] = sales): Pace {
  const k = ANCHOR_DATE.slice(0, 7)
  const monthRows = rows.filter((s) => s.date.slice(0, 7) === k)
  const blended = grossMarginPct(rows) / 100
  const anchor = new Date(ANCHOR_DATE + 'T00:00:00')
  const day = anchor.getDate()
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
  const gp = grossProfit(monthRows)
  const gpForecast = Math.round((MONTHLY_REVENUE_TARGET * blended) / 1000) * 1000
  const gpStretch = Math.round((MONTHLY_REVENUE_STRETCH * blended) / 1000) * 1000
  const pctOfForecast = gpForecast ? (gp / gpForecast) * 100 : 0
  const pctMonthElapsed = (day / daysInMonth) * 100
  return {
    monthLabel: new Date(k + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long' }),
    revenue: sumRev(monthRows),
    gp,
    gpForecast,
    gpStretch,
    pctOfForecast,
    pctMonthElapsed,
    onPace: pctOfForecast >= pctMonthElapsed - 5,
  }
}

export const COGS_NOTE =
  'Gross profit assumes ~45% blended gross margin (about 55% COGS), with cost per pound varying by product — in line with the 40–60% typical for specialty wholesale roasting. These cost figures are NOT from the Northwind source data; they were researched and added specifically to put profitability on the dashboard. Swap in real COGS to make them live.'

export const TARGET_NOTE =
  'The $160k monthly revenue target (and $185k stretch) is an illustrative goal, NOT from the Northwind source data. Replace it with the team’s actual targets.'
