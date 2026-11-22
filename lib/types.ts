export type MetricKind = 'time' | 'breakdown' | 'goal'

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'step'
  | 'spark'
  | 'heat'
  | 'donut'
  | 'pie'
  | 'hbar'
  | 'radar'
  | 'blocks'
  | 'stack'
  | 'gauge'
  | 'ring'
  | 'progress'
  | 'segments'
  | 'number'
  | 'table'

export type IconKey =
  | 'sales'
  | 'visitors'
  | 'customers'
  | 'smile'
  | 'channels'
  | 'target'
  | 'wallet'
  | 'clock'
  | 'truck'
  | 'returns'
  | 'package'

export type ChipTone = 'brand' | 'mint' | 'amber' | 'coral' | 'violet'

export interface UnitFormat {
  prefix?: string
  suffix?: string
  decimals?: number
}

export interface MetricBase {
  id: string
  title: string
  question: string
  icon: IconKey
  chip: ChipTone
  unit: UnitFormat
  goodDirection: 'up' | 'down'
  previous: number
  compareLabel: string
  upWord: string
  downWord: string
  volatility: number
  defaultChart: ChartType
  supports: ChartType[]
}

export interface TimePoint {
  label: string
  value: number
}

export interface TimeMetric extends MetricBase {
  kind: 'time'
  headline: 'last' | 'sum' | 'avg'
  stepMinutes?: number
  points: TimePoint[]
}

export interface BreakdownItem {
  name: string
  value: number
}

export interface BreakdownMetric extends MetricBase {
  kind: 'breakdown'
  items: BreakdownItem[]
}

export interface GoalMetric extends MetricBase {
  kind: 'goal'
  value: number
  target: number
  walk: 'accumulate' | 'level'
  targetLabel: string
}

export type Metric = TimeMetric | BreakdownMetric | GoalMetric

export type CardTone = 'raised' | 'strong' | 'inset'
export type CardSize = 'sm' | 'md' | 'lg'

export type ThemeMode = 'light' | 'dark'
export type StyleMode = 'neo' | 'clay' | 'mix'
export type RadiusMode = 'sharp' | 'soft' | 'round'
export type MotionMode = 'off' | 'calm' | 'lively'
export type TextSize = 'md' | 'lg' | 'xl'
export type AccentKey = 'sky' | 'mint' | 'coral' | 'amber' | 'violet'

export interface DesignSettings {
  theme: ThemeMode
  style: StyleMode
  radius: RadiusMode
  depth: number
  motion: MotionMode
  textSize: TextSize
  accent: AccentKey
  live: boolean
  liveInterval: number
}
