import Link from 'next/link'
import { ChevronRight, Plus, Download, CalendarClock } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, Panel, Prov, inputCls } from '@/components/admin/ui'

const PATH = [
  ['Platform', '/'],
  ['Northwind Logistics', '/customers/CO-10482'],
  ['WS ops', '/customers/CO-10482?tab=workspaces'],
  ['dana@northwind', '/customers/CO-10482?tab=workspaces'],
  ['Document agent', '/usage?tab=tasks'],
  ['tsk_7Q2M', '/usage?tab=tasks'],
  ['att_2', '/usage?tab=tasks'],
] as const

export function SavedViewsSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Drill path" features={['SA01.02']} description="Every level keeps the scope bar filters. Each crumb opens the contributing records at that level.">
        <nav aria-label="Drill-down path" className="flex flex-wrap items-center gap-1 text-sm">
          {PATH.map(([l, h], i) => (
            <span key={l} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />}
              <Link href={h} className={i === PATH.length - 1 ? 'font-medium' : 'text-primary hover:underline'}>{l}</Link>
            </span>
          ))}
        </nav>
        <div className="mt-4">
          <DataTable dense columns={[{ key: 'l', label: 'Level' }, { key: 'rev', label: 'Revenue', align: 'right' }, { key: 'cost', label: 'AI cost', align: 'right' }, { key: 'm', label: 'Margin', align: 'right' }, { key: 'p', label: 'Basis' }]} rows={[
            { l: 'Company · Northwind', rev: '$18,400.00', cost: <Gate cap="view.margin">$5,102.18</Gate>, m: <Gate cap="view.margin">72.3%</Gate>, p: <Prov kind="estimated" /> },
            { l: 'Workspace · ops', rev: <Prov kind="allocated" label="Allocated by seats" />, cost: <Gate cap="view.margin">$2,881.40</Gate>, m: <Gate cap="view.margin">—</Gate>, p: <Prov kind="allocated" /> },
            { l: 'Task · tsk_7Q2M', rev: '7.48 cr', cost: <Gate cap="view.margin">$0.0614</Gate>, m: <Gate cap="view.margin">—</Gate>, p: <Prov kind="reconciled" label="Rated" /> },
          ]} />
        </div>
      </Panel>
      <Panel title="Saved views" features={['SA01.02']} actions={<ActionButton label="Save current view" cap="view.usage" icon={<Plus />} dialog={{ title: 'Save view', feature: 'SA01.02', impact: ['Saves filters and columns, not data', 'Recipients without permission see Restricted fields'] }} />}>
        <StateFrame features={['SA01.02']} cap="view.usage" emptyTitle="No saved views" emptyHint="Save a filtered dashboard or table to reuse it.">
          <DataTable dense columns={[{ key: 'n', label: 'View' }, { key: 's', label: 'Scope' }, { key: 'o', label: 'Owner' }, { key: 'u', label: 'Updated' }, { key: 'a', label: '' }]} rows={[
            { n: 'Low-margin Growth companies', s: 'Plan = Growth · margin < 30% · MTD', o: 'J. Brandt', u: '22 Oct', a: <ActionButton label="Export" cap="act.export" size="xs" icon={<Download />} dialog={{ title: 'Export permitted rows', feature: 'SA01.02', impact: ['Margin columns omitted for roles without view.margin', 'Export is audited (SA13.02)'] }} /> },
            { n: 'EU region usage', s: 'Region = EU · last 30 d', o: 'M. Okafor', u: '19 Oct', a: null },
          ]} />
        </StateFrame>
      </Panel>
    </div>
  )
}

export function ScheduledSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Scheduled reports & export jobs" features={['SA01.04']} className="col-span-2" actions={
        <ActionButton label="New schedule" cap="act.export" icon={<CalendarClock />} dialog={{ title: 'Schedule report', feature: 'SA01.04', impact: ['Preview → recipients (allowlisted domains only) → cadence → enable', 'Contains customer financial data: link expires in 72 h'] }} />
      }>
        <StateFrame features={['SA01.04']} cap="view.finance" emptyTitle="No schedules">
          <DataTable dense columns={[{ key: 'r', label: 'Report' }, { key: 'c', label: 'Cadence' }, { key: 'to', label: 'Recipients' }, { key: 'last', label: 'Last delivery' }, { key: 's', label: 'Status' }]} rows={[
            { r: 'Weekly business review', c: 'Mon 08:00 UTC', to: 'exec@ledgerline (4)', last: '20 Oct', s: <Badge tone="good">Delivered</Badge> },
            { r: 'Month-end margin pack', c: 'After period close', to: 'finance@ledgerline', last: 'Sep close', s: <Badge tone="neutral">Waiting on Oct close</Badge> },
            { r: 'Board metrics', c: 'Quarterly', to: 'board@external.example', last: '—', s: <Badge tone="bad">Blocked · domain not allowlisted</Badge> },
            { r: 'Export · usage_events Oct', c: 'One-off', to: 'J. Brandt', last: '10:20', s: <Badge tone="warn">Retry 2/3 · timeout</Badge> },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Field label="Recipient domain allowlist"><input className={inputCls} defaultValue="ledgerline.example" /></Field>
        <Callout tone="info" title="Snapshot labelling">Reports state whether figures were Estimated or Reconciled at send time.</Callout>
        <Assumption decision="D13">Exports never include prompt or response content.</Assumption>
      </div>
    </div>
  )
}
