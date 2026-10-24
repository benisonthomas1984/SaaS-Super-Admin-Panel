import Link from 'next/link'
import { Badge, DataTable, PageHeader, Panel, Tabs } from '@/components/admin/ui'
import { MP_REQUIREMENTS, PRODUCT_CONTRADICTIONS, PRODUCT_DECISIONS, ROUTE_MAP, SCREENS } from '@/lib/products'

export const metadata = { title: 'Multi-product addendum coverage · Superadmin' }

const COV = { designed: ['good', 'Designed'], assumption: ['warn', 'Designed · assumption'], partial: ['bad', 'Partial'], backend: ['outline', 'Backend deliverable'] } as const

function Coverage() {
  const count = (k: keyof typeof COV) => MP_REQUIREMENTS.filter((r) => r.coverage === k).length
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">{MP_REQUIREMENTS.length} requirements · {count('designed')} designed · {count('assumption')} designed on an assumption · {count('partial')} partial · {count('backend')} backend-only deliverable.</p>
      <Panel title="MP requirement coverage" features={['MP28']}>
        <DataTable columns={[{ key: 'id', label: 'ID', mono: true }, { key: 't', label: 'Requirement' }, { key: 's', label: 'Screens' }, { key: 'w', label: 'Where' }, { key: 'b', label: 'Extends' }, { key: 'c', label: 'Coverage' }]} rows={MP_REQUIREMENTS.map((r) => ({
          id: r.id, t: <span>{r.title}{r.note && <span className="block text-[11px] text-muted-foreground">{r.note}</span>}</span>, s: r.screens.join(', '),
          w: <Link href={r.where} className="text-primary hover:underline">Open</Link>, b: <span className="text-xs">{r.baseline}</span>,
          c: <Badge tone={COV[r.coverage][0]}>{COV[r.coverage][1]}</Badge>,
        }))} />
      </Panel>
    </div>
  )
}

function Screens() {
  return (
    <Panel title="Screen inventory S01–S18" features={['MP28']}>
      <DataTable columns={[{ key: 'id', label: 'Screen', mono: true }, { key: 't', label: 'Title' }, { key: 'r', label: 'Route' }, { key: 'm', label: 'Requirements' }]} rows={SCREENS.map((s) => ({ id: s.id, t: s.title, r: <span className="font-mono text-xs">{s.route}</span>, m: s.mp }))} />
    </Panel>
  )
}

function Decisions() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Open product decisions" features={['MP28']} description="Each is a configurable option. The highlighted option is what the screens currently assume.">
        <DataTable columns={[{ key: 'id', label: 'ID', mono: true }, { key: 't', label: 'Decision' }, { key: 'o', label: 'Options' }, { key: 'a', label: 'Affects' }]} rows={PRODUCT_DECISIONS.map((d) => ({
          id: d.id, t: d.title,
          o: <ul className="flex flex-col gap-1">{d.options.map((o, i) => <li key={o} className={i === d.assumed ? 'font-medium text-warn' : 'text-muted-foreground'}>{i === d.assumed ? 'Assumed: ' : 'Alt: '}{o}</li>)}</ul>,
          a: d.affects,
        }))} />
      </Panel>
      <Panel title="Contradictions with the baseline design" features={['MP22']}>
        <ul className="flex flex-col gap-3">
          {PRODUCT_CONTRADICTIONS.map((c) => (
            <li key={c.id} className="rounded border p-3 text-sm"><p className="font-medium"><span className="font-mono text-xs text-muted-foreground">{c.id}</span> {c.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.detail}</p></li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Api() {
  return (
    <Panel title="Endpoint map" features={['MP25']} description="Admin routes are used by this panel. Integration routes are called by product backends with scoped credentials.">
      <DataTable columns={[{ key: 'g', label: 'Group' }, { key: 'k', label: 'Caller' }, { key: 'e', label: 'Endpoints', mono: true }, { key: 'r', label: 'Routes', mono: true }, { key: 's', label: 'Screen' }]} rows={ROUTE_MAP.map((r) => ({
        g: r.group, k: <Badge tone={r.admin ? 'neutral' : 'outline'}>{r.admin ? 'Admin UI' : 'Product backend'}</Badge>, e: r.eps, r: r.routes, s: r.screen,
      }))} />
    </Panel>
  )
}

function Baseline() {
  const rows = [
    ['SA01 Executive dashboard', 'Product filter added; portfolio view in Products'],
    ['SA02 Customers', 'Customer = canonical company; product accounts listed per product'],
    ['SA03 Usage', 'Usage carries product_id; per-product explorer'],
    ['SA04 Credits', 'Wallets are per product account (PD01)'],
    ['SA05 Plans', 'Becomes Legacy platform product until migration (PC01)'],
    ['SA06 Billing', 'Central or external billing owner per product'],
    ['SA07 Profitability', 'Product and package profitability with unallocated row'],
    ['SA08 Acquisition', 'Cross-sell separated from new-to-platform'],
    ['SA12 Controls', 'Per-product pause and enforcement level'],
    ['SA13 Security', 'Product-scoped credentials and grants'],
    ['SA16 Developer', 'Customer keys stay separate from product credentials (PC03)'],
  ]
  return (
    <Panel title="Baseline features preserved with product context" features={['MP22']}>
      <DataTable columns={[{ key: 'm', label: 'Module' }, { key: 'c', label: 'Change' }]} rows={rows.map(([m, c]) => ({ m, c }))} />
    </Panel>
  )
}

const TABS = [
  { id: 'coverage', label: 'MP coverage', featureId: 'MP28', render: () => <Coverage /> },
  { id: 'screens', label: 'Screens S01–S18', featureId: 'MP28', render: () => <Screens /> },
  { id: 'decisions', label: 'Decisions & contradictions', featureId: 'PD', render: () => <Decisions /> },
  { id: 'api', label: 'API map', featureId: 'MP25', render: () => <Api /> },
  { id: 'baseline', label: 'Baseline impact', featureId: 'MP22', render: () => <Baseline /> },
]

export default async function AddendumPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const active = TABS.find((t) => t.id === tab) ?? TABS[0]
  return (
    <>
      <PageHeader moduleId="Specification · Multi-product API addendum" title="Multi-product addendum coverage" description="Traceability from MP01–MP28 to screens, open decisions, contradictions and the API endpoint map." />
      <Tabs basePath="/spec/addendum" active={active.id} tabs={TABS} />
      {active.render()}
    </>
  )
}
