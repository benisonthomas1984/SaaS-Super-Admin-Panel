import { PageHeader, FeatureTag } from '@/components/admin/ui'
import { CustomersList } from '@/components/modules/customers-list'

export const metadata = { title: 'Customers — Ledgerline Superadmin' }

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        moduleId="SA02 · Customers and tenancy"
        title="Customers"
        description="Companies are the billing owner. Every row uses a stable company ID; similar names are disambiguated by ID, domain and billing reference."
        actions={<><FeatureTag id="SA02.01" /><FeatureTag id="SA02.03" /></>}
      />
      <CustomersList />
    </>
  )
}
