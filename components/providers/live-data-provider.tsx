'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import rawMetrics from '@/data/metrics.json'
import { clamp, nextLabel } from '@/lib/metric-utils'
import type { Metric } from '@/lib/types'
import { useDesign } from './design-provider'

const SEED = rawMetrics as unknown as Metric[]

interface LiveContextValue {
  metrics: Metric[]
  byId: Record<string, Metric>
  ticks: number
  updatedAt: number | null
}

const LiveContext = createContext<LiveContextValue | null>(null)

function wiggle(value: number, volatility: number, decimals: number, floor = 0) {
  const next = value * (1 + (Math.random() - 0.5) * 2 * volatility)
  const factor = 10 ** decimals
  return Math.max(floor, Math.round(next * factor) / factor)
}

/**
 * Gerçek bir sunucu (WebSocket / SSE) bağlandığında yalnızca bu fonksiyonun yerini
 * alacak bir "adım" fonksiyonudur. Kartlar yalnızca Metric şeklini bilir.
 */
function stepMetric(metric: Metric, tick: number, seed: Metric): Metric {
  const decimals = metric.unit.decimals ?? 0
  if (metric.kind === 'time') {
    const points = metric.points.map((point) => ({ ...point }))
    const last = points[points.length - 1]
    const mean = points.reduce((total, point) => total + point.value, 0) / points.length
    last.value = wiggle(last.value * 0.75 + mean * 0.25, metric.volatility, decimals)
    if (tick % 4 === 0) {
      points.shift()
      points.push({
        label: nextLabel(last.label, metric.stepMinutes),
        value: wiggle(last.value, metric.volatility * 1.5, decimals),
      })
    }
    return { ...metric, points }
  }
  if (metric.kind === 'breakdown') {
    return {
      ...metric,
      items: metric.items.map((item, index) => {
        const home = (seed as typeof metric).items[index]?.value ?? item.value
        return { ...item, value: wiggle(item.value * 0.85 + home * 0.15, metric.volatility, decimals) }
      }),
    }
  }
  if (metric.walk === 'accumulate') {
    const step = metric.target * metric.volatility * (0.4 + Math.random())
    return { ...metric, value: Math.min(metric.target, Math.round(metric.value + step)) }
  }
  const home = (seed as typeof metric).value
  const drift = (Math.random() - 0.5) * 2 * metric.target * metric.volatility + (home - metric.value) * 0.2
  return { ...metric, value: clamp(Math.round(metric.value + drift), 0, metric.target) }
}

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const { settings } = useDesign()
  const [metrics, setMetrics] = useState<Metric[]>(SEED)
  const [ticks, setTicks] = useState(0)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const tickRef = useRef(0)

  useEffect(() => {
    if (!settings.live) return
    const run = () => {
      if (document.hidden) return
      tickRef.current += 1
      const tick = tickRef.current
      setMetrics((current) => current.map((metric, index) => stepMetric(metric, tick, SEED[index])))
      setTicks(tick)
      setUpdatedAt(Date.now())
    }
    const id = window.setInterval(run, settings.liveInterval)
    return () => window.clearInterval(id)
  }, [settings.live, settings.liveInterval])

  const value = useMemo<LiveContextValue>(
    () => ({
      metrics,
      byId: Object.fromEntries(metrics.map((metric) => [metric.id, metric])),
      ticks,
      updatedAt,
    }),
    [metrics, ticks, updatedAt],
  )

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>
}

export function useLiveData() {
  const context = useContext(LiveContext)
  if (!context) throw new Error('useLiveData, LiveDataProvider içinde kullanılmalı')
  return context
}

export function useMetric(id: string): Metric | undefined {
  return useLiveData().byId[id]
}

export const SEED_METRICS = SEED
