'use client'

import { formatNumber, getGoalPercent } from '@/lib/metric-utils'
import type { ChartType, GoalMetric } from '@/lib/types'
import { useSafeId } from './shared'

interface Props {
  metric: GoalMetric
  type: ChartType
  height: number
}

export function GoalChart({ metric, type, height }: Props) {
  const percent = getGoalPercent(metric)
  switch (type) {
    case 'ring':
      return <Ring metric={metric} percent={percent} height={height} />
    case 'progress':
      return <ProgressBar metric={metric} percent={percent} height={height} />
    case 'segments':
      return <Segments metric={metric} percent={percent} height={height} />
    default:
      return <GaugeView metric={metric} percent={percent} height={height} />
  }
}

interface InnerProps {
  metric: GoalMetric
  percent: number
  height: number
}

function CenterText({ metric, percent }: { metric: GoalMetric; percent: number }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold leading-none tabular-nums sm:text-4xl">
        %{Math.round(percent)}
      </p>
      <p className="mt-1 text-xs font-semibold text-fg-soft">
        {metric.targetLabel}: {formatNumber(metric.target, metric.unit)}
      </p>
    </div>
  )
}

function GaugeView({ metric, percent, height }: InnerProps) {
  const gradientId = useSafeId()
  return (
    <div className="relative mx-auto w-full max-w-[22rem]" style={{ height }}>
      <svg viewBox="0 0 200 118" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--c2)" />
            <stop offset="100%" stopColor="var(--c1)" />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--grid)"
          strokeWidth="22"
          strokeLinecap="round"
          pathLength={100}
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="22"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${Math.max(percent, 0.5)} 100`}
          style={{ transition: 'stroke-dasharray 1s var(--ease-soft)' }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex justify-center">
        <CenterText metric={metric} percent={percent} />
      </div>
    </div>
  )
}

function Ring({ metric, percent, height }: InnerProps) {
  const gradientId = useSafeId()
  return (
    <div className="relative mx-auto aspect-square" style={{ height }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c2)" />
            <stop offset="100%" stopColor="var(--c1)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--grid)" strokeWidth="16" />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${Math.max(percent, 0.5)} 100`}
          style={{ transition: 'stroke-dasharray 1s var(--ease-soft)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <CenterText metric={metric} percent={percent} />
      </div>
    </div>
  )
}

function ProgressBar({ metric, percent, height }: InnerProps) {
  return (
    <div className="flex w-full flex-col justify-center gap-4" style={{ minHeight: height }}>
      <div className="flex items-end justify-between gap-2">
        <p className="text-4xl font-extrabold leading-none tabular-nums">%{Math.round(percent)}</p>
        <p className="text-sm font-semibold text-fg-soft">
          {metric.targetLabel}: {formatNumber(metric.target, metric.unit)}
        </p>
      </div>
      <div
        className="h-8 rounded-full p-1.5"
        style={{ background: 'var(--chip-bg)', boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.16)' }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-1000 [transition-timing-function:var(--ease-soft)]"
          style={{
            width: `${Math.max(percent, 3)}%`,
            background: 'linear-gradient(90deg, var(--c2), var(--c1))',
            boxShadow: 'inset 2px 3px 4px rgba(255,255,255,0.6), inset -2px -3px 5px rgba(0,0,0,0.18)',
          }}
        />
      </div>
      <div className="flex justify-between text-xs font-semibold text-fg-soft" aria-hidden="true">
        <span>0</span>
        <span>{formatNumber(metric.target, metric.unit)}</span>
      </div>
    </div>
  )
}

function Segments({ metric, percent, height }: InnerProps) {
  const total = 12
  const filled = Math.round((percent / 100) * total)
  return (
    <div className="flex w-full flex-col justify-center gap-4" style={{ minHeight: height }}>
      <div className="flex items-end justify-between gap-2">
        <p className="text-4xl font-extrabold leading-none tabular-nums">%{Math.round(percent)}</p>
        <p className="text-sm font-semibold text-fg-soft">
          {filled} / {total} parça dolu
        </p>
      </div>
      <div className="flex gap-1.5" role="presentation">
        {Array.from({ length: total }).map((_, index) => {
          const on = index < filled
          return (
            <span
              key={index}
              className="h-14 flex-1 rounded-xl transition-all duration-700 [transition-timing-function:var(--ease-pop)]"
              style={{
                transitionDelay: `${index * 25}ms`,
                background: on
                  ? 'linear-gradient(180deg, var(--c2), var(--c1))'
                  : 'var(--chip-bg)',
                boxShadow: on
                  ? 'inset 2px 3px 4px rgba(255,255,255,0.55), inset -2px -3px 5px rgba(0,0,0,0.18)'
                  : 'inset 2px 2px 5px rgba(0,0,0,0.14)',
                transform: on ? 'scaleY(1)' : 'scaleY(0.8)',
              }}
            />
          )
        })}
      </div>
      <p className="text-xs font-semibold text-fg-soft">
        {metric.targetLabel}: {formatNumber(metric.target, metric.unit)}
      </p>
    </div>
  )
}
