'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { usePalette } from '@/components/ds/surface'
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
 * Düğmenin altında açılan küçük "Nasıl görmek istersin?" menüsü.
 * Kartın tamamını kapatmaz: ikon + kısa isim ızgarası, altta seçili/odaklı seçeneğin tek satır açıklaması.
 */
export function ChartPicker({ id, title, options, value, tone, onSelect, onClose }: ChartPickerProps) {
  const palette = usePalette(tone)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<ChartType>(value)

  useEffect(() => {
    const selectedIndex = Math.max(0, options.indexOf(value))
    refs.current[selectedIndex]?.focus()
  }, [options, value])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if ((target as HTMLElement).closest?.('[aria-controls="' + id + '"]')) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [id, onClose])

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
    <div
      ref={rootRef}
      id={id}
      role="dialog"
      aria-label={`${title} için grafik türünü seç`}
      className={cn(
        'picker-pop anim-tray absolute inset-x-3 top-[4.5rem] z-30 flex flex-col gap-2.5 p-3 sm:left-auto sm:right-4 sm:top-[4.75rem] sm:w-[21rem]',
        palette,
      )}
    >
      <p className="px-1 text-sm font-extrabold">Nasıl görmek istersin?</p>
      <div role="radiogroup" aria-label="Grafik türü" className="grid grid-cols-4 gap-1.5">
        {options.map((option, index) => {
          const meta = CHART_META[option]
          const Icon = meta.icon
          return (
            <button
              key={option}
              ref={(node) => {
                refs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={option === value}
              aria-label={`${meta.label}. ${meta.hint}`}
              onKeyDown={(event) => handleKey(event, index)}
              onFocus={() => setActive(option)}
              onPointerEnter={() => setActive(option)}
              onClick={() => {
                onSelect(option)
                onClose()
              }}
              className="picker-opt"
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{meta.label}</span>
            </button>
          )
        })}
      </div>
      <p className="picker-note px-1 text-xs font-semibold leading-snug opacity-85" aria-live="polite">
        {CHART_META[active].hint}
      </p>
    </div>
  )
}
