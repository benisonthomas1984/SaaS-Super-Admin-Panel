import { ModulePage } from '@/components/admin/module-page'
import { ReconcileSection, RatesSection, SharedCostsSection, TasksSection } from '@/components/modules/usage'

export const metadata = { title: 'Usage & cost — Ledgerline Superadmin' }

export default function UsagePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA03" title="Usage and cost attribution" searchParams={searchParams} sections={{
      tasks: TasksSection, rates: RatesSection, shared: SharedCostsSection, reconcile: ReconcileSection,
    }} />
  )
}
