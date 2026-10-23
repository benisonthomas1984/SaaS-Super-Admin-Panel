import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { AdminProvider } from '@/components/admin/admin-context'
import { AdminShell } from '@/components/admin/shell'
import './globals.css'

const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex-sans' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' })

export const metadata: Metadata = {
  title: 'Ledgerline Superadmin — AI SaaS control panel (design spec)',
  description:
    'Traceable superadmin design for a multi-tenant AI SaaS: 16 modules, 64 subfeatures, coverage matrix, estimated vs reconciled figures.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#121d24',
  width: 1280,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`bg-background ${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <AdminProvider>
          <AdminShell>{children}</AdminShell>
        </AdminProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
