import { ModulePage } from '@/components/admin/module-page'
import { CatalogueSection, ChangesSection, OffersSection, PricingSection } from '@/components/modules/plans'

export const metadata = { title: 'Plans & pricing — Ledgerline Superadmin' }

export default function PlansPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA05" title="Plans and entitlements" searchParams={searchParams} sections={{
      catalogue: CatalogueSection, pricing: PricingSection, offers: OffersSection, changes: ChangesSection,
    }} />
  )
}
