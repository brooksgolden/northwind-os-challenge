import type { Tier } from '../lib/scoring'
import { TIER_LABEL } from '../lib/scoring'

const TONE: Record<Tier, string> = {
  hot: 'bg-hot/10 text-hot border-hot/25',
  warm: 'bg-warm/10 text-warm border-warm/25',
  cold: 'bg-cold/10 text-cold border-cold/25',
}

export function TierBadge({ tier, score }: { tier: Tier; score?: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONE[tier]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {TIER_LABEL[tier]}
      {typeof score === 'number' && <span className="font-normal opacity-70">· {score}</span>}
    </span>
  )
}
