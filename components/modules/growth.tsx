import { Upload, Link2 } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Bar, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function AttributionSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Identity linkage" features={['SA08.01']} description="Anonymous visitor → lead → user → company → paid company. Offline and unknown are first-class sources.">
        <StateFrame features={['SA08.01']} cap="view.finance" incomplete="Ad-platform click IDs for 12 Oct–14 Oct not received (consent banner outage). 38 signups show Unknown source.">
          <DataTable dense columns={[{ key: 'co', label: 'Company' }, { key: 'v', label: 'Visitor → lead' }, { key: 'u', label: 'User → company' }, { key: 'p', label: 'First paid' }, { key: 'src', label: 'Source' }, { key: 'conf', label: 'Confidence' }, { key: 'a', label: '' }]} rows={[
            { co: 'Northwind Logistics · CO-10482', v: 'anon_7f2 → lead_221', u: 'dana@… → CO-10482', p: '14 Mar 2025', src: 'Paid search · Q1-docs-agent', conf: <Badge tone="good">High · UTM</Badge>, a: null },
            { co: 'Halcyon Legal LLP · CO-10019', v: 'offline', u: 'sales import', p: '02 Jan 2026', src: 'Outbound sales', conf: <Badge tone="good">High · CRM</Badge>, a: null },
            { co: 'Quillon Analytics · CO-10512', v: 'anon_a91 → —', u: 'ops@… → CO-10512', p: '—', src: 'Unknown', conf: <Badge tone="warn">Low · no consent</Badge>, a: <ActionButton label="Link manually" cap="act.finance" size="xs" icon={<Link2 />} dialog={{ title: 'Manually link acquisition source', feature: 'SA08.01', impact: ['Sets source with confidence “Manual” and reason', 'Audited; reversible via new linkage entry'] }} /> },
            { co: 'Atlas Freight Inc. · CO-10233', v: 'anon_c10 → lead_390', u: 'two users → CO-10233', p: '19 Jun 2026', src: 'Referral · partner P-14', conf: <Badge tone="outline">Medium · referral code</Badge>, a: null },
          ]} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-3 gap-3">
        <Assumption decision="D10">Customer = first paid company; 90-day lookback; first-touch attribution.</Assumption>
        <Field label="Attribution model"><select className={inputCls}><option>First touch</option><option>Last touch</option><option>Position-based (40/20/40)</option></select></Field>
        <Field label="Lookback window"><select className={inputCls}><option>90 days</option><option>30 days</option><option>180 days</option></select></Field>
      </div>
    </div>
  )
}

export function CacSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-5">
        <Panel title="Spend imports" features={['SA08.02']} className="col-span-2" actions={<ActionButton label="Import spend" cap="act.finance" icon={<Upload />} dialog={{ title: 'Import ad spend', feature: 'SA08.02', impact: ['Preview rows, currency and dedupe before commit', 'Duplicate imports by file hash are rejected', 'Corrections create new import versions'] }} />}>
          <StateFrame features={['SA08.02']} cap="view.finance">
            <DataTable dense columns={[{ key: 's', label: 'Source' }, { key: 'p', label: 'Period' }, { key: 'a', label: 'Amount', align: 'right' }, { key: 'c', label: 'Currency' }, { key: 'st', label: 'Status' }]} rows={[
              { s: 'Search ads (API)', p: 'Oct 1–22', a: '$38,410.00', c: 'USD', st: <Badge tone="good">Synced 06:00 UTC</Badge> },
              { s: 'Social ads (CSV)', p: 'Sep 2026', a: '€12,200.00', c: 'EUR → $13,190 @1.0812', st: <Badge tone="good">Imported</Badge> },
              { s: 'Social ads (CSV)', p: 'Sep 2026', a: '€12,200.00', c: 'EUR', st: <Badge tone="neutral">Duplicate · rejected</Badge> },
              { s: 'Agency fees', p: 'Q3 2026', a: '$9,000.00', c: 'USD', st: <Badge tone="warn">Unallocated to channel</Badge> },
            ]} />
          </StateFrame>
        </Panel>
        <Panel title="CAC by channel · Q3" features={['SA08.02']}>
          <StateFrame features={['SA08.02']} cap="view.margin">
            <ul className="flex flex-col gap-3 text-sm">
              {[['Paid search', 1840, 2400], ['Social', 2210, 2400], ['Referral', 410, 2400], ['Outbound sales', 2390, 2400]].map(([l, v, m]) => (
                <li key={l as string} className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>{l}</span><Gate cap="view.margin"><span className="tabular font-medium">${(v as number).toLocaleString()}</span></Gate></div>
                  <Bar value={v as number} max={m as number} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">Ad-only CAC. Fully-loaded CAC includes trial cost ($6,120) and sales payroll share (import pending).</p>
          </StateFrame>
        </Panel>
      </div>
    </div>
  )
}

export function FunnelSection() {
  const steps = [['Visitors', 48210], ['Signups', 1912], ['Activated (accepted outcome)', 702], ['Trial → paid', 214], ['Retained month 3', 171]] as const
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Signup cohort funnel · Jul 2026" features={['SA08.03', 'SA09.01']} className="col-span-2">
        <StateFrame features={['SA08.03']} cap="view.finance" emptyTitle="Cohort too young" emptyHint="Month-3 retention available after 1 Oct for July cohort.">
          <ol className="flex flex-col gap-2">
            {steps.map(([l, n], i) => (
              <li key={l} className="grid grid-cols-[200px_1fr_80px_80px] items-center gap-3 text-sm">
                <span>{l}</span>
                <Bar value={n} max={steps[0][1]} />
                <span className="text-right tabular">{n.toLocaleString()}</span>
                <span className="text-right text-xs text-muted-foreground">{i === 0 ? '—' : `${((n / steps[i - 1][1]) * 100).toFixed(1)}%`}</span>
              </li>
            ))}
          </ol>
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Field label="Activation event (per feature)"><select className={inputCls}><option>Accepted outcome</option><option>Any completed task</option></select></Field>
        <Assumption decision="D11">Activation = first accepted outcome event within 14 days of signup.</Assumption>
      </div>
    </div>
  )
}

export function PaybackSection() {
  return (
    <Panel title="CAC payback & lifetime contribution" features={['SA08.04', 'SA07.02']} description="Payback uses contribution, not revenue. Cohorts younger than the payback horizon show Insufficient history.">
      <StateFrame features={['SA08.04']} cap="view.margin">
        <DataTable dense columns={[{ key: 'c', label: 'Cohort' }, { key: 'n', label: 'Paid cos', align: 'right' }, { key: 'cac', label: 'CAC', align: 'right' }, { key: 'cm', label: 'Contribution / mo', align: 'right' }, { key: 'pb', label: 'Payback', align: 'right' }, { key: 'ltc', label: '12-mo contribution', align: 'right' }]} rows={[
          { c: 'Q1 2026', n: '61', cac: '$1,920', cm: '$412', pb: '4.7 mo', ltc: '$4,944' },
          { c: 'Q2 2026', n: '74', cac: '$2,050', cm: '$388', pb: '5.3 mo', ltc: <Prov kind="estimated" label="Projected" /> },
          { c: 'Q3 2026', n: '79', cac: '$2,210', cm: <Prov kind="incomplete" label="2 mo data" />, pb: <Prov kind="na" label="Insufficient history" />, ltc: '—' },
        ]} />
        <div className="mt-3"><Callout tone="info" title="Contribution, not revenue">Payback would read 2.1 months on revenue alone — shown for reference only, never as the headline.</Callout></div>
        <div className="mt-3"><KV cols={3} items={[['Min. history', '3 months'], ['Discount rate', 'None'], ['Allocation', 'alloc_v3']]} /></div>
      </StateFrame>
    </Panel>
  )
}
