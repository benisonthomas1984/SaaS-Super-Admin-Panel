'use client'

import Link from 'next/link'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Panel, Prov, Stat } from '@/components/admin/ui'
import { BILLING_META, CONNECTION_META, EXECUTION_META, STATUS_TONE } from '@/lib/products'
import { useProducts } from './products-context'

const usd = (n: number) => '$' + n.toLocaleString('en-US')

export function OverviewSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const p = get(productId)
  if (!p) return null
  const none = p.connection === 'not_connected'
  const next = p.packages.length === 0 ? { t: 'Add the first package', h: '?tab=packages' } : none ? { t: 'Connect the product backend', h: '?tab=connect' } : p.status === 'testing' ? { t: 'Finish readiness and activate', h: '?tab=readiness' } : null
  return (
    <div className="flex flex-col gap-5">
      {next && <Callout tone="info" title="Next step">{next.t}. <Link href={next.h} className="font-medium underline">Go</Link></Callout>}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Product accounts" value={none ? '—' : p.accounts.toString()} kind={none ? 'na' : 'reconciled'} meta="Accounts in this product only" />
        <Stat label="Revenue (Oct MTD)" value={none ? '—' : usd(p.revenue)} kind={none ? 'na' : p.billingOwner === 'external' ? 'provisional' : 'estimated'} meta={p.billingOwner === 'external' ? 'Imported from external billing' : 'Central billing'} />
        <Stat label="Cost of service" value={none ? '—' : usd(p.cost)} kind={none ? 'na' : 'estimated'} meta="Direct + allocated" />
        <Stat label="Gross margin" value={none || !p.revenue ? '—' : (((p.revenue - p.cost) / p.revenue) * 100).toFixed(1) + '%'} kind={none ? 'na' : 'estimated'} meta="Before shared overhead" />
      </div>
      <Panel title="Product profile" features={['MP01']}>
        <dl className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
          {[
            ['product_id', <span key="i" className="font-mono">{p.id}</span>],
            ['Status', <Badge key="s" tone={STATUS_TONE[p.status]}>{p.status}</Badge>],
            ['Connection', <Badge key="c" tone={CONNECTION_META[p.connection].tone}>{CONNECTION_META[p.connection].label}</Badge>],
            ['Owner', p.owner],
            ['App URL (descriptive)', p.appUrl],
            ['Environments', p.environments.join(', ')],
            ['Execution', `${EXECUTION_META[p.execution].label} — ${EXECUTION_META[p.execution].enforcement}`],
            ['Billing owner', BILLING_META[p.billingOwner]],
            ['Credit unit', p.creditUnit],
          ].map(([k, v]) => (
            <div key={k as string}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5">{v}</dd></div>
          ))}
        </dl>
      </Panel>
    </div>
  )
}

export function GrowthSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const p = get(productId)
  if (!p) return null
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Acquisition by channel" features={['MP17']} description="Spend imported per product. Shared campaigns are allocated, never double counted.">
        <StateFrame features={['MP17']} cap="view.finance" incomplete="Marketing spend feed not connected for LinkedIn — CAC for that channel is Unavailable.">
          <DataTable columns={[{ key: 'c', label: 'Channel' }, { key: 's', label: 'Spend', align: 'right' }, { key: 'n', label: 'New product accounts', align: 'right' }, { key: 'x', label: 'of which cross-sell', align: 'right' }, { key: 'cac', label: 'CAC', align: 'right' }]} rows={[
            { c: 'Google Ads', s: '$6,200', n: '11', x: '0', cac: '$564' },
            { c: 'In-app cross-sell', s: '$0', n: '3', x: '3', cac: <span title="Cross-sell is not new-customer acquisition">n/a · expansion</span> },
            { c: 'Shared webinar (allocated 50%)', s: '$900', n: '4', x: '1', cac: '$300' },
            { c: 'LinkedIn', s: <Prov kind="na" label="Unavailable" />, n: '1', x: '0', cac: <Prov kind="na" label="Unavailable" /> },
          ]} />
        </StateFrame>
        <div className="mt-3"><Assumption decision="D10">Attribution window 30 days, first-touch for new-to-platform, last-touch for cross-sell.</Assumption></div>
      </Panel>
      <Panel title="Package adoption funnel" features={['MP14', 'MP18']}>
        <DataTable dense columns={[{ key: 's', label: 'Stage' }, ...p.packages.slice(0, 3).map((x) => ({ key: x.id, label: x.name, align: 'right' as const }))]} rows={[
          { s: 'Trial started', ...Object.fromEntries(p.packages.slice(0, 3).map((x, i) => [x.id, String([62, 28, 6][i] ?? 0)])) },
          { s: 'Activated (first task)', ...Object.fromEntries(p.packages.slice(0, 3).map((x, i) => [x.id, String([41, 22, 6][i] ?? 0)])) },
          { s: 'Converted to paid', ...Object.fromEntries(p.packages.slice(0, 3).map((x, i) => [x.id, String([19, 12, 4][i] ?? 0)])) },
        ]} />
      </Panel>
    </div>
  )
}

export function FinanceSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const p = get(productId)
  if (!p) return null
  const external = p.billingOwner === 'external'
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Panel title={external ? 'Imported billing' : 'Central billing'} features={['MP15']} description={external ? 'Read-only import. Corrections are made in the source system and re-imported.' : 'Invoices this panel created for this product.'}>
          <StateFrame features={['MP15']} cap="view.finance">
            <DataTable dense columns={[{ key: 'i', label: 'Invoice' }, { key: 'a', label: 'Account' }, { key: 'v', label: 'Amount', align: 'right' }, { key: 's', label: 'State' }]} rows={[
              { i: external ? 'ext_inv_7731' : 'INV-2026-1041', a: 'Northwind', v: '$4,800', s: <Badge tone="good">Paid · reconciled</Badge> },
              { i: external ? 'ext_inv_7735' : 'INV-2026-1052', a: 'Acme GmbH', v: '$2,112', s: <Badge tone="bad">Past due</Badge> },
              { i: 'INV-2026-0990 (multi-product)', a: 'Northwind', v: '$9,600', s: <Badge tone="warn">Line allocation pending</Badge> },
            ]} />
          </StateFrame>
          <div className="mt-3"><Assumption decision="PD06">Multi-product invoices are split by contract line mapping.</Assumption></div>
        </Panel>
        <Panel title="Cost imports" features={['MP16']}>
          <DataTable dense columns={[{ key: 's', label: 'Source' }, { key: 'p', label: 'Period' }, { key: 'v', label: 'Amount', align: 'right' }, { key: 'k', label: 'Status' }]} rows={[
            { s: 'App-reported model cost', p: 'Oct MTD', v: '$11,420', k: <Prov kind="estimated" /> },
            { s: 'Provider invoice (model vendor)', p: 'Sep', v: '$10,982', k: <Prov kind="reconciled" /> },
            { s: 'Shared GPU cluster', p: 'Sep', v: '$3,100 → $1,860 here', k: <Prov kind="allocated" label="Allocated 60%" /> },
            { s: 'Vector DB', p: 'Oct', v: '—', k: <Prov kind="incomplete" label="Import missing" /> },
          ]} />
          <p className="mt-2 text-[11px] text-muted-foreground">Sep variance: estimated $11,190 vs invoice $10,982 → −1.9%. Allocation driver follows D09.</p>
        </Panel>
      </div>
      <Panel title="Package profitability" features={['MP18', 'MP23']} description="Per package, per version. Annual prepayments are recognized monthly, not on receipt.">
        <StateFrame features={['MP18']} cap="view.margin">
          <DataTable columns={[{ key: 'k', label: 'Package · version' }, { key: 'r', label: 'Recognized revenue', align: 'right' }, { key: 'c', label: 'Cost', align: 'right' }, { key: 'm', label: 'Gross margin', align: 'right' }, { key: 'q', label: 'Quality' }]} rows={p.packages.map((x, i) => {
            const r = [9400, 28100, 24340, 0][i] ?? 0
            const c = [3900, 8120, 6190, 0][i] ?? 0
            return { k: `${x.name} · ${x.currentVersion}`, r: r ? usd(r) : '—', c: c ? usd(c) : '—', m: r ? (((r - c) / r) * 100).toFixed(1) + '%' : '—', q: r ? <Prov kind="estimated" /> : <Prov kind="na" label="No data" /> }
          })} />
        </StateFrame>
      </Panel>
    </div>
  )
}

export function HealthSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const p = get(productId)
  if (!p) return null
  return (
    <div className="flex flex-col gap-5">
      {p.connection === 'degraded' && <Callout tone="bad" title="Degraded">Heartbeat {p.lastHeartbeat}. Usage figures for the last 6 minutes are incomplete.</Callout>}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Ingestion lag (p95)" value={p.connection === 'not_connected' ? '—' : p.connection === 'degraded' ? '6 min' : '38 s'} kind={p.connection === 'not_connected' ? 'na' : 'reconciled'} meta="Target 2 min" />
        <Stat label="Retry queue" value={p.connection === 'degraded' ? '312' : '0'} kind="reconciled" meta="Events awaiting redelivery" />
        <Stat label="Dead-letter" value={p.connection === 'degraded' ? '7' : '0'} kind="reconciled" meta="Need manual replay" />
        <Stat label="Rejected (24 h)" value="3" kind="reconciled" meta="Bad signature or schema" />
      </div>
      <Panel title="Jobs" features={['MP20']}>
        <StateFrame features={['MP20']} cap="view.usage" emptyTitle="No jobs">
          <DataTable columns={[{ key: 'j', label: 'job_id', mono: true }, { key: 't', label: 'Type' }, { key: 's', label: 'State' }, { key: 'r', label: 'Records', align: 'right' }, { key: 'a', label: '' }]} rows={[
            { j: 'job_5521', t: 'usage-batch import', s: <Badge tone="good">Completed</Badge>, r: '12,400', a: '' },
            { j: 'job_5530', t: 'billing import (external)', s: <Badge tone="bad">Failed · schema v3 field missing</Badge>, r: '0 / 214', a: <ActionButton size="xs" label="Replay" cap="act.integration" dialog={{ title: 'Replay failed job', feature: 'MP20', impact: ['Re-runs with the same idempotency keys — no duplicates', 'Prior successful rows are skipped'] }} /> },
            { j: 'job_5534', t: 'usage correction', s: <Badge tone="warn">Awaiting approval</Badge>, r: '−88 credits', a: <ActionButton size="xs" label="Approve" cap="act.finance" dialog={{ title: 'Approve usage correction', feature: 'MP20', secondReview: true, impact: ['Posts a reversing entry; originals stay in history', 'Closed period Sep affected → adjustment posted to Oct'] }} /> },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Emergency controls" features={['MP26']}>
        <div className="flex flex-wrap gap-2">
          <ActionButton label="Pause new tasks" cap="act.killswitch" dialog={{ title: `Pause new tasks in ${p.name}`, feature: 'MP26', destructive: true, confirmText: 'PAUSE', impact: ['Reservations refused for every account in this product', 'Other products keep running', 'Takes effect within resolver TTL (PD03: TBD)'] }} />
          <ActionButton label="Block a model for this product" cap="act.ops" dialog={{ title: 'Block model in this product', feature: 'MP26', impact: ['Entitlement resolver removes model from allowlist', 'Platform-wide block lives in Controls (SA12)'] }} />
        </div>
      </Panel>
    </div>
  )
}

export function AuditSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const p = get(productId)
  if (!p) return null
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Product audit trail" features={['MP24']} description="Every admin and integration action for this product. Entries cannot be edited or deleted.">
        <StateFrame features={['MP24']} cap="view.security">
          <DataTable columns={[{ key: 't', label: 'When' }, { key: 'w', label: 'Actor' }, { key: 'a', label: 'Action' }, { key: 'd', label: 'Detail' }]} rows={[
            { t: 'Oct 23 10:58', w: 'Integration · cred_live_••a91f', a: 'usage.batch.accepted', d: '12,400 records' },
            { t: 'Oct 22 17:20', w: 'M. Diaz (Finance)', a: 'package.version.publish', d: 'Pro v3 → effective Jul 1' },
            { t: 'Oct 20 09:12', w: 'S. Patel (Security)', a: 'credential.rotate', d: 'cred_live_••0e12 → ••a91f' },
            { t: 'Oct 19 14:03', w: 'Integration · cred_test_••77c0', a: 'auth.rejected', d: 'Sandbox key used against production wallet → 403' },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="API compatibility" features={['MP25']}>
        <DataTable dense columns={[{ key: 'k', label: 'Item' }, { key: 'v', label: 'Value' }]} rows={[
          { k: 'Integration API version in use', v: '2026-09-01' },
          { k: 'Deprecated fields still sent', v: <Badge tone="warn">plan_code (sunset 2027-03-01)</Badge> },
          { k: 'OpenAPI contract', v: <Link href="/spec/addendum?tab=api" className="text-primary hover:underline">Endpoint map</Link> },
        ]} />
      </Panel>
    </div>
  )
}
