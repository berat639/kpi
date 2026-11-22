'use client'

import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SegmentOption<T extends string | number> {
  value: T
  label: string
  icon?: LucideIcon
  description?: string
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  className?: string
  hideLabels?: boolean
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
  hideLabels = false,
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKey = (event: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    const step = keys[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('neo-well flex gap-1 p-1.5', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        const Icon = option.icon
        return (
          <button
            key={String(option.value)}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={hideLabels ? option.label : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKey(event, index)}
            className={cn(
              'neo-btn flex-1 min-h-10! px-3! py-1.5! text-sm',
              selected ? 'neo-btn-primary' : 'bg-transparent! shadow-none! opacity-90 hover:opacity-100',
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
            {!hideLabels && <span>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

interface SwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: ReactNode
}

export function Switch({ label, description, checked, onChange, icon }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <p className="font-bold leading-tight">{label}</p>
          {description && <p className="text-sm text-fg-soft">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="neo-well relative h-9 w-16 shrink-0 cursor-pointer"
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-1 top-1 size-7 rounded-full bg-[var(--strong-bg-eff)] transition-transform duration-500 [transition-timing-function:var(--ease-pop)]',
            checked ? 'translate-x-7' : 'translate-x-0 bg-[var(--clay-bg)]! opacity-90',
          )}
          style={{ boxShadow: checked ? 'var(--strong-sh-sm)' : 'var(--ctl-sh)' }}
        />
        <span className="sr-only">{checked ? 'Açık' : 'Kapalı'}</span>
      </button>
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  minLabel: string
  maxLabel: string
}

export function Slider({ label, value, min, max, step, onChange, minLabel, maxLabel }: SliderProps) {
  return (
    <div>
      <label className="mb-2 block font-bold">
        {label}
        <input
          type="range"
          className="neo-range mt-3 block"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
      <div className="flex justify-between text-sm text-fg-soft" aria-hidden="true">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
