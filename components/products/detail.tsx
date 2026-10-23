'use client'

import Link from 'next/link'
import { Badge, Callout, PageHeader, Tabs } from '@/components/admin/ui'
import { CONNECTION_META, STATUS_TONE } from '@/lib/products'
import { useProducts } from './products-context'
import { BuilderSection, PackagesSection, VersionsSection } from './catalogue'
import { ConnectSection, CredentialsSection, ReadinessSection, WebhooksSection } from './integration'
import { AccountsSection, SubscriptionsSection, UsageSection, WalletSection } from './runtime'
import { AuditSection, FinanceSection, GrowthSection, HealthSection, OverviewSection } from './operations'

const TABS: { id: string; label: string; featureId: string; render: (id: string) => React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', featureId: 'MP01', render: (id) => <OverviewSection productId={id} /> },
  { id: 'packages', label: 'Packages', featureId: 'MP02', render: (id) => <PackagesSection productId={id} /> },
  { id: 'builder', label: 'Package builder', featureId: 'MP04–06', render: (id) => <BuilderSection productId={id} /> },
  { id: 'versions', label: 'Versions & publish', featureId: 'MP03', render: (id) => <VersionsSection productId={id} /> },
  { id: 'connect', label: 'Connect', featureId: 'MP07', render: (id) => <ConnectSection productId={id} /> },
  { id: 'readiness', label: 'Readiness', featureId: 'MP21', render: (id) => <ReadinessSection productId={id} /> },
  { id: 'credentials', label: 'Credentials & access', featureId: 'MP08', render: (id) => <CredentialsSection productId={id} /> },
  { id: 'accounts', label: 'Accounts', featureId: 'MP09', render: (id) => <AccountsSection productId={id} /> },
  { id: 'subscriptions', label: 'Subscriptions', featureId: 'MP10–11', render: (id) => <SubscriptionsSection productId={id} /> },
  { id: 'wallet', label: 'Wallet', featureId: 'MP12', render: (id) => <WalletSection productId={id} /> },
  { id: 'usage', label: 'Usage & tasks', featureId: 'MP13–14', render: (id) => <UsageSection productId={id} /> },
  { id: 'growth', label: 'Acquisition', featureId: 'MP17', render: (id) => <GrowthSection productId={id} /> },
  { id: 'finance', label: 'Billing & profit', featureId: 'MP15–16', render: (id) => <FinanceSection productId={id} /> },
  { id: 'webhooks', label: 'Webhooks', featureId: 'MP19', render: (id) => <WebhooksSection productId={id} /> },
  { id: 'health', label: 'Health & jobs', featureId: 'MP20', render: (id) => <HealthSection productId={id} /> },
  { id: 'audit', label: 'Audit & API', featureId: 'MP24–25', render: (id) => <AuditSection productId={id} /> },
]

export function ProductDetail({ id, tab }: { id: string; tab?: string }) {
  const { get } = useProducts()
  const product = get(id)
  if (!product) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader moduleId="MP01 · Product" title="Product not found" description={`No product with id ${id} in this environment.`} />
        <Callout tone="bad" title="404 · Unknown product_id">It may have been created in another session or environment. <Link href="/products?tab=list" className="font-medium underline">Back to products</Link></Callout>
      </div>
    )
  }
  const active = TABS.find((t) => t.id === tab) ?? TABS[0]
  return (
    <>
      <p className="mb-2 text-xs text-muted-foreground"><Link href="/products?tab=list" className="hover:underline">Products</Link> › {product.name}</p>
      <PageHeader moduleId={`MP01 · ${product.id}`} title={product.name}
        description={`${product.packages.length} packages · ${product.accounts} product accounts. Everything on this page is scoped to this product only.`}
        actions={<div className="flex gap-2"><Badge tone={STATUS_TONE[product.status]}>{product.status}</Badge><Badge tone={CONNECTION_META[product.connection].tone}>{CONNECTION_META[product.connection].label}</Badge></div>} />
      <Tabs basePath={`/products/${product.id}`} active={active.id} tabs={TABS.map(({ id: t, label, featureId }) => ({ id: t, label, featureId }))} />
      {active.render(product.id)}
    </>
  )
}
