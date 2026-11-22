import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { DesignProvider } from '@/components/providers/design-provider'
import { LiveDataProvider } from '@/components/providers/live-data-provider'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bugün işler nasıl? | Canlı KPI panosu',
  description:
    'Neomorph ve claymorph stilinde, herkesin kolayca anlayabileceği canlı KPI panosu. Her kartta grafiği tek dokunuşla değiştir.',
}

export const viewport: Viewport = {
  themeColor: '#e7effc',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" data-theme="light" className={nunito.variable} suppressHydrationWarning>
      <body className="antialiased">
        <DesignProvider>
          <LiveDataProvider>{children}</LiveDataProvider>
        </DesignProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
