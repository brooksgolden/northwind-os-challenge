import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { NamedTotal } from '../../lib/data'
import { formatCurrency } from '../../lib/format'

/** Horizontal, sorted bar chart for categorical comparison (regions, products). */
export function RankedBarChart({
  data,
  color = 'var(--color-bean)',
  height = 200,
}: {
  data: NamedTotal[]
  color?: string
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          barCategoryGap={10}
        >
          <XAxis type="number" domain={[0, max]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-surface-muted)' }}
            formatter={(v) => [formatCurrency(v as number), 'Revenue']}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={color} fillOpacity={1 - i * 0.13} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
