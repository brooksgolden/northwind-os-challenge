import {
  ANCHOR_DATE,
  accounts,
  inquiries,
  revenueByProduct,
  revenueByRegion,
  revenueByWeek,
  revenueDelta,
  totalRevenue,
  totalUnits,
} from '../lib/data'
import {
  COGS_NOTE,
  TARGET_NOTE,
  avgPricePerLb,
  currentMonthPace,
  gpByProduct,
  grossMarginPct,
  grossProfit,
  monthlyRevenue,
} from '../lib/margin'
import { scoreInquiry } from '../lib/scoring'
import { formatCurrency, formatDate, formatLbs, formatNumber } from '../lib/format'
import { KpiCard, Pill, SectionCard } from '../components/ui'
import { InfoTip } from '../components/InfoTip'
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart'
import { RankedBarChart } from '../components/charts/RankedBarChart'
import { MonthlyTargetChart } from '../components/charts/MonthlyTargetChart'
import { GpByProduct } from '../components/GpByProduct'
import { ForecastTracker } from '../components/ForecastTracker'
import { TierBadge } from '../components/TierBadge'
import { IconChevron, IconFlame, IconInbox } from '../components/icons'

export default function Dashboard({ goToTriage }: { goToTriage: () => void }) {
  const revenue = totalRevenue()
  const units = totalUnits()
  const delta = revenueDelta(30)
  const byRegion = revenueByRegion()
  const byProduct = revenueByProduct()
  const weekly = revenueByWeek()

  // Profitability layer (assumptions — see tooltips / margin.ts).
  const gp = grossProfit()
  const gpPct = grossMarginPct()
  const avgLb = avgPricePerLb()
  const monthly = monthlyRevenue()
  const gpProd = gpByProduct()
  const pace = currentMonthPace()

  const newInquiries = inquiries.filter((i) => i.status === 'new')
  const openInquiries = inquiries.filter((i) => i.status !== 'closed')
  const hotCount = openInquiries.filter((i) => scoreInquiry(i).tier === 'hot').length
  const activeAccounts = accounts.filter((a) => a.status === 'active')
  const pausedAccounts = accounts.filter((a) => a.status === 'paused')

  const topRegion = byRegion[0]
  const topToAction = [...openInquiries]
    .map((i) => ({ inq: i, s: scoreInquiry(i) }))
    .sort((a, b) => b.s.score - a.s.score)
    .slice(0, 5)

  const trendWord = delta.pct == null ? 'steady' : delta.pct >= 0 ? 'up' : 'down'

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Command Center</h1>
          <p className="mt-1 text-sm text-ink-soft">Northwind Coffee · wholesale operations at a glance</p>
        </div>
        <Pill>Data through {formatDate(ANCHOR_DATE)}</Pill>
      </header>

      {/* Auto-generated insight line — the "story" up top */}
      <div className="card mb-6 flex items-start gap-3 border-l-4 border-l-bean p-4">
        <IconFlame className="mt-0.5 shrink-0 text-bean" />
        <p className="text-sm text-ink">
          <strong>{topRegion?.name}</strong> leads revenue at {formatCurrency(topRegion?.revenue ?? 0)} over the last 90 days.
          Revenue is <strong>{trendWord}{delta.pct != null ? ` ${Math.abs(delta.pct).toFixed(0)}%` : ''}</strong> in the
          last 30 days vs the prior 30. <strong>{newInquiries.length}</strong> new inquiries are waiting
          {hotCount > 0 ? <>, <strong>{hotCount}</strong> of them hot.</> : '.'}
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Revenue (90d)" value={formatCurrency(revenue)} delta={delta.pct} sub="vs prior 30d" />
        <KpiCard
          label="Gross profit (90d)"
          value={formatCurrency(gp)}
          sub={
            <>
              {gpPct.toFixed(1)}% GP margin <InfoTip text={COGS_NOTE} label="How gross profit is calculated" />
            </>
          }
        />
        <KpiCard label="Avg price" value={`$${avgLb.toFixed(2)}`} sub="per lb realized" />
        <KpiCard label="Coffee shipped" value={formatLbs(units)} sub="last 90 days" />
        <KpiCard
          label="New inquiries"
          value={formatNumber(newInquiries.length)}
          sub={`${hotCount} hot · ${openInquiries.length} open`}
          accent={<IconInbox width={18} height={18} className="text-ink-soft" />}
        />
        <KpiCard
          label="Active accounts"
          value={formatNumber(activeAccounts.length)}
          sub={pausedAccounts.length ? `${pausedAccounts.length} paused` : 'all active'}
        />
      </div>

      {/* Monthly revenue vs target — full-width row */}
      <div className="mb-6">
        <SectionCard
          title="Monthly revenue vs target"
          action={<InfoTip text={TARGET_NOTE} label="About the target" align="right" />}
        >
          {monthly.length ? (
            <>
              <MonthlyTargetChart data={monthly} />
              <p className="mt-2 text-[11px] text-ink-soft">
                {monthly[0].label} and {monthly[monthly.length - 1].label} are partial months (start and end of the data window).
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">No sales yet.</p>
          )}
        </SectionCard>
      </div>

      {/* Weekly trend */}
      <div className="mb-6">
        <SectionCard title="Weekly revenue" subtitle="Wholesale revenue by week, last ~13 weeks">
          {weekly.length ? <RevenueTrendChart data={weekly} /> : <p className="text-sm text-ink-soft">No sales yet.</p>}
        </SectionCard>
      </div>

      {/* Region + product */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue by region" subtitle="Where the money comes from">
          <RankedBarChart data={byRegion} color="var(--color-bean)" />
        </SectionCard>
        <SectionCard title="Revenue by product" subtitle="Top performing roasts">
          <RankedBarChart data={byProduct} color="var(--color-crema)" />
        </SectionCard>
      </div>

      {/* GP% by product + forecast tracker */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Gross profit % by product" action={<InfoTip text={COGS_NOTE} label="How GP% is calculated" align="right" />}>
          <GpByProduct data={gpProd} />
        </SectionCard>
        <SectionCard
          title={`${pace.monthLabel} forecast tracker`}
          action={<InfoTip text={TARGET_NOTE} label="About the forecast" align="right" />}
        >
          <ForecastTracker pace={pace} />
        </SectionCard>
      </div>

      {/* Top inquiries to action — ties dashboard to the triage workflow */}
      <SectionCard
        title="Top inquiries to action"
        subtitle="Highest-scoring open leads right now"
        action={
          <button
            onClick={goToTriage}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-bean transition hover:bg-surface-muted"
          >
            Open triage <IconChevron width={14} height={14} />
          </button>
        }
      >
        <ul className="divide-y divide-line">
          {topToAction.map(({ inq, s }) => (
            <li key={inq.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{inq.cafe_name}</p>
                <p className="truncate text-xs text-ink-soft">
                  {inq.region} · {inq.requested_volume_lbs_month} lbs/mo · {inq.channel}
                </p>
              </div>
              <TierBadge tier={s.tier} score={s.score} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
