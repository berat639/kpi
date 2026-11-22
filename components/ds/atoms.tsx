'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ChartColumn,
  CircleAlert,
  CircleCheck,
  Clock,
  Equal,
  Package,
  ShoppingBag,
  Smile,
  Store,
  Target,
  Truck,
  Undo2,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useDesign } from '@/components/providers/design-provider'
import { useLiveData } from '@/components/providers/live-data-provider'
import { cn } from '@/lib/utils'
import type { ChipTone, IconKey } from '@/lib/types'
import type { TrendStatus } from '@/lib/metric-utils'

const ICONS: Record<IconKey, LucideIcon> = {
  sales: ShoppingBag,
  visitors: Users,
  customers: UserPlus,
  smile: Smile,
  channels: Store,
  target: Target,
  wallet: Wallet,
  clock: Clock,
  truck: Truck,
  returns: Undo2,
  package: Package,
}

export function getMetricIcon(key: IconKey) {
  return ICONS[key] ?? ChartColumn
}

const CHIP_COLORS: Record<ChipTone, [string, string]> = {
  brand: ['#4a82f2', '#1d52d1'],
  mint: ['#2fd6a6', '#0e9a74'],
  amber: ['#ffbe3d', '#e08a00'],
  coral: ['#ff8591', '#e5484d'],
  violet: ['#a58bff', '#6b4be0'],
}

export function IconChip({
  icon: Icon,
  tone = 'brand',
  size = 'md',
  className,
}: {
  icon: LucideIcon
  tone?: ChipTone
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [light, dark] = CHIP_COLORS[tone]
  const dimension = size === 'sm' ? 'size-8' : size === 'lg' ? 'size-12' : 'size-10'
  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center rounded-[34%] text-white', dimension, className)}
      style={{
        background: `linear-gradient(145deg, ${light}, ${dark})`,
        boxShadow: `calc(var(--d) * 2px) calc(var(--d) * 3px) calc(var(--d) * 6px) ${dark}44, inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.16)`,
      }}
    >
      <Icon className={size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5'} strokeWidth={2.4} />
    </span>
  )
}

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number
  format: (value: number) => string
  className?: string
}) {
  const { settings } = useDesign()
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    if (settings.motion === 'off') {
      fromRef.current = value
      setDisplay(value)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    const duration = settings.motion === 'calm' ? 500 : 800
    let frame = 0
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (value - from) * eased
      fromRef.current = next
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, settings.motion])

  return <span className={cn('tabular-nums', className)}>{format(display)}</span>
}

const STATUS_STYLE: Record<TrendStatus, { icon: LucideIcon; color: string }> = {
  good: { icon: CircleCheck, color: 'var(--good)' },
  watch: { icon: CircleAlert, color: 'var(--watch)' },
  steady: { icon: Equal, color: 'var(--fg-soft)' },
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: TrendStatus
  label: string
  className?: string
}) {
  const { icon: Icon, color } = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.8125rem] font-bold',
        className,
      )}
      style={{ background: 'var(--chip-bg)', boxShadow: 'none' }}
    >
      <Icon className="size-4 shrink-0" style={{ color }} strokeWidth={2.8} aria-hidden="true" />
      {label}
    </span>
  )
}

export function LiveDot({ className }: { className?: string }) {
  const { settings } = useDesign()
  const { ticks } = useLiveData()
  const active = settings.live
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold', className)}>
      <span className="relative grid size-3 place-items-center" aria-hidden="true">
        {active && (
          <span
            key={ticks}
            className="anim-ping absolute inset-0 rounded-full"
            style={{ background: 'var(--good)' }}
          />
        )}
        <span
          className="relative size-2.5 rounded-full"
          style={{ background: active ? 'var(--good)' : 'var(--fg-soft)' }}
        />
      </span>
      <span>{active ? 'Canlı' : 'Duraklatıldı'}</span>
    </span>
  )
}
