'use client'

import { useId, type ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { useDesign } from '@/components/providers/design-provider'
import { formatNumber } from '@/lib/metric-utils'
import type { Metric, UnitFormat } from '@/lib/types'

export const SERIES = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']

export function seriesColor(index: number) {
  return SERIES[index % SERIES.length]
}

export function useChartMotion() {
  const { settings } = useDesign()
  return {
    animate: settings.motion !== 'off',
    duration: settings.motion === 'calm' ? 500 : 900,
  }
}

export function useSafeId() {
  return useId().replace(/[^a-zA-Z0-9]/g, '')
}

export interface ChartProps {
  metric: Metric
  height: number
}

interface TooltipProps {
  active?: boolean
  payload?: { value?: number | string; name?: string | number }[]
  label?: string | number
  unit: UnitFormat
}

export function ChartTooltip({ active, payload, label, unit }: TooltipProps) {
  if (!active || !payload?.length) return null
  const first = payload[0]
  return (
    <div
      className="rounded-2xl px-3 py-2 text-sm font-bold text-white shadow-xl"
      style={{ background: 'var(--tip-bg)' }}
    >
      <p className="text-xs font-semibold text-white/80">{label ?? first.name}</p>
      <p>{formatNumber(Number(first.value), unit)}</p>
    </div>
  )
}

export function ChartBox({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height }}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

export const AXIS_TICK = { fill: 'var(--fg-soft)', fontSize: 12, fontWeight: 600 }

export function shorten(text: string, max = 9) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
