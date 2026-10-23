import { ModulePage } from '@/components/admin/module-page'
import { ClassificationSection, CloseSection, OperatingSection, UnitEconomicsSection } from '@/components/modules/profitability'

export const metadata = { title: 'Profitability — Ledgerline Superadmin' }

export default function ProfitabilityPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA07" title="Profitability" searchParams={searchParams} sections={{
      classification: ClassificationSection, unit: UnitEconomicsSection, operating: OperatingSection, close: CloseSection,
    }} />
  )
}
