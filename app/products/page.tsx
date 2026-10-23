import { PageHeader, Tabs } from '@/components/admin/ui'
import { IdentitySection, MigrationSection, PortfolioSection, ProductListSection } from '@/components/products/hub'

export const metadata = { title: 'Products · Superadmin' }

const TABS = [
  { id: 'portfolio', label: 'Portfolio', featureId: 'MP18', render: () => <PortfolioSection /> },
  { id: 'list', label: 'Product registry', featureId: 'MP01', render: () => <ProductListSection /> },
  { id: 'identity', label: 'Companies across products', featureId: 'MP23', render: () => <IdentitySection /> },
  { id: 'migration', label: 'Migration', featureId: 'MP27', render: () => <MigrationSection /> },
]

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const active = TABS.find((t) => t.id === tab) ?? TABS[0]
  return (
    <>
      <PageHeader moduleId="MP · Multi-product addendum" title="Products"
        description="Each AI app you operate is a product with its own packages, wallets, backend connection and profit. Portfolio totals combine them without double counting companies." />
      <Tabs basePath="/products" active={active.id} tabs={TABS} />
      {active.render()}
    </>
  )
}
