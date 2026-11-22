'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Moon, Palette, Sun } from 'lucide-react'
import { ChartView } from '@/components/charts/chart-view'
import { IconChip, LiveDot } from '@/components/ds/atoms'
import { Segmented } from '@/components/ds/controls'
import { Surface } from '@/components/ds/surface'
import { KpiCard } from '@/components/kpi/kpi-card'
import { useDesign } from '@/components/providers/design-provider'
import { useLiveData } from '@/components/providers/live-data-provider'
import { CHART_META } from '@/lib/chart-registry'
import { getTrend } from '@/lib/metric-utils'
import { DesignPanel } from './design-panel'
import { Smile } from 'lucide-react'

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <div>
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <p className="text-fg-soft">{subtitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

function Header() {
  const { settings, update, setPanelOpen } = useDesign()
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <IconChip icon={Smile} tone="brand" size="lg" />
        <div>
          <h1 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">Bugün işler nasıl?</h1>
          <p className="text-fg-soft">Dükkanının önemli rakamları, tek bakışta.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LiveDot />
        <Segmented
          label="Tema"
          value={settings.theme}
          onChange={(theme) => update({ theme })}
          hideLabels
          options={[
            { value: 'light', label: 'Açık tema', icon: Sun },
            { value: 'dark', label: 'Koyu tema', icon: Moon },
          ]}
        />
        <button type="button" className="neo-btn neo-btn-primary" onClick={() => setPanelOpen(true)}>
          <Palette className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline">Görünümü ayarla</span>
          <span className="sr-only sm:hidden">Görünümü ayarla</span>
        </button>
      </div>
    </header>
  )
}

function Summary() {
  const { metrics } = useLiveData()
  const { good, watch } = useMemo(() => {
    const statuses = metrics.map((metric) => getTrend(metric).status)
    return {
      good: statuses.filter((status) => status === 'good').length,
      watch: statuses.filter((status) => status === 'watch').length,
    }
  }, [metrics])

  return (
    <Surface tone="strong" className="anim-rise flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
      <div className="max-w-xl">
        <p className="text-sm font-bold uppercase tracking-wide opacity-90">Genel durum</p>
        <p className="mt-1 text-balance text-2xl font-extrabold leading-snug sm:text-3xl">
          {good} gösterge iyi gidiyor{watch > 0 ? `, ${watch} tanesine göz atmakta fayda var.` : '.'}
        </p>
        <p className="mt-2 opacity-90">Her kartın sağ üstündeki “Görünüm” düğmesiyle grafiği dilediğin gibi değiştirebilirsin.</p>
      </div>
      <div className="flex gap-3">
        <div className="neo-well pal-blue min-w-24 px-5 py-3 text-center" style={{ background: 'rgba(255,255,255,0.14)' }}>
          <p className="text-3xl font-extrabold tabular-nums">{good}</p>
          <p className="text-sm font-bold">İyi</p>
        </div>
        <div className="neo-well pal-blue min-w-24 px-5 py-3 text-center" style={{ background: 'rgba(255,255,255,0.14)' }}>
          <p className="text-3xl font-extrabold tabular-nums">{watch}</p>
          <p className="text-sm font-bold">Dikkat</p>
        </div>
      </div>
    </Surface>
  )
}

function Gallery() {
  const { metrics, byId } = useLiveData()
  const [selected, setSelected] = useState(metrics[0]?.id ?? '')
  const metric = byId[selected] ?? metrics[0]
  if (!metric) return null

  return (
    <section className="grid gap-5" aria-labelledby="gallery-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="gallery-title" className="text-2xl font-extrabold">Tüm grafik seçenekleri</h2>
          <p className="text-fg-soft">Bir gösterge seç, ona uyan bütün görünümleri yan yana gör.</p>
        </div>
        <label className="grid gap-1.5 text-sm font-bold">
          Gösterge
          <select
            value={metric.id}
            onChange={(event) => setSelected(event.target.value)}
            className="neo-well min-h-11 min-w-56 cursor-pointer px-4 font-bold"
          >
            {metrics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metric.supports.map((type, index) => {
          const meta = CHART_META[type]
          const Icon = meta.icon
          return (
            <Surface
              key={`${metric.id}-${type}`}
              tone="inset"
              className="anim-rise flex flex-col gap-3 p-5"
              style={{ ['--i' as string]: index }}
            >
              <div className="flex items-center gap-3">
                <IconChip icon={Icon} tone={metric.chip} size="sm" />
                <div>
                  <h3 className="font-extrabold leading-tight">{meta.label}</h3>
                  <p className="text-sm text-fg-soft">{meta.hint}</p>
                </div>
              </div>
              <ChartView metric={metric} type={type} height={150} />
            </Surface>
          )
        })}
      </div>
    </section>
  )
}

export function Dashboard() {
  return (
    <div className="relative isolate overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="blob absolute -left-24 top-10 size-96 rounded-full opacity-40 blur-3xl" style={{ background: 'var(--c2)' }} />
        <div className="blob absolute -right-24 top-96 size-[28rem] rounded-full opacity-30 blur-3xl [animation-delay:-6s]" style={{ background: 'var(--c3)' }} />
      </div>
      <a href="#icerik" className="skip-link neo-btn neo-btn-primary">
        İçeriğe geç
      </a>
      <main id="icerik" className="mx-auto grid max-w-[88rem] gap-10 px-4 py-6 sm:px-8 sm:py-10">
        <Header />
        <Summary />
        <Section title="Bugünün özeti" subtitle="Satış, ziyaretçi ve yeni müşteriler.">
          <KpiCard metricId="sales" tone="strong" index={1} />
          <KpiCard metricId="visitors" index={2} />
          <KpiCard metricId="newCustomers" index={3} />
        </Section>
        <Section title="Hedeflerimize ne kadar yakınız?" subtitle="Dolu kısım, hedefe ne kadar geldiğini gösterir.">
          <KpiCard metricId="monthlyGoal" index={1} />
          <KpiCard metricId="satisfaction" tone="strong" index={2} />
          <KpiCard metricId="delivery" index={3} />
        </Section>
        <Section title="Neyin payı ne kadar?" subtitle="Parçaların bütün içindeki yerini gör.">
          <KpiCard metricId="channels" index={1} />
          <KpiCard metricId="expenses" index={2} />
          <KpiCard metricId="topProducts" tone="strong" index={3} />
        </Section>
        <Section title="Dikkat edilecekler" subtitle="Bekleme ve iade gibi, düşük olması iyi olan rakamlar.">
          <KpiCard metricId="waitTime" index={1} />
          <KpiCard metricId="returns" index={2} />
        </Section>
        <Gallery />
      </main>
      <DesignPanel />
    </div>
  )
}
