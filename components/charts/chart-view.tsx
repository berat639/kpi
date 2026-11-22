'use client'

import { chartLabel } from '@/lib/chart-registry'
import { describeMetric } from '@/lib/metric-utils'
import type { ChartType, Metric } from '@/lib/types'
import { BreakdownChart } from './breakdown-charts'
import { GoalChart } from './goal-charts'
import { NumberView, TableView } from './simple-views'
import { TimeChart } from './time-charts'

interface ChartViewProps {
  metric: Metric
  type: ChartType
  height?: number
}

/**
 * Tek giriş noktası: herhangi bir Metric + herhangi bir ChartType alır.
 * Yeni bir grafik eklemek için: chart-registry.ts + ilgili dosyada bir case.
 */
const MIN_HEIGHT: Partial<Record<ChartType, number>> = {
  donut: 148,
  pie: 148,
  ring: 156,
  radar: 156,
  gauge: 124,
  blocks: 156,
}

export function ChartView({ metric, type, height: requestedHeight = 190 }: ChartViewProps) {
  const height = Math.max(requestedHeight, MIN_HEIGHT[type] ?? 0)
  if (type === 'table') return <TableView metric={metric} height={height} />
  if (type === 'number') return <NumberView metric={metric} height={height} />

  let content: React.ReactNode
  if (metric.kind === 'time') content = <TimeChart metric={metric} type={type} height={height} />
  else if (metric.kind === 'breakdown') content = <BreakdownChart metric={metric} type={type} height={height} />
  else content = <GoalChart metric={metric} type={type} height={height} />

  return (
    <div role="img" aria-label={describeMetric(metric, chartLabel(type))}>
      {content}
    </div>
  )
}
