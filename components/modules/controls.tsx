import { Power, Pencil } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Bar, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function LimitsSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Spend & rate limit hierarchy" features={['SA12.01', 'SA04.02']} description="Platform → provider → company → workspace → user → agent run. The tightest applicable limit wins; checks run before execution.">
        <StateFrame features={['SA12.01']} cap="view.usage">
          <DataTable dense columns={[{ key: 'l', label: 'Level' }, { key: 's', label: 'Scope', mono: true }, { key: 'lim', label: 'Daily spend limit', align: 'right' }, { key: 'use', label: 'Used today', width: '180px' }, { key: 'rpm', label: 'Rate limit', align: 'right' }, { key: 'b', label: 'On breach' }, { key: 'a', label: '' }]} rows={[
            { l: 'Platform', s: 'all', lim: '$12,000', use: <Bar value={4810} max={12000} label="$4,810" />, rpm: '6,000 rpm', b: 'Page on-call · deny new', a: null },
            { l: 'Provider', s: 'provider-a', lim: '$8,000', use: <Bar value={3920} max={8000} label="$3,920" />, rpm: '4,000 rpm', b: 'Fallback (SA10.02)', a: null },
            { l: 'Company', s: 'CO-10233', lim: '$400', use: <Bar value={372} max={400} tone="warn" label="$372 · 93%" />, rpm: '300 rpm', b: 'Deny new tasks', a: <ActionButton label="Edit" cap="act.ops" size="xs" icon={<Pencil />} dialog={{ title: 'Change CO-10233 daily limit', feature: 'SA12.01', impact: ['Raising above $500 requires second review', 'Takes effect on next reservation'], secondReview: true }} /> },
            { l: 'Workspace', s: 'WS-10482-ops', lim: '$120', use: <Bar value={41} max={120} label="$41" />, rpm: '120 rpm', b: 'Deny new tasks', a: null },
            { l: 'User', s: 'usr_8821', lim: '2,000 cr', use: <Bar value={1980} max={2000} tone="warn" label="1,980 cr" />, rpm: '30 rpm', b: 'Deny · notify user', a: null },
            { l: 'Agent run', s: 'document_agent', lim: '2,000 cr / run', use: <Prov kind="na" label="Per run" />, rpm: '—', b: 'Stop run · record reason', a: null },
          ]} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-2 gap-3">
        <Assumption decision="D12">Wallet/limit service unavailable → fail closed (deny new tasks). Capped emergency allowance is configurable but off.</Assumption>
        <Field label="When limit service is unavailable"><select className={inputCls}><option>Fail closed (deny new tasks)</option><option>Emergency allowance · cap $50 / company / hour</option></select></Field>
      </div>
    </div>
  )
}

export function KillSection() {
  const switches = [
    { s: 'Provider B · all models', scope: 'Platform', st: 'armed', note: 'Degraded · error rate 4.2%' },
    { s: 'Web fetch tool', scope: 'Platform', st: 'active', note: 'Active since 09:12 · reason: abuse INC-0918 · M. Okafor' },
    { s: 'nightly_digest workflow', scope: 'Platform', st: 'armed', note: '—' },
    { s: 'CO-10233 Atlas Freight · all AI', scope: 'Company', st: 'armed', note: 'Loop run_88f1 stopped' },
  ]
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Kill switches" features={['SA12.02']} className="col-span-2" description="Stops new work immediately. In-flight calls already started still incur cost and are tracked.">
        <StateFrame features={['SA12.02']} cap="view.usage">
          <ul className="flex flex-col gap-2">
            {switches.map((k) => (
              <li key={k.s} className={`flex items-center gap-3 rounded border p-3 ${k.st === 'active' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                <Power className={`size-4 ${k.st === 'active' ? 'text-destructive' : 'text-muted-foreground'}`} aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{k.s} <span className="text-xs font-normal text-muted-foreground">· {k.scope}</span></p>
                  <p className="text-xs text-muted-foreground">{k.note}</p>
                </div>
                {k.st === 'active' ? (
                  <ActionButton label="Restore" cap="act.killswitch" size="xs" dialog={{ title: `Restore ${k.s}`, feature: 'SA12.02', impact: ['New calls resume within propagation target (TBD · D17)', 'Abuse incident INC-0918 must be resolved or acknowledged'], secondReview: true }} />
                ) : (
                  <ActionButton label="Activate" cap="act.killswitch" size="xs" variant="destructive" dialog={{ title: `Activate kill switch · ${k.s}`, feature: 'SA12.02', destructive: true, confirmText: 'STOP', impact: ['Blocks new calls for 142 companies (sample)', '38 in-flight runs: allowed to finish; ≈ $11.40 still incurred', 'Fallback routes used where eligible (SA10.02)', 'Customer banner via SA15.02 template “Degraded feature”'] }} />
                )}
              </li>
            ))}
          </ul>
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <KV items={[['Propagation target', <Prov key="t" kind="pending" label="TBD · D17" />], ['Last measured', '11 s (drill 02 Oct)'], ['Activation authority', 'Owner, Operations']]} />
        <Callout tone="info" title="Never blocks admin access">Kill switches cannot disable the superadmin panel, audit log or billing webhooks.</Callout>
      </div>
    </div>
  )
}

export function AbuseSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Abuse & trial-farming signals" features={['SA12.03', 'SA05.03']} className="col-span-2">
        <StateFrame features={['SA12.03']} cap="view.security" emptyTitle="No open signals">
          <DataTable dense columns={[{ key: 's', label: 'Signal' }, { key: 'e', label: 'Entities' }, { key: 'sev', label: 'Severity' }, { key: 'act', label: 'Automatic action' }, { key: 'a', label: '' }]} rows={[
            { s: 'Shared payment fingerprint across 6 trials', e: '6 companies · 1 card', sev: <Badge tone="bad">High</Badge>, act: 'Trials frozen pending review', a: <ActionButton label="Review" cap="act.security" size="xs" dialog={{ title: 'Review trial cluster TF-0331', feature: 'SA12.03', impact: ['Choose: block, allow, or merge into one trial', 'False-positive outcome trains rule weights'] }} /> },
            { s: 'Disposable email domains', e: '14 signups / 24 h', sev: <Badge tone="warn">Medium</Badge>, act: 'Require card verification', a: null },
            { s: 'Prompt-injection exfil attempt via web fetch', e: 'CO-10601 · usr_2290', sev: <Badge tone="bad">High</Badge>, act: 'Kill switch: Web fetch (SA12.02)', a: null },
          ]} />
        </StateFrame>
      </Panel>
      <Callout tone="info" title="Reviewable">Automatic actions are reversible, reason-coded and appear in the audit trail. No permanent bans without human review.</Callout>
    </div>
  )
}

export function AlertsSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Active incidents" features={['SA12.04']} description="Related alerts are grouped. Each has an owner, acknowledgement and escalation clock.">
        <StateFrame features={['SA12.04']} cap="view.usage" emptyTitle="No active incidents">
          <DataTable dense columns={[{ key: 'i', label: 'Incident', mono: true }, { key: 't', label: 'Title' }, { key: 'al', label: 'Alerts', align: 'right' }, { key: 'o', label: 'Owner' }, { key: 'ack', label: 'Ack' }, { key: 'esc', label: 'Escalates' }]} rows={[
            { i: 'INC-0921', t: 'Provider B degraded · error rate 4.2%', al: '7', o: 'Ops on-call', ack: <Badge tone="good">09:44 · R. Chen</Badge>, esc: '—' },
            { i: 'INC-0918', t: 'Web fetch abuse · CO-10601', al: '3', o: 'Security', ack: <Badge tone="good">09:12</Badge>, esc: '—' },
            { i: 'INC-0922', t: 'Provider A reconciliation variance 3.1%', al: '1', o: 'Finance', ack: <Badge tone="warn">Unacknowledged</Badge>, esc: 'in 42 min → Finance lead' },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Alert catalogue & routing" features={['SA12.04', 'SA07.02']}>
        <DataTable dense columns={[{ key: 'id', label: 'ID', mono: true }, { key: 'a', label: 'Alert' }, { key: 'th', label: 'Threshold' }, { key: 'r', label: 'Routes to (internal)' }, { key: 'c', label: 'Customer message' }]} rows={[
          { id: 'A01', a: 'Company nearing credit limit', th: '80% / 95%', r: 'Account owner group', c: 'Via SA15.02 template (C06)' },
          { id: 'A03', a: 'Provider error rate', th: '> 2% for 5 min', r: 'Ops on-call → Eng lead (15 min)', c: 'Status banner if > 15 min' },
          { id: 'A05', a: 'Reconciliation variance', th: '> 2%', r: 'Finance', c: '—' },
          { id: 'A08', a: 'Low margin company', th: '< 20% · 7 d', r: 'Finance + Owner', c: '—' },
        ]} />
        <div className="mt-3"><Assumption decision="D20">Internal routing by admin group; quiet hours do not apply to Critical.</Assumption></div>
      </Panel>
    </div>
  )
}
