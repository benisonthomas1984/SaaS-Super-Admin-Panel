'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, Panel, Prov, Stat, inputCls } from '@/components/admin/ui'
import { can } from '@/lib/rbac'
import { useProducts } from './products-context'

export function AccountsSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  const empty = product.accounts === 0
  return (
    <Panel title="Product accounts and identity map" features={['MP09']} description="Lookups are always scoped by product. The same external ID in another product is a different account.">
      <StateFrame features={['MP09']} cap="view.customer" emptyTitle="No accounts yet" emptyHint="Accounts appear after the product calls POST /integration/customer-links.">
        {empty ? (
          <p className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No product accounts yet. The product creates them through the customer-link API after it is connected.</p>
        ) : (
          <DataTable columns={[{ key: 'pa', label: 'product_account_id', mono: true }, { key: 'ext', label: 'external_company_id', mono: true }, { key: 'co', label: 'Canonical company' }, { key: 'u', label: 'Mapped users', align: 'right' }, { key: 'st', label: 'State' }]} rows={[
            { pa: 'pa_A_7781', ext: 'customer_123', co: 'CO-10482 Northwind Logistics', u: '18', st: <Badge tone="good">Linked</Badge> },
            { pa: 'pa_A_9012', ext: 'customer_456', co: '—', u: '4', st: <Badge tone="outline">Unlinked</Badge> },
            { pa: 'pa_A_9100', ext: 'acme-eu', co: 'CO-10511 Acme GmbH', u: '9', st: <Badge tone="good">Linked</Badge> },
            { pa: 'pa_A_9133', ext: 'customer_789', co: '—', u: '0', st: <Badge tone="warn">Duplicate candidate · review</Badge> },
          ]} />
        )}
      </StateFrame>
    </Panel>
  )
}

export function SubscriptionsSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  const external = product.billingOwner === 'external'
  return (
    <div className="flex flex-col gap-5">
      {external && <Callout tone="info" title="Billing owned externally">Subscriptions are imported from the product&apos;s billing system. This panel shows and reconciles them, but never creates charges.</Callout>}
      <Panel title="Subscriptions" features={['MP10']} description="Every change has an effective date. History is kept, never overwritten.">
        <StateFrame features={['MP10']} cap="view.customer" emptyTitle="No subscriptions" emptyHint="Subscriptions appear after a customer buys a published package version.">
          {product.accounts === 0 ? (
            <p className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No subscriptions for this product yet.</p>
          ) : (
            <DataTable columns={[{ key: 'id', label: 'subscription_id', mono: true }, { key: 'a', label: 'Account' }, { key: 'p', label: 'Package · version' }, { key: 'f', label: 'From' }, { key: 's', label: 'Status' }, { key: 'src', label: 'Source' }]} rows={[
              { id: 'sub_A_1182', a: 'pa_A_7781 Northwind', p: 'Pro · v3', f: '2026-07-01', s: <Badge tone="good">Active</Badge>, src: external ? 'Imported' : 'Central' },
              { id: 'sub_A_1182', a: 'pa_A_7781 Northwind', p: 'Starter · v2', f: '2026-02-01 → 06-30', s: <Badge tone="neutral">Superseded</Badge>, src: external ? 'Imported' : 'Central' },
              { id: 'sub_A_1305', a: 'pa_A_9012', p: 'Starter · v2', f: '2026-08-14', s: <Badge tone="warn">Downgrade scheduled Nov 1</Badge>, src: external ? 'Imported' : 'Central' },
              { id: 'sub_A_1390', a: 'pa_A_9100 Acme', p: 'Business · v1', f: '2026-09-01', s: <Badge tone="bad">Past due · grace 6 d</Badge>, src: external ? 'Imported' : 'Central' },
            ]} />
          )}
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Entitlement resolver" features={['MP11']} description="What the product receives when it asks &quot;may this user do X?&quot;">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account"><select className={inputCls}><option>pa_A_7781 Northwind</option><option>pa_A_9012</option></select></Field>
            <Field label="Feature"><select className={inputCls}><option>doc.batch_extract</option><option>seats.max</option></select></Field>
          </div>
          <pre className="mt-3 overflow-x-auto rounded border bg-muted/50 p-3 font-mono text-[11px] leading-relaxed">{`{
  "product_id": "${product.id}",
  "package": "pro", "version": "v3",
  "feature": "doc.batch_extract", "allowed": true,
  "snapshot_id": "ent_7781_0042",
  "expires_at": "TTL: TBD (PD03)"
}`}</pre>
        </Panel>
        <Panel title="When the resolver is unreachable" features={['MP11', 'MP26']}>
          <p className="text-sm leading-relaxed">Paid hard-cap packages <span className="font-medium">fail closed</span>: the product must refuse new paid tasks instead of guessing.</p>
          <div className="mt-3"><Assumption decision="PD04">Fail closed for paid hard-cap packages. Alternative: bounded grace on last snapshot.</Assumption></div>
        </Panel>
      </div>
    </div>
  )
}

export function WalletSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const { role, record } = useAdmin()
  const product = get(productId)
  const [available, setAvailable] = useState(18400)
  const [reserved, setReserved] = useState(0)
  const [amount, setAmount] = useState('500')
  const [log, setLog] = useState<string[]>([])
  if (!product) return null
  const telemetry = product.execution === 'telemetry_only'
  const allowed = can(role, 'act.ops')
  const n = Math.max(0, Math.floor(Number(amount) || 0))

  const reserve = () => {
    if (n > available) { setLog((l) => [`409 insufficient_credits · requested ${n}, available ${available}. Task refused before any provider call.`, ...l]); return }
    setAvailable(available - n); setReserved(reserved + n)
    setLog((l) => [`201 reservation res_${Date.now().toString(36)} · ${n} held`, ...l])
  }
  const settle = () => {
    if (!reserved) return
    const used = Math.round(reserved * 0.72)
    setAvailable(available + (reserved - used)); setReserved(0)
    setLog((l) => [`200 settled · charged ${used}, released ${reserved - used}`, ...l])
    record({ action: 'wallet.settle.sim', target: product.id, reason: 'Sandbox simulation' })
  }
  const release = () => { if (!reserved) return; setAvailable(available + reserved); setLog((l) => [`200 released ${reserved}`, ...l]); setReserved(0) }

  return (
    <div className="flex flex-col gap-5">
      {telemetry && <Callout tone="warn" title="Observational only">This product runs telemetry-only. Budgets here are reported after the fact and cannot stop spend in real time.</Callout>}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Available credits" value={available.toLocaleString()} kind="reconciled" meta={`Wallet for ${product.name} only`} />
        <Stat label="Reserved (in flight)" value={reserved.toLocaleString()} kind="estimated" meta="Held until settle or release" />
        <Stat label="Monthly budget" value="40,000" kind="reconciled" meta={telemetry ? 'Observational' : 'Hard cap · enforced'} />
        <Stat label="Expiring Nov 1" value="2,100" kind="reconciled" meta="Promotional grant" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Reservation simulator (sandbox)" features={['MP12']} description="Shows exactly what the product sees: reserve before work, settle actual use, release the rest.">
          <div className="flex items-end gap-2">
            <Field label="Credits to reserve"><input className={inputCls + ' w-32'} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Button size="sm" disabled={!allowed} onClick={reserve}>Reserve</Button>
            <Button size="sm" variant="outline" disabled={!allowed || !reserved} onClick={settle}>Settle</Button>
            <Button size="sm" variant="ghost" disabled={!allowed || !reserved} onClick={release}>Release</Button>
          </div>
          <ul className="mt-3 flex max-h-40 flex-col gap-1 overflow-y-auto font-mono text-[11px]" aria-live="polite">
            {log.length === 0 ? <li className="text-muted-foreground">No calls yet.</li> : log.map((l, i) => <li key={i} className={l.startsWith('409') ? 'text-destructive' : ''}>{l}</li>)}
          </ul>
        </Panel>
        <Panel title="Ledger" features={['MP12']}>
          <DataTable dense columns={[{ key: 't', label: 'When' }, { key: 'k', label: 'Entry' }, { key: 'v', label: 'Credits', align: 'right' }]} rows={[
            { t: 'Oct 23 11:04', k: 'Settle res_8f2 · task tsk_A_55102', v: '−412' },
            { t: 'Oct 23 10:51', k: 'Release res_8e9 (task failed)', v: '+300' },
            { t: 'Oct 01 00:00', k: 'Monthly grant · Pro v3', v: '+120,000' },
            { t: 'Sep 30 23:59', k: 'Expired unused allowance', v: '−6,240' },
          ]} />
          <div className="mt-3 flex gap-2">
            <ActionButton size="xs" label="Goodwill credit" cap="act.support" dialog={{ title: 'Grant goodwill credits', feature: 'MP12', impact: ['Adds credits to this product wallet only', 'Recorded as a non-revenue grant'] }} />
            <ActionButton size="xs" label="Freeze wallet" cap="act.killswitch" dialog={{ title: 'Freeze product wallet', feature: 'MP26', destructive: true, impact: ['New reservations refused for this account in this product', 'Other products unaffected'] }} />
          </div>
        </Panel>
      </div>
      <Assumption decision="PD01">Each product account has its own wallet. A shared cross-product wallet is a configurable alternative.</Assumption>
    </div>
  )
}

export function UsageSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Tasks (Oct MTD)" value={product.accounts ? '48,210' : '—'} kind={product.accounts ? 'estimated' : 'na'} meta="Started by the product" />
        <Stat label="Success rate" value={product.accounts ? '96.4%' : '—'} kind={product.accounts ? 'estimated' : 'na'} meta="From outcome events" />
        <Stat label="Unrated records" value={product.accounts ? '14' : '—'} kind={product.accounts ? 'incomplete' : 'na'} meta="No sell rate for meter" />
        <Stat label="Late records accepted" value={product.accounts ? '212' : '—'} kind={product.accounts ? 'provisional' : 'na'} meta="Rated on version in effect at occurrence" />
      </div>
      <Panel title="Task explorer" features={['MP13', 'MP14']}>
        <StateFrame features={['MP13']} cap="view.usage" emptyTitle="No tasks reported" emptyHint="Tasks appear once the product sends usage batches.">
          {product.accounts === 0 ? (
            <p className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No usage reported yet. This is not zero usage — the product is not sending data.</p>
          ) : (
            <DataTable columns={[{ key: 'id', label: 'task_id', mono: true }, { key: 'a', label: 'Account' }, { key: 'f', label: 'Feature' }, { key: 'o', label: 'Outcome' }, { key: 'c', label: 'Credits', align: 'right' }, { key: 'p', label: 'Provider cost' }]} rows={[
              { id: 'tsk_A_55102', a: 'pa_A_7781', f: 'doc.batch_extract', o: <Badge tone="good">succeeded</Badge>, c: '412', p: <Prov kind="estimated" label="$0.31 est." /> },
              { id: 'tsk_A_55098', a: 'pa_A_9012', f: 'doc.summarize', o: <Badge tone="bad">failed · released</Badge>, c: '0', p: <Prov kind="estimated" label="$0.04 est." /> },
              { id: 'tsk_A_55011', a: 'pa_A_9100', f: 'audio.transcribe', o: <Badge tone="warn">succeeded · unrated</Badge>, c: '—', p: <Prov kind="incomplete" label="Meter unrated" /> },
            ]} />
          )}
        </StateFrame>
      </Panel>
    </div>
  )
}
