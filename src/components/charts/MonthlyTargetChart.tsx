import {
  Bar,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthPoint } from '../../lib/margin'
import { MONTHLY_REVENUE_TARGET } from '../../lib/margin'
import { formatCurrency } from '../../lib/format'

export function MonthlyTargetChart({ data }: { data: MonthPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 18, right: 16, left: 4, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--color-line)' }} />
          <YAxis
            tickFormatter={(v) => formatCurrency(v as number, { compact: true })}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-surface-muted)' }}
            formatter={(v) => [formatCurrency(v as number), 'Revenue']}
            contentStyle={{ fontSize: 12 }}
          />
          <ReferenceLine
            y={MONTHLY_REVENUE_TARGET}
            stroke="var(--color-hot)"
            strokeDasharray="5 4"
            label={{
              value: `Target ${formatCurrency(MONTHLY_REVENUE_TARGET, { compact: true })}`,
              position: 'insideTopRight',
              fill: 'var(--color-hot)',
              fontSize: 11,
            }}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={72} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.month} fill="var(--color-bean)" fillOpacity={d.partial ? 0.45 : 1} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
