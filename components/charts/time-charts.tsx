'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/metric-utils'
import type { ChartType, TimeMetric } from '@/lib/types'
import { AXIS_TICK, ChartBox, ChartTooltip, useChartMotion, useSafeId } from './shared'

interface Props {
  metric: TimeMetric
  type: ChartType
  height: number
}

const padDomain: [(min: number) => number, (max: number) => number] = [
  (min) => Math.floor(min * 0.85),
  (max) => Math.ceil(max * 1.08),
]

export function TimeChart({ metric, type, height }: Props) {
  const { animate, duration } = useChartMotion()
  const gradientId = useSafeId()
  const data = metric.points
  const margin = { top: 12, right: 12, left: 12, bottom: 0 }
  const tooltip = <ChartTooltip unit={metric.unit} />
  const common = {
    isAnimationActive: animate,
    animationDuration: duration,
    animationEasing: 'ease-out' as const,
  }

  const xAxis = (
    <XAxis
      dataKey="label"
      tickLine={false}
      axisLine={false}
      tick={AXIS_TICK}
      interval="preserveStartEnd"
      minTickGap={28}
      tickMargin={8}
    />
  )
  const grid = <CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="2 8" />

  if (type === 'heat') return <HeatStrip metric={metric} height={height} />

  if (type === 'bar') {
    const lastIndex = data.length - 1
    return (
      <ChartBox height={height}>
        <BarChart data={data} margin={margin}>
          {grid}
          {xAxis}
          <YAxis hide domain={[0, (max: number) => Math.ceil(max * 1.08)]} />
          <Tooltip content={tooltip} cursor={{ fill: 'var(--chip-bg)', radius: 12 }} />
          <Bar dataKey="value" radius={[12, 12, 12, 12]} maxBarSize={44} {...common}>
            {data.map((point, index) => (
              <Cell
                key={point.label}
                fill={index === lastIndex ? 'var(--c1)' : 'var(--c2)'}
                fillOpacity={index === lastIndex ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartBox>
    )
  }

  if (type === 'area') {
    return (
      <ChartBox height={height}>
        <AreaChart data={data} margin={margin}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c1)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--c1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {grid}
          {xAxis}
          <YAxis hide domain={padDomain} />
          <Tooltip content={tooltip} cursor={{ stroke: 'var(--grid)', strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--c1)"
            strokeWidth={4}
            strokeLinecap="round"
            fill={`url(#${gradientId})`}
            activeDot={{ r: 7, strokeWidth: 3, stroke: 'var(--bg)' }}
            {...common}
          />
        </AreaChart>
      </ChartBox>
    )
  }

  const isSpark = type === 'spark'
  return (
    <ChartBox height={height}>
      <LineChart data={data} margin={margin}>
        {!isSpark && grid}
        {!isSpark && xAxis}
        <YAxis hide domain={padDomain} />
        <Tooltip content={tooltip} cursor={{ stroke: 'var(--grid)', strokeWidth: 2 }} />
        <Line
          type={type === 'step' ? 'stepAfter' : 'monotone'}
          dataKey="value"
          stroke="var(--c1)"
          strokeWidth={isSpark ? 5 : 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          dot={isSpark ? false : { r: 4, fill: 'var(--c1)', strokeWidth: 0 }}
          activeDot={{ r: 8, strokeWidth: 3, stroke: 'var(--bg)' }}
          {...common}
        />
      </LineChart>
    </ChartBox>
  )
}

function HeatStrip({ metric, height }: { metric: TimeMetric; height: number }) {
  const values = metric.points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return (
    <div className="flex w-full flex-col justify-center gap-3" style={{ height }}>
      <ul
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${metric.points.length}, minmax(0, 1fr))` }}
      >
        {metric.points.map((point) => {
          const intensity = (point.value - min) / range
          return (
            <li key={point.label} className="flex flex-col items-center gap-1.5">
              <span
                className="grid w-full place-items-center rounded-2xl text-xs font-extrabold transition-all duration-700 [transition-timing-function:var(--ease-pop)] sm:text-sm"
                style={{
                  height: Math.max(56, height * 0.5),
                  background: `color-mix(in srgb, var(--c1) ${Math.round(16 + intensity * 74)}%, transparent)`,
                  color: intensity > 0.5 ? 'var(--on-c1)' : 'var(--fg)',
                  boxShadow:
                    'inset 3px 3px 6px rgba(255,255,255,0.35), inset -3px -3px 7px rgba(0,0,0,0.12)',
                }}
              >
                {formatNumber(point.value, { ...metric.unit, prefix: '', suffix: '' })}
              </span>
              <span className="text-xs font-semibold text-fg-soft">{point.label}</span>
            </li>
          )
        })}
      </ul>
      <p className="flex items-center justify-between text-xs font-semibold text-fg-soft">
        <span>Düşük</span>
        <span
          aria-hidden="true"
          className="mx-3 h-2 flex-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--c1) 16%, transparent), var(--c1))' }}
        />
        <span>Yüksek</span>
      </p>
    </div>
  )
}
