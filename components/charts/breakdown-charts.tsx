'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompact, formatNumber } from '@/lib/metric-utils'
import type { BreakdownMetric, ChartType } from '@/lib/types'
import {
  AXIS_TICK,
  ChartBox,
  ChartTooltip,
  seriesColor,
  shorten,
  useChartMotion,
} from './shared'

interface Props {
  metric: BreakdownMetric
  type: ChartType
  height: number
}

function sorted(metric: BreakdownMetric) {
  return [...metric.items].sort((a, b) => b.value - a.value)
}

export function BreakdownChart({ metric, type, height }: Props) {
  switch (type) {
    case 'donut':
    case 'pie':
      return <PieView metric={metric} height={height} donut={type === 'donut'} />
    case 'hbar':
      return <HorizontalBars metric={metric} height={height} />
    case 'bar':
      return <ColumnView metric={metric} height={height} />
    case 'radar':
      return <RadarView metric={metric} height={height} />
    case 'blocks':
      return <BlocksView metric={metric} height={height} />
    case 'stack':
      return <StackView metric={metric} height={height} />
    default:
      return <HorizontalBars metric={metric} height={height} />
  }
}

function Legend({ metric }: { metric: BreakdownMetric }) {
  const total = metric.items.reduce((sum, item) => sum + item.value, 0)
  return (
    <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
      {metric.items.map((item, index) => (
        <li key={item.name} className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="size-3.5 shrink-0 rounded-full"
            style={{
              background: seriesColor(index),
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.6), 1px 2px 4px rgba(0,0,0,0.2)',
            }}
          />
          <span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span>
          <span className="font-extrabold tabular-nums">%{Math.round((item.value / total) * 100)}</span>
        </li>
      ))}
    </ul>
  )
}

function PieView({ metric, height, donut }: { metric: BreakdownMetric; height: number; donut: boolean }) {
  const { animate, duration } = useChartMotion()
  const total = metric.items.reduce((sum, item) => sum + item.value, 0)
  return (
    <div className="flex items-center gap-4" style={{ height }}>
      <div className="relative aspect-square h-full shrink-0">
        <ChartBox height={height}>
          <PieChart>
            <Tooltip content={<ChartTooltip unit={metric.unit} />} />
            <Pie
              data={metric.items}
              dataKey="value"
              nameKey="name"
              innerRadius={donut ? '62%' : 0}
              outerRadius="96%"
              paddingAngle={donut ? 4 : 2}
              cornerRadius={donut ? 10 : 6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={animate}
              animationDuration={duration}
            >
              {metric.items.map((item, index) => (
                <Cell key={item.name} fill={seriesColor(index)} />
              ))}
            </Pie>
          </PieChart>
        </ChartBox>
        {donut && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-xs font-semibold text-fg-soft">Toplam</p>
              <p className="text-lg font-extrabold leading-tight tabular-nums">
                {formatCompact(total, metric.unit)}
              </p>
            </div>
          </div>
        )}
      </div>
      <Legend metric={metric} />
    </div>
  )
}

function HorizontalBars({ metric, height }: { metric: BreakdownMetric; height: number }) {
  const items = sorted(metric)
  const max = Math.max(...items.map((item) => item.value))
  return (
    <ul className="flex flex-col justify-around gap-2" style={{ minHeight: height }}>
      {items.map((item, index) => (
        <li key={item.name} className="grid gap-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-bold">{item.name}</span>
            <span className="font-extrabold tabular-nums">{formatNumber(item.value, metric.unit)}</span>
          </div>
          <div className="h-3.5 rounded-full p-[3px]" style={{ background: 'var(--chip-bg)', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.12)' }}>
            <div
              className="h-full rounded-full transition-[width] duration-1000 [transition-timing-function:var(--ease-soft)]"
              style={{
                width: `${Math.max(4, (item.value / max) * 100)}%`,
                background: seriesColor(index),
                boxShadow: 'inset 1px 2px 3px rgba(255,255,255,0.55), inset -1px -2px 3px rgba(0,0,0,0.16)',
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ColumnView({ metric, height }: { metric: BreakdownMetric; height: number }) {
  const { animate, duration } = useChartMotion()
  return (
    <ChartBox height={height}>
      <BarChart data={metric.items} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="2 8" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value: string) => shorten(value, 8)}
          interval={0}
          tickMargin={8}
        />
        <YAxis hide domain={[0, (max: number) => Math.ceil(max * 1.08)]} />
        <Tooltip content={<ChartTooltip unit={metric.unit} />} cursor={{ fill: 'var(--chip-bg)', radius: 12 }} />
        <Bar dataKey="value" radius={[12, 12, 12, 12]} maxBarSize={48} isAnimationActive={animate} animationDuration={duration}>
          {metric.items.map((item, index) => (
            <Cell key={item.name} fill={seriesColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ChartBox>
  )
}

function RadarView({ metric, height }: { metric: BreakdownMetric; height: number }) {
  const { animate, duration } = useChartMotion()
  return (
    <ChartBox height={height}>
      <RadarChart data={metric.items} outerRadius="68%">
        <PolarGrid stroke="var(--grid)" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ ...AXIS_TICK, fontSize: 11 }}
          tickFormatter={(value: string) => shorten(value, 11)}
        />
        <Tooltip content={<ChartTooltip unit={metric.unit} />} />
        <Radar
          dataKey="value"
          stroke="var(--c1)"
          strokeWidth={3}
          fill="var(--c1)"
          fillOpacity={0.32}
          isAnimationActive={animate}
          animationDuration={duration}
        />
      </RadarChart>
    </ChartBox>
  )
}

function BlocksView({ metric, height }: { metric: BreakdownMetric; height: number }) {
  const items = sorted(metric)
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const split = Math.ceil(items.length / 2)
  const rows = [items.slice(0, Math.max(1, split - 1)), items.slice(Math.max(1, split - 1))]
  const rowTotals = rows.map((row) => row.reduce((sum, item) => sum + item.value, 0))
  return (
    <div className="flex w-full flex-col gap-2" style={{ height }}>
      {rows.map((row, rowIndex) =>
        row.length === 0 ? null : (
          <div key={rowIndex} className="flex min-h-0 gap-2" style={{ flexGrow: rowTotals[rowIndex], flexBasis: 0 }}>
            {row.map((item) => {
              const index = items.indexOf(item)
              return (
                <div
                  key={item.name}
                  className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl p-2.5 transition-[flex-grow] duration-1000 [transition-timing-function:var(--ease-soft)]"
                  style={{
                    flexGrow: item.value,
                    flexBasis: 0,
                    background: `color-mix(in srgb, ${seriesColor(index)} 78%, transparent)`,
                    color: index === 0 ? 'var(--on-c1)' : 'var(--on-series)',
                    boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -4px 8px rgba(0,0,0,0.14)',
                  }}
                >
                  <span className="truncate text-xs font-extrabold sm:text-sm">{item.name}</span>
                  <span className="text-sm font-extrabold tabular-nums sm:text-base">
                    %{Math.round((item.value / total) * 100)}
                  </span>
                </div>
              )
            })}
          </div>
        ),
      )}
    </div>
  )
}

function StackView({ metric, height }: { metric: BreakdownMetric; height: number }) {
  const total = metric.items.reduce((sum, item) => sum + item.value, 0)
  return (
    <div className="flex w-full flex-col justify-center gap-5" style={{ minHeight: height }}>
      <div
        className="flex h-12 gap-1 overflow-hidden rounded-full p-1.5"
        style={{ background: 'var(--chip-bg)', boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.14)' }}
        role="presentation"
      >
        {metric.items.map((item, index) => (
          <div
            key={item.name}
            className="h-full rounded-full transition-[flex-grow] duration-1000 [transition-timing-function:var(--ease-soft)]"
            style={{
              flexGrow: item.value,
              flexBasis: 0,
              background: seriesColor(index),
              boxShadow: 'inset 2px 3px 4px rgba(255,255,255,0.55), inset -2px -3px 5px rgba(0,0,0,0.16)',
            }}
            title={`${item.name}: ${formatNumber(item.value, metric.unit)} (%${Math.round((item.value / total) * 100)})`}
          />
        ))}
      </div>
      <Legend metric={metric} />
    </div>
  )
}
