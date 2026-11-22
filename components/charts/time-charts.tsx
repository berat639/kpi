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
import { formatCompact, formatNumber } from '@/lib/metric-utils'
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
  const count = metric.points.length
  const gap = count > 8 ? 4 : 6
  const plainUnit = { ...metric.unit, prefix: '', suffix: '' }
  const texts = metric.points.map((point) => formatCompact(point.value, plainUnit))
  const longest = Math.max(...texts.map((text) => text.length))
  // Çok sütunda sayı dikey yazılır; az sütunda yatay yazılır ve sütun genişliğine göre küçülür.
  const vertical = count > 8
  const cell = `((100cqw - ${(count - 1) * gap}px) / ${count})`
  const fontSize = vertical
    ? `clamp(0.62rem, calc(${cell} / 1.5), 0.85rem)`
    : `clamp(0.62rem, calc(${cell} / ${(longest * 0.66).toFixed(2)}), 0.9rem)`
  return (
    <div className="flex w-full flex-col justify-center gap-3" style={{ height }}>
      <ul
        className="grid [container-type:inline-size]"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`, gap }}
      >
        {metric.points.map((point, pointIndex) => {
          const intensity = (point.value - min) / range
          const showLabel = !vertical || pointIndex % 3 === 0
          return (
            <li key={point.label} className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className="grid w-full place-items-center overflow-hidden rounded-xl font-extrabold leading-none tabular-nums transition-all duration-700 [transition-timing-function:var(--ease-pop)]"
                style={{
                  height: Math.max(vertical ? 84 : 56, height * 0.5),
                  fontSize,
                  writingMode: vertical ? 'vertical-rl' : undefined,
                  transform: vertical ? 'rotate(180deg)' : undefined,
                  background: `color-mix(in srgb, var(--c1) ${Math.round(16 + intensity * 74)}%, transparent)`,
                  color: intensity > 0.5 ? 'var(--on-c1)' : 'var(--fg)',
                  boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.22), inset -2px -2px 5px rgba(0,0,0,0.1)',
                }}
              >
                {texts[pointIndex]}
              </span>
              <span
                className={`block max-w-full whitespace-nowrap text-[0.7rem] font-semibold text-fg-soft sm:text-xs ${showLabel ? '' : 'invisible'}`}
                style={vertical ? { overflow: 'visible' } : undefined}
              >
                {point.label}
              </span>
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
