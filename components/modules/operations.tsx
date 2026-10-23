import { Pause, RotateCw, Undo2 } from 'lucide-react'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, KV, Panel, Prov } from '@/components/admin/ui'

export function PipelineSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Event pipeline freshness" features={['SA14.01', 'SA01.01']} description="Every metric card reads its freshness from here. Stale feeds mark dependent figures Incomplete.">
        <StateFrame features={['SA14.01']} cap="view.usage">
          <DataTable dense columns={[{ key: 'f', label: 'Feed' }, { key: 'l', label: 'Last event' }, { key: 'lag', label: 'Lag', align: 'right' }, { key: 'slo', label: 'Freshness target', align: 'right' }, { key: 'dlq', label: 'Dead-letter', align: 'right' }, { key: 's', label: 'Status' }]} rows={[
            { f: 'usage_events', l: '10:42:11', lag: '38 s', slo: '5 min', dlq: '0', s: <Badge tone="good">Fresh</Badge> },
            { f: 'ledger_entries', l: '10:42:09', lag: '40 s', slo: '1 min', dlq: '0', s: <Badge tone="good">Fresh</Badge> },
            { f: 'provider_b_billing', l: '21 Oct 23:00', lag: '35 h', slo: '24 h', dlq: '—', s: <Badge tone="bad">Stale</Badge> },
            { f: 'payment_webhooks', l: '10:30:02', lag: '12 min', slo: '15 min', dlq: '1', s: <Badge tone="warn">Near target</Badge> },
            { f: 'ad_spend_sync', l: '06:00:00', lag: '4.7 h', slo: '24 h', dlq: '0', s: <Badge tone="good">Fresh</Badge> },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Unmatched & duplicate events" features={['SA14.01', 'SA03.01']}>
        <KV cols={4} items={[['Duplicates dropped (24 h)', '1,412'], ['Unmatched to task', '9'], ['Unrated usage', '1,284 events'], ['Oldest unprocessed', '35 h (provider B)']]} />
      </Panel>
    </div>
  )
}

export function JobsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Background jobs" features={['SA14.02']} className="col-span-2">
        <StateFrame features={['SA14.02']} cap="view.usage" rows={5}>
          <DataTable dense columns={[{ key: 'j', label: 'Job' }, { key: 'sch', label: 'Schedule' }, { key: 'last', label: 'Last run' }, { key: 's', label: 'Status' }, { key: 'a', label: '' }]} rows={[
            { j: 'Rate usage events', sch: 'continuous', last: '10:42', s: <Badge tone="good">Running</Badge>, a: <ActionButton label="Pause" cap="act.ops" size="xs" icon={<Pause />} dialog={{ title: 'Pause usage rating', feature: 'SA14.02', impact: ['Usage continues to be captured; rating queue grows', 'Dashboard margin shows Pending until resumed'] }} /> },
            { j: 'Expire included credits', sch: 'daily 00:05 UTC', last: '00:05', s: <Badge tone="good">Succeeded</Badge>, a: null },
            { j: 'Provider B statement sync', sch: 'hourly', last: '09:00', s: <Badge tone="bad">Failed · 401</Badge>, a: <ActionButton label="Retry" cap="act.ops" size="xs" icon={<RotateCw />} dialog={{ title: 'Retry provider B sync', feature: 'SA14.02', impact: ['Idempotent: re-imports by statement ID', 'Credential may need rotation (SA11.03 pattern)'] }} /> },
            { j: 'Invoice finalization', sch: 'monthly 1st 02:00 local', last: '01 Oct', s: <Badge tone="good">Succeeded</Badge>, a: null },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Service health" features={['SA14.02']}>
        <ul className="flex flex-col gap-2 text-sm">
          {[['API gateway', 'good', '99.98%'], ['Wallet service', 'good', '99.99%'], ['Agent runtime', 'good', '99.95%'], ['Provider B', 'warn', 'Degraded'], ['Vector store', 'good', '99.97%']].map(([n, t, v]) => (
            <li key={n} className="flex justify-between"><span>{n}</span><Badge tone={t as 'good' | 'warn'}>{v}</Badge></li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

export function BackupsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Backups & integrity checks" features={['SA14.03']} className="col-span-2">
        <StateFrame features={['SA14.03']} cap="view.security">
          <DataTable dense columns={[{ key: 's', label: 'Store' }, { key: 'b', label: 'Last backup' }, { key: 'r', label: 'Last restore test' }, { key: 'i', label: 'Integrity check' }, { key: 't', label: 'RPO / RTO target' }]} rows={[
            { s: 'Ledger DB', b: '10:40 (PITR)', r: '02 Oct · passed', i: <Badge tone="good">Σ entries = balances</Badge>, t: <Prov kind="pending" label="TBD · D17" /> },
            { s: 'Billing DB', b: '10:40 (PITR)', r: '02 Oct · passed', i: <Badge tone="good">Invoices ↔ meters</Badge>, t: <Prov kind="pending" label="TBD · D17" /> },
            { s: 'Audit log', b: 'continuous', r: '02 Oct · passed', i: <Badge tone="good">Hash chain OK</Badge>, t: <Prov kind="pending" label="TBD · D17" /> },
            { s: 'Vector store', b: '23 Oct 00:00', r: <Badge tone="warn">Never tested</Badge>, i: <Prov kind="na" label="Not defined" />, t: <Prov kind="pending" label="TBD · D17" /> },
          ]} />
        </StateFrame>
      </Panel>
      <Assumption decision="D17">Recovery targets are not invented; they render as TBD until Engineering/Security set them.</Assumption>
    </div>
  )
}

export function ReleasesSection() {
  return (
    <Panel title="Admin configuration releases" features={['SA14.04', 'SA05.01', 'SA10.04']} description="Staged rollout with cohort, monitoring window and one-click rollback for pricing, routing and prompt changes.">
      <StateFrame features={['SA14.04']} cap="view.usage" emptyTitle="No releases">
        <DataTable dense columns={[{ key: 'r', label: 'Release', mono: true }, { key: 'c', label: 'Change' }, { key: 'co', label: 'Cohort' }, { key: 's', label: 'Stage' }, { key: 'm', label: 'Monitors' }, { key: 'a', label: '' }]} rows={[
          { r: 'REL-0042', c: 'Prompt pv_doc_15', co: '10% of Growth', s: <Badge tone="warn">Canary · 6 h left</Badge>, m: 'Accept rate, cost/task', a: <ActionButton label="Roll back" cap="act.ops" size="xs" icon={<Undo2 />} dialog={{ title: 'Roll back REL-0042', feature: 'SA14.04', impact: ['Restores pv_doc_14 for the cohort', 'Evidence snapshot attached to release'] }} /> },
          { r: 'REL-0041', c: 'Routing: enable prov-a small fallback', co: 'All', s: <Badge tone="good">Complete</Badge>, m: '—', a: null },
          { r: 'REL-0040', c: 'Sell-rate sr_2026_07', co: 'All (P0 publish)', s: <Badge tone="good">Complete</Badge>, m: '—', a: null },
        ]} />
        <div className="mt-3"><Callout tone="info" title="C03">Until SA14.04 ships, pricing publishes from SA05 are all-or-nothing; cohort fields render disabled there.</Callout></div>
      </StateFrame>
    </Panel>
  )
}
