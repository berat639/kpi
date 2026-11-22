'use client'

import { useEffect, useRef } from 'react'
import {
  Box,
  Circle,
  Layers,
  Moon,
  Pause,
  RotateCcw,
  Sparkles,
  Square,
  SquareRoundCorner,
  Sun,
  Type,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import { Segmented, Slider, Switch, type SegmentOption } from '@/components/ds/controls'
import { Surface } from '@/components/ds/surface'
import { useDesign } from '@/components/providers/design-provider'
import { cn } from '@/lib/utils'
import type { AccentKey } from '@/lib/types'

const ACCENTS: { value: AccentKey; label: string; color: string }[] = [
  { value: 'sky', label: 'Gökyüzü', color: '#0ea5e9' },
  { value: 'mint', label: 'Nane', color: '#12a57f' },
  { value: 'coral', label: 'Mercan', color: '#f0566a' },
  { value: 'amber', label: 'Kehribar', color: '#e08a00' },
  { value: 'violet', label: 'Mor', color: '#7c5cf0' },
]

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2.5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-fg-soft">{title}</h3>
      {children}
    </section>
  )
}

export function DesignPanel() {
  const { settings, update, reset, panelOpen, setPanelOpen } = useDesign()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!panelOpen) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, setPanelOpen])

  const themeOptions: SegmentOption<'light' | 'dark'>[] = [
    { value: 'light', label: 'Açık', icon: Sun },
    { value: 'dark', label: 'Koyu', icon: Moon },
  ]
  const styleOptions: SegmentOption<'neo' | 'clay' | 'mix'>[] = [
    { value: 'neo', label: 'Neomorph', icon: Layers },
    { value: 'clay', label: 'Clay', icon: Box },
    { value: 'mix', label: 'Karışık', icon: Sparkles },
  ]
  const radiusOptions: SegmentOption<'sharp' | 'soft' | 'round'>[] = [
    { value: 'sharp', label: 'Keskin', icon: Square },
    { value: 'soft', label: 'Yumuşak', icon: SquareRoundCorner },
    { value: 'round', label: 'Yuvarlak', icon: Circle },
  ]
  const motionOptions: SegmentOption<'off' | 'calm' | 'lively'>[] = [
    { value: 'off', label: 'Yok', icon: Pause },
    { value: 'calm', label: 'Sakin', icon: Wind },
    { value: 'lively', label: 'Canlı', icon: Zap },
  ]
  const textOptions: SegmentOption<'md' | 'lg' | 'xl'>[] = [
    { value: 'md', label: 'Normal', icon: Type },
    { value: 'lg', label: 'Büyük', icon: Type },
    { value: 'xl', label: 'Çok büyük', icon: Type },
  ]

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setPanelOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300',
          panelOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <Surface
        as="aside"
        role="dialog"
        aria-label="Görünüm ayarları"
        aria-modal="true"
        inert={!panelOpen}
        className={cn(
          'fixed inset-y-3 right-3 z-50 flex w-[min(26rem,calc(100vw-1.5rem))] flex-col gap-5 overflow-y-auto p-5 transition-transform duration-500 [transition-timing-function:var(--ease-pop)]',
          panelOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1.5rem)]',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Görünümü ayarla</h2>
            <p className="text-sm text-fg-soft">Değişiklikler anında uygulanır.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="neo-btn neo-icon-btn shrink-0"
            onClick={() => setPanelOpen(false)}
            aria-label="Paneli kapat"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <Group title="Tema">
          <Segmented label="Tema" value={settings.theme} options={themeOptions} onChange={(theme) => update({ theme })} />
        </Group>
        <Group title="Yüzey stili">
          <Segmented label="Yüzey stili" value={settings.style} options={styleOptions} onChange={(style) => update({ style })} />
        </Group>
        <Group title="Köşeler">
          <Segmented label="Köşe yuvarlaklığı" value={settings.radius} options={radiusOptions} onChange={(radius) => update({ radius })} />
        </Group>
        <Slider
          label="Kabartma derinliği"
          value={settings.depth}
          min={0.4}
          max={1.6}
          step={0.1}
          onChange={(depth) => update({ depth })}
          minLabel="Düz"
          maxLabel="Belirgin"
        />
        <Group title="Grafik rengi">
          <div role="radiogroup" aria-label="Grafik rengi" className="flex flex-wrap gap-3 p-1">
            {ACCENTS.map((accent) => {
              const selected = settings.accent === accent.value
              return (
                <button
                  key={accent.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={accent.label}
                  onClick={() => update({ accent: accent.value })}
                  className="neo-btn size-12 min-h-0! p-0!"
                  style={selected ? { boxShadow: `0 0 0 3px var(--bg), 0 0 0 6px ${accent.color}` } : undefined}
                >
                  <span
                    className="size-7 rounded-full"
                    style={{
                      background: accent.color,
                      boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.55), inset -2px -3px 5px rgba(0,0,0,0.25)',
                    }}
                  />
                </button>
              )
            })}
          </div>
        </Group>
        <Group title="Hareket">
          <Segmented label="Animasyon yoğunluğu" value={settings.motion} options={motionOptions} onChange={(motion) => update({ motion })} />
        </Group>
        <Group title="Yazı boyutu">
          <Segmented label="Yazı boyutu" value={settings.textSize} options={textOptions} onChange={(textSize) => update({ textSize })} />
        </Group>
        <Group title="Canlı veri">
          <Switch
            label="Veriler kendiliğinden yenilensin"
            description="Kapatırsan rakamlar sabit kalır."
            checked={settings.live}
            onChange={(live) => update({ live })}
          />
          <Segmented
            label="Yenileme sıklığı"
            value={settings.liveInterval}
            onChange={(liveInterval) => update({ liveInterval })}
            options={[
              { value: 1500, label: 'Hızlı' },
              { value: 3000, label: 'Normal' },
              { value: 6000, label: 'Yavaş' },
            ]}
          />
        </Group>

        <button type="button" className="neo-btn mt-auto" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Varsayılana dön
        </button>
      </Surface>
    </>
  )
}
