import type { Inquiry, InquiryStatus } from './types'
import { ANCHOR_DATE } from './data'
import { daysBetween } from './format'

export type Tier = 'hot' | 'warm' | 'cold'

export interface ScoreFactor {
  label: string
  detail: string
  weight: number
  normalized: number // 0..1
  points: number // contribution to the 0..100 score
}

export interface LeadScore {
  score: number
  tier: Tier
  factors: ScoreFactor[]
}

/**
 * Lead score = a transparent weighted blend of four signals an operator would
 * actually weigh by hand. See NOTES.md for the reasoning behind each weight.
 *
 * The whole point is explainability: every score breaks down into the same four
 * factors, so an operator can see *why* a lead is hot, not just that it is.
 */
const WEIGHTS = { volume: 0.4, channel: 0.25, recency: 0.2, status: 0.15 }

// Warmer acquisition channels convert better than cold ones.
const CHANNEL_QUALITY: Record<string, number> = {
  referral: 1.0,
  'trade show': 0.9,
  website: 0.6,
  instagram: 0.5,
  'cold inbound': 0.3,
}

// A "qualified" lead is already vetted; "new" needs first touch; "contacted" is
// mid-flight; "closed" is done.
const STATUS_QUALITY: Record<InquiryStatus, number> = {
  qualified: 1.0,
  new: 0.8,
  contacted: 0.4,
  closed: 0.0,
}

// Revenue potential. ~300 lbs/mo is the top of the observed range.
const volumeNorm = (lbs: number) => Math.max(0, Math.min(1, lbs / 300))

// Fresh leads convert; intent decays over ~30 days.
function recencyNorm(daysOld: number): number {
  if (daysOld <= 3) return 1.0
  if (daysOld <= 7) return 0.8
  if (daysOld <= 14) return 0.5
  if (daysOld <= 30) return 0.3
  return 0.1
}

export function scoreInquiry(inq: Inquiry, anchor: string = ANCHOR_DATE): LeadScore {
  const daysOld = Math.max(0, daysBetween(inq.received_date, anchor))
  const vN = volumeNorm(inq.requested_volume_lbs_month)
  const cN = CHANNEL_QUALITY[inq.channel] ?? 0.4
  const rN = recencyNorm(daysOld)
  const sN = STATUS_QUALITY[inq.status] ?? 0.5

  const factors: ScoreFactor[] = [
    { label: 'Volume', detail: `${inq.requested_volume_lbs_month} lbs/mo`, weight: WEIGHTS.volume, normalized: vN, points: vN * WEIGHTS.volume * 100 },
    { label: 'Channel', detail: inq.channel, weight: WEIGHTS.channel, normalized: cN, points: cN * WEIGHTS.channel * 100 },
    { label: 'Recency', detail: daysOld === 0 ? 'today' : `${daysOld}d old`, weight: WEIGHTS.recency, normalized: rN, points: rN * WEIGHTS.recency * 100 },
    { label: 'Status', detail: inq.status, weight: WEIGHTS.status, normalized: sN, points: sN * WEIGHTS.status * 100 },
  ]

  const score = Math.round(factors.reduce((a, f) => a + f.points, 0))
  // Closed leads are never "hot" no matter their raw potential.
  const tier: Tier = inq.status === 'closed' ? 'cold' : score >= 70 ? 'hot' : score >= 45 ? 'warm' : 'cold'

  return { score, tier, factors }
}

export const TIER_LABEL: Record<Tier, string> = { hot: 'Hot', warm: 'Warm', cold: 'Cold' }
export const TIER_ORDER: Record<Tier, number> = { hot: 0, warm: 1, cold: 2 }
