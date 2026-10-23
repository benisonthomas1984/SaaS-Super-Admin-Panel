import { Gift, Send } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function CasesSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Support cases" features={['SA15.01']} className="col-span-2">
        <StateFrame features={['SA15.01']} cap="view.customer" emptyTitle="No open cases">
          <DataTable dense columns={[{ key: 'c', label: 'Case', mono: true }, { key: 'co', label: 'Company' }, { key: 's', label: 'Subject' }, { key: 'p', label: 'Priority' }, { key: 'sla', label: 'SLA' }, { key: 't', label: 'Time logged', align: 'right' }]} rows={[
            { c: 'CASE-2291', co: 'Northwind Logistics', s: 'Charge for retried task', p: <Badge tone="warn">P2</Badge>, sla: '4 h left', t: '0.5 h' },
            { c: 'CASE-2288', co: 'Brightpath Health', s: 'Account restricted', p: <Badge tone="bad">P1</Badge>, sla: <Badge tone="bad">Breached</Badge>, t: '2.0 h' },
            { c: 'CASE-2280', co: 'Halcyon Legal LLP', s: 'Connector auth expired', p: <Badge tone="warn">P2</Badge>, sla: '1 d', t: '1.5 h' },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <KV items={[['Cost-to-serve (30 d)', <Gate key="c" cap="view.margin">$4,210</Gate>], ['Blended hourly rate', <Gate key="r" cap="view.margin">$58</Gate>]]} />
        <Field label="Support labor classification (C05)"><select className={inputCls}><option>Contribution deduction</option><option>Service cost (shared allocation)</option></select></Field>
      </div>
    </div>
  )
}

export function NotificationsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Customer notification templates" features={['SA15.02', 'SA12.04']} className="col-span-2" description="The only path for customer-facing messages. Internal alerts never email customers directly (C06).">
        <StateFrame features={['SA15.02']} cap="view.customer">
          <DataTable dense columns={[{ key: 't', label: 'Template' }, { key: 'tr', label: 'Trigger' }, { key: 'r', label: 'Recipients' }, { key: 'ch', label: 'Channels' }, { key: 'l', label: 'Locales' }, { key: 'a', label: '' }]} rows={[
            { t: 'Credits at 80% / 95%', tr: 'A01', r: 'Billing contact + owners', ch: 'Email · in-app', l: 'en · de · fr (G05)', a: null },
            { t: 'Payment failed', tr: 'SA06.03 retry', r: 'Billing contact', ch: 'Email', l: 'en', a: null },
            { t: 'Account restricted', tr: 'SA06.03 / SA02.01', r: 'All tenant admins', ch: 'Email · in-app banner', l: 'en', a: <ActionButton label="Send test" cap="act.support" size="xs" icon={<Send />} dialog={{ title: 'Send test “Account restricted”', feature: 'SA15.02', impact: ['Sends to your admin address only', 'Not counted as customer delivery'] }} /> },
            { t: 'Degraded feature', tr: 'SA12.02', r: 'Affected tenants', ch: 'In-app banner · status page', l: 'en', a: null },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Delivery log · 24 h" features={['SA15.02']}>
          <KV items={[['Delivered', '1,842'], ['Bounced', '6'], ['Suppressed (opt-out)', '21'], ['Retries pending', '2']]} />
        </Panel>
        <Assumption decision="D20">Role-based recipients; billing contact always included for financial messages.</Assumption>
      </div>
    </div>
  )
}

export function EvidenceSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Charge explanation · task tsk_7Q2M · CO-10482" features={['SA15.03', 'SA05.02', 'SA03.01']} className="col-span-2" description="One trace from invoice line to task, attempts, rates and ledger entries. Customer-safe view hides provider cost.">
        <StateFrame features={['SA15.03']} cap="view.customer">
          <ol className="flex flex-col gap-2 text-sm">
            {[
              ['Invoice line', 'INV-2026-10-0412 · overage credits · 41,240 cr'],
              ['Task', 'tsk_7Q2M · Document agent · 23 Oct 09:14 · succeeded'],
              ['Attempts', 'att_1 timeout (absorbed per D05) · att_2 succeeded'],
              ['Resources', '8,210 in / 2,311 out tok · 3 web fetch'],
              ['Sell-rate', 'sr_2026_07 → 7.4818 cr → 7.48 cr (rounded at settlement)'],
              ['Ledger', 'LED-90220 reserve 50.00 · LED-90226 settle 7.48 · release 42.52'],
            ].map(([k, v]) => (
              <li key={k} className="grid grid-cols-[120px_1fr] gap-3 rounded border p-2.5"><span className="text-xs font-medium text-muted-foreground">{k}</span><span className="font-mono text-xs">{v}</span></li>
            ))}
          </ol>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span>Provider cost (internal only):</span><Gate cap="view.margin"><span className="font-medium">$0.0614</span></Gate>
            <Prov kind="reconciled" label="Rated · rv_a_017" />
          </div>
        </StateFrame>
      </Panel>
      <Callout tone="info" title="Customer-facing mirror (G01)">The same breakdown must appear in customer usage history; only the admin side is designed here.</Callout>
    </div>
  )
}

export function GoodwillSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Goodwill & service credits" features={['SA15.04', 'SA04.03']} className="col-span-2" description="Separate transaction type — never edits a prior charge.">
        <StateFrame features={['SA15.04']} cap="view.customer">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Company"><select className={inputCls}><option>CO-10377 Brightpath Health</option></select></Field>
            <Field label="Type"><select className={inputCls}><option>Goodwill credits</option><option>SLA service credit</option></select></Field>
            <Field label="Amount"><input className={inputCls} defaultValue="5,000 cr" /></Field>
            <Field label="Linked case"><input className={inputCls} defaultValue="CASE-2288" /></Field>
            <Field label="Expiry"><input className={inputCls} defaultValue="90 days" /></Field>
            <Field label="Bucket"><select className={inputCls}><option>Promotional (spent first)</option></select></Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ActionButton label="Request grant" cap="act.support" variant="default" icon={<Gift />} dialog={{ title: 'Request goodwill 5,000 cr', feature: 'SA15.04', secondReview: true, impact: ['Above 2,000 cr support limit → Finance approves', 'Posts as separate ledger entry type goodwill', 'Cost tagged to support / retention'] }} />
            <span className="text-xs text-muted-foreground">Support limit 2,000 cr without approval</span>
          </div>
        </StateFrame>
      </Panel>
      <Callout tone="warn" title="C04 · role grant vs P1">The roles table lets Support grant goodwill, but SA15.04 is P1. At P0 support can only request adjustments via SA04.03.</Callout>
    </div>
  )
}
