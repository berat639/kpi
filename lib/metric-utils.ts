import type { Metric, UnitFormat } from './types'

const numberFormat = (decimals: number) =>
  new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export function formatNumber(value: number, unit: UnitFormat = {}) {
  const text = numberFormat(unit.decimals ?? 0).format(value)
  return `${unit.prefix ?? ''}${text}${unit.suffix ?? ''}`
}

export function formatCompact(value: number, unit: UnitFormat = {}) {
  if (Math.abs(value) >= 10000) {
    const compact = new Intl.NumberFormat('tr-TR', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
    return `${unit.prefix ?? ''}${compact}${unit.suffix ?? ''}`
  }
  return formatNumber(value, unit)
}

export function getHeadline(metric: Metric): number {
  if (metric.kind === 'goal') return metric.value
  if (metric.kind === 'breakdown') {
    return metric.items.reduce((total, item) => total + item.value, 0)
  }
  const values = metric.points.map((point) => point.value)
  if (metric.headline === 'sum') return values.reduce((a, b) => a + b, 0)
  if (metric.headline === 'avg') return values.reduce((a, b) => a + b, 0) / values.length
  return values[values.length - 1]
}

export type TrendStatus = 'good' | 'watch' | 'steady'

export interface Trend {
  percent: number
  direction: 'up' | 'down' | 'flat'
  status: TrendStatus
  statusLabel: string
  sentence: string
}

export function getTrend(metric: Metric): Trend {
  const current = getHeadline(metric)
  const delta = metric.previous === 0 ? 0 : (current - metric.previous) / metric.previous
  const percent = Math.abs(Math.round(delta * 100))
  const flat = Math.abs(delta) < 0.015
  const direction = flat ? 'flat' : delta > 0 ? 'up' : 'down'
  const better = (delta > 0) === (metric.goodDirection === 'up')
  const status: TrendStatus = flat ? 'steady' : better ? 'good' : 'watch'
  const statusLabel =
    status === 'good' ? 'İyi gidiyor' : status === 'watch' ? 'Dikkat edelim' : 'Aynı seviyede'
  const sentence = flat
    ? `${metric.compareLabel} neredeyse aynı`
    : `${metric.compareLabel} %${percent} ${delta > 0 ? metric.upWord : metric.downWord}`
  return { percent, direction, status, statusLabel, sentence }
}

export function getGoalPercent(metric: Metric): number {
  if (metric.kind !== 'goal') return 0
  return Math.max(0, Math.min(100, (metric.value / metric.target) * 100))
}

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function nextLabel(label: string, stepMinutes = 60) {
  const dayIndex = DAYS.indexOf(label)
  if (dayIndex >= 0) return DAYS[(dayIndex + 1) % DAYS.length]
  const match = /^(\d{2}):(\d{2})$/.exec(label)
  if (match) {
    const total = (Number(match[1]) * 60 + Number(match[2]) + stepMinutes) % (24 * 60)
    const hours = String(Math.floor(total / 60)).padStart(2, '0')
    const minutes = String(total % 60).padStart(2, '0')
    return `${hours}:${minutes}`
  }
  return label
}

export function describeMetric(metric: Metric, chartLabel: string) {
  const headline = formatNumber(getHeadline(metric), metric.unit)
  const trend = getTrend(metric)
  let detail = ''
  if (metric.kind === 'time') {
    const best = metric.points.reduce((a, b) => (b.value > a.value ? b : a))
    detail = `En yüksek değer ${best.label} zamanında ${formatNumber(best.value, metric.unit)}.`
  } else if (metric.kind === 'breakdown') {
    const top = metric.items.reduce((a, b) => (b.value > a.value ? b : a))
    detail = `En büyük pay ${top.name}, ${formatNumber(top.value, metric.unit)}.`
  } else {
    detail = `${metric.targetLabel}: ${formatNumber(metric.target, metric.unit)}.`
  }
  return `${metric.title}. ${chartLabel} görünümü. Şu an ${headline}. ${trend.sentence}, ${trend.statusLabel}. ${detail}`
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
