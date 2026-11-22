import {
  ChartArea,
  ChartBarBig,
  ChartColumn,
  ChartLine,
  ChartNoAxesColumn,
  ChartPie,
  ChartSpline,
  CircleDot,
  Gauge,
  Grid3x3,
  Hash,
  LayoutGrid,
  Radar,
  Table2,
  BatteryFull,
  ChartBarStacked,
  type LucideIcon,
} from 'lucide-react'
import type { ChartType } from './types'

export interface ChartMeta {
  id: ChartType
  label: string
  hint: string
  icon: LucideIcon
}

export const CHART_META: Record<ChartType, ChartMeta> = {
  line: { id: 'line', label: 'Çizgi', hint: 'Zamanla nasıl değişti?', icon: ChartLine },
  area: { id: 'area', label: 'Alan', hint: 'Dolu çizgiyle değişim', icon: ChartArea },
  bar: { id: 'bar', label: 'Sütun', hint: 'Her biri için bir sütun', icon: ChartColumn },
  step: { id: 'step', label: 'Basamak', hint: 'Merdiven gibi değişim', icon: ChartSpline },
  spark: { id: 'spark', label: 'Mini çizgi', hint: 'Sade ve küçük', icon: ChartNoAxesColumn },
  heat: { id: 'heat', label: 'Renk şeridi', hint: 'Koyu renk, yüksek demek', icon: Grid3x3 },
  donut: { id: 'donut', label: 'Halka', hint: 'Parçaların payı', icon: CircleDot },
  pie: { id: 'pie', label: 'Pasta', hint: 'Dilimlere bölünmüş', icon: ChartPie },
  hbar: { id: 'hbar', label: 'Yatay çubuk', hint: 'Sıralı karşılaştırma', icon: ChartBarBig },
  radar: { id: 'radar', label: 'Örümcek ağı', hint: 'Dengeyi gösterir', icon: Radar },
  blocks: { id: 'blocks', label: 'Kutular', hint: 'Büyük kutu, büyük pay', icon: LayoutGrid },
  stack: { id: 'stack', label: 'Tek şerit', hint: 'Tek çubukta paylar', icon: ChartBarStacked },
  gauge: { id: 'gauge', label: 'Gösterge', hint: 'Arabadaki hız göstergesi gibi', icon: Gauge },
  ring: { id: 'ring', label: 'İlerleme halkası', hint: 'Ne kadarı doldu?', icon: CircleDot },
  progress: { id: 'progress', label: 'İlerleme çubuğu', hint: 'Yükleniyor çubuğu gibi', icon: ChartBarBig },
  segments: { id: 'segments', label: 'Pil', hint: 'Kaç parça dolu?', icon: BatteryFull },
  number: { id: 'number', label: 'Büyük sayı', hint: 'Sadece sayı', icon: Hash },
  table: { id: 'table', label: 'Tablo', hint: 'Satır satır liste', icon: Table2 },
}

export function chartLabel(type: ChartType) {
  return CHART_META[type].label
}
