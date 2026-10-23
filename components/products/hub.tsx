'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, Panel, Prov, Stat, inputCls } from '@/components/admin/ui'
import { can } from '@/lib/rbac'
import { BILLING_META, CONNECTION_META, EXECUTION_META, STATUS_TONE, type BillingOwner, type ExecutionMode } from '@/lib/products'
import { useProducts } from './products-context'

const usd = (n: number) => '$' + n.toLocaleString('en-US')

export function PortfolioSection() {
  const { products } = useProducts()
  const live = products.filter((p) => p.status !== 'archived')
  const revenue = live.reduce((s, p) => s + p.revenue, 0)
  const unallocatedRevenue = 1180
  const cost = live.reduce((s, p) => s + p.cost, 0)
  const unallocatedCost = 2740
  const totalRev = revenue + unallocatedRevenue
  const totalCost = cost + unallocatedCost
  const margin = ((totalRev - totalCost) / totalRev) * 100

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Recognized net revenue · all products" value={usd(totalRev)} kind="estimated" meta={`Includes ${usd(unallocatedRevenue)} unallocated`} />
        <Stat label="Cost of service · all products" value={usd(totalCost)} kind="estimated" meta={`Includes ${usd(unallocatedCost)} shared, unallocated`} />
        <Stat label="Platform gross margin" value={margin.toFixed(1) + '%'} kind="estimated" meta="Total profit ÷ total revenue — not an average of product margins" />
        <Stat label="Distinct paying companies" value="318" kind="reconciled" meta="34 companies use 2 products · counted once" />
      </div>

      <Panel title="Product comparison" features={['MP18', 'MP23']} description="Each product is an independently operated app. Rows add up to the portfolio total only together with the unallocated row.">
        <StateFrame features={['MP18']} cap="view.finance" incomplete="Data extraction API has no feeds yet — its metrics show as Unavailable, not zero.">
          <DataTable columns={[
            { key: 'p', label: 'Product' }, { key: 'st', label: 'Status' }, { key: 'conn', label: 'Connection' },
            { key: 'acc', label: 'Product accounts', align: 'right' }, { key: 'rev', label: 'Revenue', align: 'right' },
            { key: 'cost', label: 'Cost', align: 'right' }, { key: 'gm', label: 'Gross margin', align: 'right' }, { key: 'cov', label: 'Coverage' },
          ]} rows={[
            ...live.map((p) => {
              const none = p.revenue === 0 && p.connection === 'not_connected'
              return {
                p: <Link href={`/products/${p.id}`} className="font-medium text-primary hover:underline">{p.name}</Link>,
                st: <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>,
                conn: <Badge tone={CONNECTION_META[p.connection].tone}>{CONNECTION_META[p.connection].label}</Badge>,
                acc: none ? <Prov kind="na" label="Unavailable" /> : p.accounts.toString(),
                rev: none ? <Prov kind="na" label="Unavailable" /> : usd(p.revenue),
                cost: none ? <Prov kind="na" label="Unavailable" /> : usd(p.cost),
                gm: none ? '—' : (((p.revenue - p.cost) / p.revenue) * 100).toFixed(1) + '%',
                cov: none ? <Prov kind="incomplete" label="No feeds" /> : p.billingOwner === 'external' ? <Prov kind="provisional" label="Imported billing" /> : <Prov kind="estimated" />,
              }
            }),
            { p: <span className="italic text-muted-foreground">Unallocated / shared</span>, st: '—', conn: '—', acc: '—', rev: usd(unallocatedRevenue), cost: usd(unallocatedCost), gm: '—', cov: <Prov kind="allocated" label="Explicit remainder" /> },
            { p: <span className="font-semibold">Portfolio total</span>, st: '', conn: '', acc: <span title="Product account counts cannot be summed into unique companies">352 accounts · 318 companies</span>, rev: <span className="font-semibold">{usd(totalRev)}</span>, cost: <span className="font-semibold">{usd(totalCost)}</span>, gm: <span className="font-semibold">{margin.toFixed(1)}%</span>, cov: '' },
          ]} />
        </StateFrame>
      </Panel>

      <div className="grid grid-cols-2 gap-5">
        <Panel title="Integration exceptions" features={['MP21']}>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-start justify-between gap-3 rounded border p-2.5">
              <div><p className="font-medium">Support copilot · heartbeat 6 min old</p><p className="text-xs text-muted-foreground">Usage freshness target 2 min. 312 events in retry queue.</p></div>
              <Link href="/products/prd_01HQ9SUPCO?tab=health" className="text-xs text-primary hover:underline">Open health</Link>
            </li>
            <li className="flex items-start justify-between gap-3 rounded border p-2.5">
              <div><p className="font-medium">Data extraction API · URL only, not connected</p><p className="text-xs text-muted-foreground">An app URL does not connect anything. Run the connection wizard.</p></div>
              <Link href="/products/prd_01HR2EXTRA?tab=connect" className="text-xs text-primary hover:underline">Connect</Link>
            </li>
            <li className="flex items-start justify-between gap-3 rounded border p-2.5">
              <div><p className="font-medium">Document agent · 14 unrated usage records</p><p className="text-xs text-muted-foreground">Meter &quot;audio_seconds&quot; has no sell rate in Pro v3.</p></div>
              <Link href="/products/prd_01HQ7DOCAG?tab=usage" className="text-xs text-primary hover:underline">Review</Link>
            </li>
          </ul>
        </Panel>
        <Panel title="New-to-platform vs product adoption" features={['MP17', 'MP23']} description="A company already on one product that buys another is cross-sell, not a new platform customer.">
          <DataTable dense columns={[{ key: 'm', label: 'Oct MTD' }, { key: 'a', label: 'Document agent', align: 'right' }, { key: 'b', label: 'Support copilot', align: 'right' }, { key: 't', label: 'Platform', align: 'right' }]} rows={[
            { m: 'New paid product adoptions', a: '19', b: '11', t: '30 adoptions' },
            { m: 'of which cross-sell', a: '3', b: '6', t: '9' },
            { m: 'New-to-platform companies', a: '—', b: '—', t: '21' },
            { m: 'Product subscription cancellations', a: '4', b: '2', t: '6' },
            { m: 'Platform company churn', a: '—', b: '—', t: '3' },
          ]} />
        </Panel>
      </div>
    </div>
  )
}

export function ProductListSection() {
  const { products, setStatus } = useProducts()
  const { role } = useAdmin()
  const [filter, setFilter] = useState<string>('all')
  const [q, setQ] = useState('')
  const rows = products.filter((p) => (filter === 'all' || p.status === filter) && (p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())))

  return (
    <Panel title="Product registry" features={['MP01', 'MP26']} description="A product is an AI app you operate. It is not a customer. Customers subscribe to a product's packages." actions={<CreateProductButton />}>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <Field label="Search"><input className={inputCls + ' w-64'} placeholder="Name or product_id" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
        <Field label="Status">
          <select className={inputCls} value={filter} onChange={(e) => setFilter(e.target.value)}>
            {['all', 'draft', 'testing', 'active', 'suspended', 'archived'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <StateFrame features={['MP01']} cap="view.customer" emptyTitle="No products registered yet" emptyHint="Add your first product to start defining its packages and connecting its backend.">
        {rows.length === 0 ? (
          <p className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No products match this search.</p>
        ) : (
          <DataTable columns={[
            { key: 'p', label: 'Product' }, { key: 'id', label: 'product_id', mono: true }, { key: 'o', label: 'Owner' }, { key: 'st', label: 'Status' },
            { key: 'mode', label: 'Execution · enforcement' }, { key: 'bill', label: 'Billing owner' }, { key: 'pk', label: 'Packages', align: 'right' }, { key: 'act', label: 'Actions' },
          ]} rows={rows.map((p) => ({
            p: <Link href={`/products/${p.id}`} className="font-medium text-primary hover:underline">{p.name}</Link>,
            id: p.id,
            o: p.owner,
            st: <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>,
            mode: <span className="text-xs">{EXECUTION_META[p.execution].label}<br /><span className="text-muted-foreground">{EXECUTION_META[p.execution].enforcement}</span></span>,
            bill: <span className="text-xs">{p.billingOwner === 'central' ? 'Central' : 'External'}</span>,
            pk: p.packages.length.toString(),
            act: (
              <div className="flex flex-wrap gap-1.5">
                {p.status === 'suspended' ? (
                  <Button size="xs" variant="outline" disabled={!can(role, 'act.products')} onClick={() => setStatus(p.id, 'active')}>Resume</Button>
                ) : p.status !== 'archived' && (
                  <ActionButton size="xs" label="Suspend" cap="act.products" dialog={{
                    title: `Suspend ${p.name}`, feature: 'MP26', destructive: true, confirmText: p.slug,
                    impact: [`New reservations for ${p.name} are refused; other products keep running`, 'Running tasks finish within their existing reservation (PD05 assumption)', 'Already-incurred cost settles into history and does not vanish', 'Signed product.suspended event sent to the app'],
                    uncertain: 'Tasks executing inside the app at the moment of suspension may still complete and report usage afterwards.',
                  }} />
                )}
                {p.status !== 'archived' && (
                  <ActionButton size="xs" label="Archive" cap="act.products" dialog={{
                    title: `Archive ${p.name}`, feature: 'MP01', destructive: true, confirmText: p.slug,
                    impact: [`${p.packages.length} packages stop new sales; existing subscriber terms are preserved`, `${p.accounts} product accounts keep history and reports`, p.accounts > 0 ? 'Active obligations must be resolved first — archive will be blocked until they are' : 'No active obligations'],
                  }} />
                )}
              </div>
            ),
          }))} />
        )}
      </StateFrame>
      <div className="mt-3"><Assumption decision="PD05">Suspending a product lets in-flight tasks finish within their reservation and blocks new ones. Configurable in Open decisions.</Assumption></div>
    </Panel>
  )
}

function CreateProductButton() {
  const { role, record } = useAdmin()
  const { createProduct } = useProducts()
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', owner: '', appUrl: '', execution: 'instrumented_direct' as ExecutionMode, billingOwner: 'central' as BillingOwner, creditUnit: 'credit' })
  const allowed = can(role, 'act.products')
  const valid = form.name.trim().length >= 2 && /^[a-z0-9-]{2,}$/.test(form.slug)

  return (
    <>
      <Button size="sm" disabled={!allowed} onClick={() => { setOpen(true); setCreated(null) }} title={allowed ? undefined : 'Requires product registry permission'}>
        <Plus /> Add product
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6">
          <div role="dialog" aria-modal="true" aria-labelledby="new-product-title" className="w-full max-w-xl rounded-md border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 id="new-product-title" className="text-base font-semibold">Add product (draft) · POST /admin/products</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close"><X className="size-4" /></button>
            </div>
            {created ? (
              <div className="flex flex-col gap-3 px-5 py-4 text-sm">
                <Callout tone="info" title="Product created as draft">
                  Returned <span className="font-mono">product_id: {created}</span>. Next: add packages, then connect the backend. Nothing is connected yet.
                </Callout>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                  <Link href={`/products/${created}?tab=packages`} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add packages</Link>
                </div>
              </div>
            ) : (
              <form className="flex flex-col gap-3 px-5 py-4" onSubmit={(e) => {
                e.preventDefault()
                if (!valid) return
                const id = createProduct(form)
                record({ action: 'product.create', target: id, reason: `Draft product ${form.name}` })
                setCreated(id)
              }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Product name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="e.g. Contract reviewer" /></Field>
                  <Field label="Slug" hint="Lowercase, unique on the platform"><input required className={inputCls + ' font-mono'} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
                  <Field label="Owner"><input className={inputCls} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Person accountable" /></Field>
                  <Field label="App URL" hint="Descriptive only — does not connect"><input className={inputCls} value={form.appUrl} onChange={(e) => setForm({ ...form, appUrl: e.target.value })} placeholder="https://" /></Field>
                  <Field label="Execution mode">
                    <select className={inputCls} value={form.execution} onChange={(e) => setForm({ ...form, execution: e.target.value as ExecutionMode })}>
                      {(Object.keys(EXECUTION_META) as ExecutionMode[]).map((k) => <option key={k} value={k}>{EXECUTION_META[k].label}</option>)}
                    </select>
                  </Field>
                  <Field label="Billing owner">
                    <select className={inputCls} value={form.billingOwner} onChange={(e) => setForm({ ...form, billingOwner: e.target.value as BillingOwner })}>
                      <option value="central">{BILLING_META.central}</option>
                      <option value="external">{BILLING_META.external}</option>
                    </select>
                  </Field>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{EXECUTION_META[form.execution].enforcement}.</p>
                {!valid && form.slug && <p className="text-xs text-destructive" role="alert">Slug must be at least 2 characters: lowercase letters, numbers and hyphens.</p>}
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={!valid}>Create draft</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function IdentitySection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Canonical companies and product accounts" features={['MP09', 'MP23']} description="One verified company can own accounts in several products. Matching IDs or emails never link them automatically.">
        <StateFrame features={['MP09']} cap="view.customer">
          <DataTable columns={[{ key: 'c', label: 'Canonical company' }, { key: 'a', label: 'Document agent account' }, { key: 'b', label: 'Support copilot account' }, { key: 's', label: 'Subscriptions' }, { key: 'st', label: 'Link status' }]} rows={[
            { c: 'CO-10482 Northwind Logistics', a: <span className="font-mono text-xs">pa_A_7781 · ext customer_123</span>, b: <span className="font-mono text-xs">pa_B_2210 · ext nw-logistics</span>, s: 'A-Pro v3 · B-Starter v1', st: <Badge tone="good">Verified link</Badge> },
            { c: '— (unlinked)', a: <span className="font-mono text-xs">pa_A_9012 · ext customer_456</span>, b: '—', s: 'A-Starter v2', st: <Badge tone="outline">Single product</Badge> },
            { c: '— (unlinked)', a: '—', b: <span className="font-mono text-xs">pa_B_3391 · ext customer_123</span>, s: 'B-Pro v1', st: <Badge tone="warn">Same external ID as A · not linked</Badge> },
          ]} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Link proposals" features={['MP23']}>
          <div className="rounded border p-3 text-sm">
            <p className="font-medium">Propose: pa_B_3391 → CO-10233 Atlas Freight Inc.</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Evidence: matching billing tax ID and signed contract C-318. Identical external ID &quot;customer_123&quot; with Document agent is a collision, not evidence.</p>
            <div className="mt-3 flex gap-2">
              <ActionButton size="xs" label="Approve link" cap="act.security" dialog={{ title: 'Link product account to canonical company', feature: 'MP23', secondReview: true, impact: ['Platform unique-company count stays 318 (company already counted)', 'Subscriptions and wallets remain separate per product', 'Cross-product revenue roll-up now includes this account'] }} />
              <ActionButton size="xs" label="Reject" cap="act.security" dialog={{ title: 'Reject link proposal', feature: 'MP23', impact: ['Accounts stay unlinked', 'Proposal kept in audit'] }} />
            </div>
          </div>
          <div className="mt-3"><Assumption decision="PD02">Cross-product links need a Security or Owner approver plus a second reviewer.</Assumption></div>
        </Panel>
        <Panel title="Churn bridge" features={['MP23']} description="Product cancellation is not the same as losing the company.">
          <DataTable dense columns={[{ key: 'k', label: 'Event' }, { key: 'v', label: 'Count', align: 'right' }]} rows={[
            { k: 'Product subscriptions cancelled', v: '6' },
            { k: '… company still active on another product', v: '3' },
            { k: 'Platform companies churned', v: '3' },
          ]} />
        </Panel>
      </div>
    </div>
  )
}

export function MigrationSection() {
  return (
    <div className="flex flex-col gap-5">
      <Callout tone="warn" title="Existing plans are not yet mapped to products">
        The current Plans module (Starter, Growth, Scale, Enterprise) is platform-wide. Until this migration is approved, those plans are shown under a &quot;Legacy platform&quot; product. History is never assigned to a guessed product.
      </Callout>
      <Panel title="Migration preview" features={['MP27']} description="Rehearse in staging, reconcile before/after controls, then apply.">
        <StateFrame features={['MP27']} cap="view.finance">
          <DataTable columns={[{ key: 'r', label: 'Record type' }, { key: 'n', label: 'Records', align: 'right' }, { key: 'm', label: 'Mapped', align: 'right' }, { key: 'u', label: 'Unmapped', align: 'right' }, { key: 'rule', label: 'Mapping rule' }]} rows={[
            { r: 'Plans → packages', n: '6', m: '6', u: '0', rule: 'Plan = package under Legacy platform product' },
            { r: 'Subscriptions', n: '412', m: '388', u: <span className="text-warn">24</span>, rule: 'Known product from task feature key' },
            { r: 'Usage records (90 d)', n: '1.84M', m: '1.79M', u: <span className="text-warn">51,230</span>, rule: 'Feature key → product' },
            { r: 'Invoices', n: '1,206', m: '1,206', u: '0', rule: 'Line-level product from subscription' },
            { r: 'Wallets', n: '361', m: '337', u: <span className="text-warn">24</span>, rule: 'One wallet per product account' },
          ]} />
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Stat label="Revenue control · before → after" value="$100,440 → $100,440" kind="reconciled" meta="Difference $0" />
            <Stat label="Credit balance control" value="48.2M → 48.2M" kind="reconciled" meta="Difference 0 credits" />
            <Stat label="Unmapped history" value="51,230 rows" kind="incomplete" meta="Excluded from package metrics, kept in totals" />
          </div>
        </StateFrame>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton label="Run staging rehearsal" cap="act.integration" dialog={{ title: 'Run migration rehearsal in staging', feature: 'MP27', impact: ['Copies production snapshot to staging', 'Applies mapping and recomputes controls', 'No production records change'] }} />
          <ActionButton label="Apply to production" cap="act.integration" variant="default" dialog={{ title: 'Apply product migration', feature: 'MP27', destructive: true, secondReview: true, confirmText: 'MIGRATE', impact: ['Backfills product_id and product_account_id on 1.79M records', '24 subscriptions stay in the unmapped queue', 'Old identifiers kept for API compatibility', 'Rollback plan RB-07 available for 14 days'] }} />
        </div>
        <div className="mt-3"><Assumption decision="PD08">A &quot;Legacy platform&quot; product holds only records whose owner is known.</Assumption></div>
      </Panel>
    </div>
  )
}
