import { ModulePage } from '@/components/admin/module-page'
import { AttributionSection, CacSection, FunnelSection, PaybackSection } from '@/components/modules/growth'

export const metadata = { title: 'Acquisition — Ledgerline Superadmin' }

export default function GrowthPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA08" title="Acquisition" searchParams={searchParams} sections={{
      attribution: AttributionSection, cac: CacSection, funnel: FunnelSection, payback: PaybackSection,
    }} />
  )
}
