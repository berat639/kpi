'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import type { CardTone } from '@/lib/types'

export function usePalette(tone: CardTone) {
  return tone === 'strong' ? 'pal-blue' : 'pal-light'
}

interface SurfaceProps extends ComponentPropsWithoutRef<'div'> {
  tone?: CardTone
  as?: 'div' | 'article' | 'section' | 'aside' | 'header'
  lift?: boolean
}

/**
 * Tüm kartların temeli. tone="raised" -> neomorph kabartma, "inset" -> çukur,
 * "strong" -> #255ee3 claymorph yüzey (yazılar her zaman beyaz).
 */
export function Surface({
  tone = 'raised',
  as: Tag = 'div',
  lift = false,
  className,
  ...props
}: SurfaceProps) {
  const palette = usePalette(tone)
  return (
    <Tag
      className={cn('surface', `tone-${tone}`, palette, lift && 'lift', className)}
      {...props}
    />
  )
}
