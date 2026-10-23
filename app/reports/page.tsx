import { PageHeader, Tabs } from '@/components/admin/ui'
import { SavedViewsSection, ScheduledSection } from '@/components/modules/reports'

export const metadata = { title: 'Reports & saved views — Ledgerline Superadmin' }

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const active = tab === 'scheduled' ? 'scheduled' : 'views'
  return (
    <>
      <PageHeader moduleId="SA01 · Business overview" title="Reports and saved views" description="Drill from any metric to its evidence, save scoped views, and schedule permission-filtered deliveries." />
      <Tabs basePath="/reports" active={active} tabs={[
        { id: 'views', label: 'Drill-down and saved views', featureId: 'SA01.02' },
        { id: 'scheduled', label: 'Scheduled reports and exports', featureId: 'SA01.04' },
      ]} />
      {active === 'views' ? <SavedViewsSection /> : <ScheduledSection />}
    </>
  )
}
