import { ModulePage } from '@/components/admin/module-page'
import { CollectionsSection, InvoicesSection, PaymentsSection, RefundsSection } from '@/components/modules/billing'

export const metadata = { title: 'Billing — Ledgerline Superadmin' }

export default function BillingPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA06" title="Billing and collections" searchParams={searchParams} sections={{
      invoices: InvoicesSection, payments: PaymentsSection, collections: CollectionsSection, refunds: RefundsSection,
    }} />
  )
}
