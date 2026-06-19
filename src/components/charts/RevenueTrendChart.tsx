import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WeekPoint } from '../../lib/data'
import { formatCurrency, formatShortDate } from '../../lib/format'

export function RevenueTrendChart({ data }: { data: WeekPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-bean)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-bean)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatShortDate}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-line)' }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v as number, { compact: true })}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            formatter={(v) => [formatCurrency(v as number), 'Revenue']}
            labelFormatter={(l) => `Week of ${formatShortDate(l as string)}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-bean)"
            strokeWidth={2.5}
            fill="url(#revFill)"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
