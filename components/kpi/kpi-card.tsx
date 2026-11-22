'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus, SlidersHorizontal } from 'lucide-react'
import { ChartView } from '@/components/charts/chart-view'
import { AnimatedNumber, IconChip, LiveDot, StatusPill, getMetricIcon } from '@/components/ds/atoms'
import { Surface } from '@/components/ds/surface'
import { useLiveData } from '@/components/providers/live-data-provider'
import { CHART_META } from '@/lib/chart-registry'
import { formatNumber, getHeadline, getTrend } from '@/lib/metric-utils'
import { cn } from '@/lib/utils'
import type { CardSize, CardTone, ChartType, Metric } from '@/lib/types'
import { ChartPicker } from './chart-picker'

const HEIGHTS: Record<CardSize, number> = { sm: 130, md: 180, lg: 240 }

export interface KpiCardProps {
  /** Canlı veri kaynağındaki gösterge kimliği */
  metricId?: string
  /** Canlı kaynağa bağlanmadan doğrudan veri vermek için */
  metric?: Metric
  tone?: CardTone
  size?: CardSize
  /** Kontrollü kullanım için */
  chart?: ChartType
  defaultChart?: ChartType
  onChartChange?: (chart: ChartType) => void
  /** Kullanıcının seçebileceği grafikleri daraltır */
  allowedCharts?: ChartType[]
  /** Giriş animasyon sırası */
  index?: number
  className?: string
}

export function KpiCard({
  metricId,
  metric: metricProp,
  tone = 'raised',
  size = 'md',
  chart: chartProp,
  defaultChart,
  onChartChange,
  allowedCharts,
  index = 0,
  className,
}: KpiCardProps) {
  const { byId, updatedAt } = useLiveData()
  const metric = metricProp ?? (metricId ? byId[metricId] : undefined)
  const [internalChart, setInternalChart] = useState<ChartType | undefined>(defaultChart)
  const [picking, setPicking] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const pickerId = useId()

  const closePicker = useCallback(() => {
    setPicking(false)
    triggerRef.current?.focus()
  }, [])

  if (!metric) return null

  const options = allowedCharts
    ? metric.supports.filter((type) => allowedCharts.includes(type))
    : metric.supports
  const requested = chartProp ?? internalChart ?? metric.defaultChart
  const chart = options.includes(requested) ? requested : options[0]
  const CurrentIcon = CHART_META[chart].icon

  const trend = getTrend(metric)
  const TrendIcon = trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : Minus
  const headline = getHeadline(metric)
  const height = HEIGHTS[size]

  const select = (next: ChartType) => {
    setInternalChart(next)
    onChartChange?.(next)
  }

  return (
    <Surface
      as="article"
      tone={tone}
      lift
      aria-labelledby={titleId}
      style={{ ['--i' as string]: index }}
      className={cn('anim-rise flex flex-col gap-4 p-5 sm:p-6', className)}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconChip icon={getMetricIcon(metric.icon)} tone={metric.chip} />
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg font-extrabold leading-tight text-pretty">
              {metric.title}
            </h3>
            <p className="text-sm leading-snug text-fg-soft">{metric.question}</p>
          </div>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setPicking((open) => !open)}
          aria-expanded={picking}
          aria-controls={pickerId}
          className="neo-btn neo-icon-btn shrink-0 px-3! text-sm"
        >
          <CurrentIcon className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline">Görünüm</span>
          <SlidersHorizontal className="size-4 sm:hidden" aria-hidden="true" />
          <span className="sr-only">
            değiştir. Şu an: {CHART_META[chart].label}
          </span>
        </button>
      </header>

      {chart !== 'number' && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <AnimatedNumber
            value={headline}
            format={(value) => formatNumber(value, metric.unit)}
            className="text-4xl font-extrabold leading-none tracking-tight"
          />
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-fg-soft">
              <TrendIcon className="size-4" aria-hidden="true" />
              {trend.sentence}
            </span>
            <StatusPill status={trend.status} label={trend.statusLabel} />
          </div>
        </div>
      )}

      <div key={chart} className="anim-swap min-w-0">
        <ChartView metric={metric} type={chart} height={height} />
      </div>

      <footer className="mt-auto flex items-center justify-between gap-2 text-fg-soft">
        <LiveDot />
        <span className="text-xs font-semibold" suppressHydrationWarning>
          {updatedAt ? `Son güncelleme ${new Date(updatedAt).toLocaleTimeString('tr-TR')}` : metric.compareLabel + ' ile karşılaştırılır'}
        </span>
      </footer>

      {picking && (
        <ChartPicker
          id={pickerId}
          title={metric.title}
          options={options}
          value={chart}
          tone={tone}
          onSelect={select}
          onClose={closePicker}
        />
      )}
    </Surface>
  )
}
