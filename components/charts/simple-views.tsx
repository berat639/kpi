'use client'

import { AnimatedNumber, StatusPill } from '@/components/ds/atoms'
import { formatNumber, getHeadline, getTrend } from '@/lib/metric-utils'
import type { Metric } from '@/lib/types'

export function NumberView({ metric, height }: { metric: Metric; height: number }) {
  const trend = getTrend(metric)
  const headline = getHeadline(metric)
  return (
    <div className="flex flex-col items-start justify-center gap-3" style={{ minHeight: height }}>
      <AnimatedNumber
        value={headline}
        format={(value) => formatNumber(value, metric.unit)}
        className="text-5xl font-extrabold leading-none tracking-tight sm:text-6xl"
      />
      <p className="text-base font-semibold text-fg-soft">{trend.sentence}</p>
      <StatusPill status={trend.status} label={trend.statusLabel} />
    </div>
  )
}

export function TableView({ metric, height }: { metric: Metric; height: number }) {
  let head: string[] = []
  let rows: string[][] = []

  if (metric.kind === 'time') {
    head = ['Zaman', 'Değer']
    rows = metric.points.map((point) => [point.label, formatNumber(point.value, metric.unit)])
  } else if (metric.kind === 'breakdown') {
    const total = metric.items.reduce((sum, item) => sum + item.value, 0)
    head = ['Başlık', 'Değer', 'Pay']
    rows = metric.items.map((item) => [
      item.name,
      formatNumber(item.value, metric.unit),
      `%${Math.round((item.value / total) * 100)}`,
    ])
  } else {
    head = ['Bilgi', 'Değer']
    rows = [
      ['Şu an', formatNumber(metric.value, metric.unit)],
      [metric.targetLabel, formatNumber(metric.target, metric.unit)],
      ['Kalan', formatNumber(Math.max(0, metric.target - metric.value), metric.unit)],
      ['Doluluk', `%${Math.round((metric.value / metric.target) * 100)}`],
    ]
  }

  return (
    <div
      className="overflow-auto pr-1"
      style={{ maxHeight: height }}
      tabIndex={0}
      role="region"
      aria-label={`${metric.title} tablosu`}
    >
      <table className="data-table">
        <caption className="sr-only">{metric.title}</caption>
        <thead>
          <tr>
            {head.map((title, index) => (
              <th key={title} scope="col" className={index === head.length - 1 ? 'text-right' : ''}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cellIndex === 1 && row.length === 3 ? '!text-right' : ''}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
