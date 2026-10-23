import Link from 'next/link'
import { ModulePage } from '@/components/admin/module-page'
import { Callout } from '@/components/admin/ui'
import { CatalogueSection, ChangesSection, OffersSection, PricingSection } from '@/components/modules/plans'

export const metadata = { title: 'Plans & pricing — Ledgerline Superadmin' }

export default function PlansPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <>
      <div className="mb-4">
        <Callout tone="warn" title="Legacy platform plans (PC01)">
          These plans predate products. New packages are created inside a product. <Link href="/products?tab=list" className="font-medium underline">Open Products</Link> · <Link href="/products?tab=migration" className="font-medium underline">Migration</Link>
        </Callout>
      </div>
      <ModulePage moduleId="SA05" title="Plans and entitlements" searchParams={searchParams} sections={{
        catalogue: CatalogueSection, pricing: PricingSection, offers: OffersSection, changes: ChangesSection,
      }} />
    </>
  )
}
