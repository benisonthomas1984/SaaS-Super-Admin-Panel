import { RotateCw, FileText } from 'lucide-react'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function InvoicesSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-5">
        <Panel title="Unbilled usage preview · CO-10482" features={['SA06.01']} className="col-span-2" description="Draft invoice INV-2026-11-0412 · finalizes 1 Nov 02:00 (customer billing TZ: Europe/Dublin)">
          <StateFrame features={['SA06.01']} cap="view.customer">
            <DataTable dense columns={[{ key: 'l', label: 'Line' }, { key: 'm', label: 'Meter', mono: true }, { key: 'q', label: 'Qty', align: 'right' }, { key: 'a', label: 'Amount', align: 'right' }, { key: 's', label: 'Status' }]} rows={[
              { l: 'Scale v3 · 50 seats', m: 'sub_seat', q: '50', a: '$4,800.00', s: <Prov kind="reconciled" label="Final" /> },
              { l: 'Overage credits (approved)', m: 'mtr_overage', q: '41,240 cr', a: <span className="italic">≈ $412.40</span>, s: <Prov kind="estimated" /> },
              { l: 'Storage above quota', m: 'mtr_storage_gb', q: '12 GB', a: <span className="italic">≈ $36.00</span>, s: <Prov kind="estimated" /> },
              { l: 'Tax', m: 'tax_engine', q: '—', a: <Prov kind="pending" label="Tax provider TBD" />, s: <Prov kind="incomplete" /> },
            ]} />
          </StateFrame>
        </Panel>
        <div className="flex flex-col gap-3">
          <Panel title="Late usage policy" features={['SA06.01', 'SA03.04']}>
            <Field label="Usage arriving after finalization"><select className={inputCls}><option>Add to next invoice</option><option>Issue adjustment note</option></select></Field>
          </Panel>
          <Assumption decision="D18">Finalization cutoff 02:00 in customer billing timezone; late usage goes to the next invoice.</Assumption>
        </div>
      </div>
      <Panel title="Invoices" features={['SA06.01']} actions={<ActionButton label="Issue credit note" cap="act.finance" icon={<FileText />} dialog={{ title: 'Issue credit note on INV-2026-10-0412', feature: 'SA06.01', impact: ['Creates CN-2026-10-0031 linked to the original invoice', 'Original invoice is never edited', 'Tax recalculation via provider (gap G04)'] }} />}>
        <StateFrame features={['SA06.01']} cap="view.customer" rows={5}>
          <DataTable dense columns={[{ key: 'n', label: 'Invoice', mono: true }, { key: 'c', label: 'Company' }, { key: 'p', label: 'Period' }, { key: 'a', label: 'Total', align: 'right' }, { key: 's', label: 'Status' }]} rows={[
            { n: 'INV-2026-10-0412', c: 'Northwind Logistics', p: 'Oct 2026', a: '$5,212.40', s: <Badge tone="good">Paid</Badge> },
            { n: 'INV-2026-10-0377', c: 'Brightpath Health', p: 'Oct 2026', a: '$3,840.00', s: <Badge tone="bad">Past due · 21 d</Badge> },
            { n: 'INV-2026-10-0019', c: 'Halcyon Legal LLP', p: 'Oct 2026', a: '$22,140.00', s: <Badge tone="warn">Open · net 30</Badge> },
            { n: 'CN-2026-10-0030', c: 'Atlas Freight Inc.', p: 'Credit note', a: '−$120.00', s: <Badge tone="neutral">Applied</Badge> },
          ]} />
        </StateFrame>
      </Panel>
    </div>
  )
}

export function PaymentsSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Payment provider events" features={['SA06.02']} description="Signed webhooks are verified, deduplicated by event ID and applied in causal order.">
        <StateFrame features={['SA06.02']} cap="view.finance" rows={6}>
          <DataTable dense columns={[{ key: 'e', label: 'Event ID', mono: true }, { key: 't', label: 'Type', mono: true }, { key: 'r', label: 'Received' }, { key: 'sig', label: 'Signature' }, { key: 's', label: 'Processing' }, { key: 'a', label: '' }]} rows={[
              { e: 'evt_SAMPLE_88a1', t: 'invoice.paid', r: '23 Oct 10:30', sig: <Badge tone="good">Verified</Badge>, s: <Badge tone="good">Applied</Badge>, a: null },
              { e: 'evt_SAMPLE_88a1', t: 'invoice.paid', r: '23 Oct 10:30', sig: <Badge tone="good">Verified</Badge>, s: <Badge tone="neutral">Duplicate · ignored</Badge>, a: null },
              { e: 'evt_SAMPLE_88b7', t: 'subscription.updated', r: '23 Oct 09:58', sig: <Badge tone="good">Verified</Badge>, s: <Badge tone="warn">Out of order · held</Badge>, a: <ActionButton label="Replay" cap="act.finance" size="xs" icon={<RotateCw />} dialog={{ title: 'Replay evt_SAMPLE_88b7', feature: 'SA06.02', impact: ['Replays idempotently after prerequisite evt_SAMPLE_88b2', 'Cannot double-apply credits or entitlements'] }} /> },
              { e: 'evt_SAMPLE_88c0', t: 'payment_intent.failed', r: '23 Oct 09:41', sig: <Badge tone="good">Verified</Badge>, s: <Badge tone="good">Applied · dunning started</Badge>, a: null },
              { e: 'unknown', t: 'invoice.paid', r: '23 Oct 08:12', sig: <Badge tone="bad">Invalid signature</Badge>, s: <Badge tone="bad">Rejected · no state change</Badge>, a: null },
          ]} />
        </StateFrame>
      </Panel>
      <Callout tone="info" title="Paid access is granted only after verified payment">Client redirects (e.g. “success” URL) never grant credits or entitlements. Gap G02: server behaviour requires integration tests.</Callout>
    </div>
  )
}

export function CollectionsSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-5 gap-3">
        {[['Current', '$148,210'], ['1–7 days', '$6,420'], ['8–14 days', '$3,190'], ['15–30 days', '$7,680'], ['30+ days', '$3,840']].map(([l, v], i) => (
          <div key={l} className={`rounded-md border bg-card p-3.5 ${i >= 3 ? 'border-destructive/40' : ''}`}>
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 text-xl font-semibold tabular">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <Panel title="Past-due accounts" features={['SA06.03', 'SA02.01']} className="col-span-2">
          <StateFrame features={['SA06.03']} cap="view.finance" emptyTitle="No past-due accounts">
            <DataTable dense columns={[{ key: 'c', label: 'Company' }, { key: 'o', label: 'Overdue', align: 'right' }, { key: 'd', label: 'Days' }, { key: 'r', label: 'Retries' }, { key: 'n', label: 'Next action' }, { key: 'a', label: '' }]} rows={[
              { c: 'Brightpath Health · CO-10377', o: '$3,840.00', d: '21 (grace ended day 7)', r: '4 / 4', n: 'Suspend new AI tasks', a: <ActionButton label="Restrict" cap="act.finance" size="xs" variant="destructive" dialog={{ title: 'Restrict Brightpath Health', feature: 'SA06.03', destructive: true, impact: ['Scope: new AI tasks only; data access and exports remain', 'Notification “Account restricted” sent via SA15.02', 'Restores automatically on verified payment'] }} /> },
              { c: 'Kestrel Robotics · CO-10601', o: '$4,800.00', d: '38', r: '4 / 4', n: 'Write-off review', a: <ActionButton label="Write off" cap="act.finance" size="xs" dialog={{ title: 'Write off $4,800.00', feature: 'SA06.03', secondReview: true, impact: ['Creates write-off entry linked to INV-2026-09-0601', 'Requires Finance + Owner approval'] }} /> },
              { c: 'Quillon Analytics · CO-10512', o: '$2,880.00', d: '9', r: '2 / 4', n: 'Retry 25 Oct', a: null },
            ]} />
          </StateFrame>
        </Panel>
        <div className="flex flex-col gap-3">
          <Panel title="Collection policy" features={['SA06.03']}>
            <KV items={[['Retry schedule', 'Day 1, 3, 7, 14'], ['Grace period', '7 days'], ['Suspension scope', 'New AI tasks'], ['Write-off authority', 'Finance + Owner']]} />
          </Panel>
          <Assumption decision="D20">4 retries over 14 days, 7-day grace, then restrict new AI tasks only.</Assumption>
        </div>
      </div>
    </div>
  )
}

export function RefundsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Refund preview · INV-2026-10-0412" features={['SA06.04', 'SA15.03']} className="col-span-2">
        <StateFrame features={['SA06.04']} cap="view.finance">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Reason code"><select className={inputCls}><option>Duplicate charge</option><option>Service failure</option><option>Goodwill (use SA15.04)</option><option>Billing error</option></select></Field>
            <Field label="Amount"><input className={inputCls} defaultValue="$412.40" /></Field>
            <Field label="Credit treatment"><select className={inputCls}><option>Reverse unused credits</option><option>Keep credits</option></select></Field>
          </div>
          <div className="mt-4">
            <KV cols={4} items={[['Cash refund', '$412.40'], ['Credits reversed', '41,240 cr'], ['Retained provider cost', '$118.22 (not recoverable)'], ['Tax impact', 'Pending provider']]} />
          </div>
          <div className="mt-4 flex justify-end">
            <ActionButton label="Issue refund" cap="act.finance" variant="default" dialog={{ title: 'Issue refund $412.40', feature: 'SA06.04', impact: ['Idempotent refund via payment provider', 'Linked ledger entries for credit reversal', 'Accounting export queued'], uncertain: 'If the provider times out, the refund is shown as Unknown until the webhook confirms; it is not retried automatically.' }} />
          </div>
        </StateFrame>
      </Panel>
      <Panel title="Disputes & accounting export" features={['SA06.04']}>
        <ul className="flex flex-col gap-2 text-xs">
          <li className="rounded border p-2"><p className="font-medium">DSP-0012 · Atlas Freight Inc. · $1,712.00</p><p className="text-muted-foreground">Evidence due 29 Oct · account restricted from new top-ups</p></li>
          <li className="flex justify-between"><span>Accounting export · Sep</span><Badge tone="good">Delivered</Badge></li>
          <li className="flex justify-between"><span>Accounting export · Oct MTD</span><Badge tone="warn">Pending close</Badge></li>
          <li className="flex justify-between"><span>Tax engine</span><Badge tone="outline">Not connected (G04)</Badge></li>
        </ul>
      </Panel>
    </div>
  )
}
