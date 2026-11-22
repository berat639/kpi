'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Surface } from '@/components/ds/surface'
import { CHART_META } from '@/lib/chart-registry'
import { cn } from '@/lib/utils'
import type { CardTone, ChartType } from '@/lib/types'

interface ChartPickerProps {
  id: string
  title: string
  options: ChartType[]
  value: ChartType
  tone: CardTone
  onSelect: (chart: ChartType) => void
  onClose: () => void
}

/**
 * Kartın içinde açılan "Nasıl görmek istersin?" paneli.
 * Her seçenekte ikon + düz Türkçe isim + tek cümlelik açıklama vardır.
 */
export function ChartPicker({ id, title, options, value, tone, onSelect, onClose }: ChartPickerProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const selectedIndex = Math.max(0, options.indexOf(value))
    refs.current[selectedIndex]?.focus()
  }, [options, value])

  const handleKey = (event: KeyboardEvent, index: number) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    const step = moves[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    refs.current[next]?.focus()
  }

  return (
    <Surface
      tone={tone === 'strong' ? 'strong' : 'raised'}
      id={id}
      role="dialog"
      aria-label={`${title} için grafik türünü seç`}
      className="anim-tray absolute inset-0 z-20 flex flex-col gap-3 overflow-hidden p-4 shadow-none! sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold leading-tight">Nasıl görmek istersin?</p>
          <p className="text-sm text-fg-soft">Birini seç, kart hemen değişir.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="neo-btn neo-icon-btn shrink-0"
          aria-label="Seçimi kapat"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div
        role="radiogroup"
        aria-label="Grafik türü"
        className="grid flex-1 auto-rows-min grid-cols-2 gap-2.5 overflow-y-auto p-1.5 sm:grid-cols-3"
      >
        {options.map((option, index) => {
          const meta = CHART_META[option]
          const Icon = meta.icon
          const selected = option === value
          return (
            <button
              key={option}
              ref={(node) => {
                refs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              onKeyDown={(event) => handleKey(event, index)}
              onClick={() => {
                onSelect(option)
                onClose()
              }}
              className={cn(
                'neo-btn flex-col items-start justify-start gap-1 text-left min-h-[4.5rem] px-3! py-2.5!',
                selected &&
                  (tone === 'strong'
                    ? 'bg-white! text-[#0c2155]! shadow-[0_6px_14px_rgba(5,20,90,0.45)]!'
                    : 'neo-btn-primary'),
              )}
            >
              <span className="flex items-center gap-2 text-sm font-extrabold">
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {meta.label}
              </span>
              <span className={cn('text-xs font-semibold leading-snug', selected ? 'opacity-90' : 'text-fg-soft')}>
                {meta.hint}
              </span>
            </button>
          )
        })}
      </div>
    </Surface>
  )
}
