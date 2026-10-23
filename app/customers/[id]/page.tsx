import Link from 'next/link'
import { notFound } from 'next/navigation'
import { company } from '@/lib/sample-data'
import { PageHeader, Tabs } from '@/components/admin/ui'
import { DataRequests, LifecycleActions, Overview360, Workspaces } from '@/components/modules/customer-detail'

const TABS = [
  { id: 'overview', label: 'Overview', featureId: 'SA02.03' },
  { id: 'workspaces', label: 'Workspaces & members', featureId: 'SA02.02' },
  { id: 'data', label: 'Closure & data requests', featureId: 'SA02.04' },
]

export default async function CustomerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params
  const { tab } = await searchParams
  const c = company(id)
  if (!c) notFound()
  const active = TABS.find((t) => t.id === tab)?.id ?? 'overview'

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-2 text-xs text-muted-foreground">
        <Link href="/customers" className="hover:underline">Customers</Link> / <span className="font-mono">{c.id}</span>
      </nav>
      <PageHeader moduleId="SA02 · Customer account 360" title={c.name} description={`${c.domain} · ${c.region} · ${c.plan} ${c.planVersion} · data last synced ${c.lastSync}`} actions={<LifecycleActions c={c} />} />
      <Tabs basePath={`/customers/${c.id}`} active={active} tabs={TABS} />
      {active === 'overview' && <Overview360 c={c} />}
      {active === 'workspaces' && <Workspaces c={c} />}
      {active === 'data' && <DataRequests c={c} />}
    </>
  )
}
