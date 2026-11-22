'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DesignSettings } from '@/lib/types'

export const DEFAULT_SETTINGS: DesignSettings = {
  theme: 'light',
  style: 'mix',
  radius: 'soft',
  depth: 1,
  motion: 'lively',
  textSize: 'md',
  accent: 'sky',
  live: true,
  liveInterval: 3000,
}

interface DesignContextValue {
  settings: DesignSettings
  update: (patch: Partial<DesignSettings>) => void
  reset: () => void
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

const DesignContext = createContext<DesignContextValue | null>(null)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DesignSettings>(DEFAULT_SETTINGS)
  const [panelOpen, setPanelOpen] = useState(false)

  const update = useCallback((patch: Partial<DesignSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings((current) => ({ ...current, motion: 'off' }))
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.dataset.style = settings.style
    root.dataset.radius = settings.radius
    root.dataset.motion = settings.motion
    root.dataset.text = settings.textSize
    root.dataset.accent = settings.accent
    root.style.setProperty('--d', String(settings.depth))
    const themeColor = document.querySelector('meta[name="theme-color"]')
    themeColor?.setAttribute('content', settings.theme === 'dark' ? '#255ee3' : '#e7effc')
  }, [settings])

  const value = useMemo(
    () => ({ settings, update, reset, panelOpen, setPanelOpen }),
    [settings, update, reset, panelOpen],
  )

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}

export function useDesign() {
  const context = useContext(DesignContext)
  if (!context) throw new Error('useDesign, DesignProvider içinde kullanılmalı')
  return context
}
