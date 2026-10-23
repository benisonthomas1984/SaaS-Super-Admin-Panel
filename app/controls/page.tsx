import { ModulePage } from '@/components/admin/module-page'
import { AbuseSection, AlertsSection, KillSection, LimitsSection } from '@/components/modules/controls'

export const metadata = { title: 'Budgets & emergency — Ledgerline Superadmin' }

export default function ControlsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA12" title="Budgets and emergency controls" searchParams={searchParams} sections={{
      limits: LimitsSection, kill: KillSection, abuse: AbuseSection, alerts: AlertsSection,
    }} />
  )
}
