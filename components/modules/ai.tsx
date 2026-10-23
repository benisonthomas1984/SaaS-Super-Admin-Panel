import { Plus, PlayCircle, Undo2 } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function RegistrySection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Provider & model registry" features={['SA10.01', 'SA03.02']} description="A route is enabled only when priced, instrumented and approved for the region." actions={
        <ActionButton label="Register model" cap="act.ops" icon={<Plus />} dialog={{ title: 'Register model version', feature: 'SA10.01', impact: ['Starts Disabled until a rate version exists (SA03.02)', 'Requires region approval + data policy check (SA13.03)'] }} />
      }>
        <StateFrame features={['SA10.01']} cap="view.usage">
          <DataTable dense columns={[{ key: 'm', label: 'Model version', mono: true }, { key: 'p', label: 'Provider' }, { key: 'r', label: 'Regions' }, { key: 'cap', label: 'Capabilities' }, { key: 'price', label: 'Priced' }, { key: 'inst', label: 'Instrumented' }, { key: 'st', label: 'Status' }, { key: 'dep', label: 'Deprecation' }]} rows={[
            { m: 'prov-a/text-large-2026-03', p: 'Provider A', r: 'US, EU', cap: 'text · tools · 200K ctx', price: <Badge tone="good">rv_a_017</Badge>, inst: <Badge tone="good">Yes</Badge>, st: <Badge tone="good">Enabled</Badge>, dep: '—' },
            { m: 'prov-a/text-small-2026-02', p: 'Provider A', r: 'US, EU', cap: 'text · 128K ctx', price: <Badge tone="good">rv_a_015</Badge>, inst: <Badge tone="good">Yes</Badge>, st: <Badge tone="good">Enabled</Badge>, dep: '—' },
            { m: 'prov-b/chat-mid-2026-01', p: 'Provider B', r: 'US', cap: 'text · tools', price: <Badge tone="good">rv_b_009</Badge>, inst: <Badge tone="good">Yes</Badge>, st: <Badge tone="warn">Degraded</Badge>, dep: '—' },
            { m: 'prov-b/chat-mid-2025-06', p: 'Provider B', r: 'US', cap: 'text', price: <Badge tone="good">rv_b_004</Badge>, inst: <Badge tone="good">Yes</Badge>, st: <Badge tone="neutral">Deprecated</Badge>, dep: 'Retires 30 Nov · 3 companies pinned' },
            { m: 'prov-c/vision-xl-0925', p: 'Provider C', r: 'US', cap: 'vision · OCR', price: <Badge tone="bad">Unpriced</Badge>, inst: <Badge tone="good">Yes</Badge>, st: <Badge tone="bad">Blocked · no rate</Badge>, dep: '—' },
          ]} />
        </StateFrame>
      </Panel>
      <Assumption decision="D15">Production routes require a rate version; unpriced routes are allowed only in staging/evaluation.</Assumption>
    </div>
  )
}

export function RoutingSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Routing policy · Document agent" features={['SA10.02']} className="col-span-2" description="Fallback only to routes compatible on region, data policy, capability and price ceiling.">
        <StateFrame features={['SA10.02']} cap="view.usage">
          <ol className="flex flex-col gap-2 text-sm">
            {[
              ['Primary', 'prov-a/text-large-2026-03', 'good', 'Healthy · p95 4.1 s'],
              ['Fallback 1', 'prov-a/text-small-2026-02', 'good', 'Eligible · cheaper · same region'],
              ['Fallback 2', 'prov-b/chat-mid-2026-01', 'warn', 'Ineligible for EU tenants (region)'],
            ].map(([k, m, t, n]) => (
              <li key={k} className="flex items-center gap-3 rounded border p-3">
                <span className="w-24 text-xs font-medium text-muted-foreground">{k}</span>
                <span className="flex-1 font-mono text-xs">{m}</span>
                <Badge tone={t as 'good' | 'warn'}>{n}</Badge>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <Field label="Retry limit"><input className={inputCls} defaultValue="2 per attempt" /></Field>
            <Field label="Price ceiling"><input className={inputCls} defaultValue="1.25× primary" /></Field>
            <Field label="Prompt cache"><select className={inputCls}><option>Provider cache on</option><option>Off</option></select></Field>
            <Field label="Response cache" hint="Tenant-scoped keys"><select className={inputCls}><option>Off</option><option>On · 24 h · per tenant</option></select></Field>
          </div>
        </StateFrame>
      </Panel>
      <Panel title="Cache & fallback effect · 7 d" features={['SA10.02', 'SA03.01']}>
        <KV items={[['Fallback attempts', '1,204 (0.6%)'], ['Cached input share', '38%'], ['Savings vs uncached', <Gate key="s" cap="view.margin"><span className="italic">≈ $3,880</span></Gate>], ['Cross-tenant cache hits', <Badge key="x" tone="good">0 (enforced)</Badge>]]} />
      </Panel>
    </div>
  )
}

export function GuardrailsSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Agent execution limits" features={['SA10.03', 'SA12.01']} description="Every run is bounded. Hitting a limit ends the run with a recorded reason.">
        <StateFrame features={['SA10.03']} cap="view.usage">
          <DataTable dense columns={[{ key: 'a', label: 'Agent / workflow' }, { key: 's', label: 'Max steps', align: 'right' }, { key: 't', label: 'Max tokens', align: 'right' }, { key: 'tool', label: 'Tool calls', align: 'right' }, { key: 'w', label: 'Wall time', align: 'right' }, { key: 'c', label: 'Child agents', align: 'right' }, { key: 'cr', label: 'Credit cap', align: 'right' }, { key: 'appr', label: 'Approval required' }]} rows={[
            { a: 'document_agent', s: '25', t: '400K', tool: '40', w: '10 min', c: '3', cr: '2,000', appr: 'External email send' },
            { a: 'table_extractor (child)', s: '10', t: '120K', tool: '10', w: '3 min', c: '0', cr: '600', appr: '—' },
            { a: 'support_copilot', s: '8', t: '60K', tool: '6', w: '60 s', c: '0', cr: '200', appr: 'Refund suggestion' },
            { a: 'nightly_digest (scheduled)', s: '40', t: '800K', tool: '80', w: '30 min', c: '5', cr: '5,000', appr: '—' },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Recently stopped runs" features={['SA10.03', 'SA12.02']}>
        <DataTable dense columns={[{ key: 'r', label: 'Run', mono: true }, { key: 'co', label: 'Company', mono: true }, { key: 'reason', label: 'Stop reason' }, { key: 'cost', label: 'Incurred', align: 'right' }]} rows={[
          { r: 'run_88f1', co: 'CO-10233', reason: <Badge tone="bad">Loop detected · 25/25 steps</Badge>, cost: <Gate cap="view.margin">$4.12</Gate> },
          { r: 'run_88e7', co: 'CO-10482', reason: <Badge tone="warn">Credit cap 2,000 reached</Badge>, cost: <Gate cap="view.margin">$1.98</Gate> },
          { r: 'run_88d0', co: 'CO-10019', reason: <Badge tone="neutral">Awaiting approval · email send</Badge>, cost: <Gate cap="view.margin">$0.21</Gate> },
        ]} />
      </Panel>
    </div>
  )
}

export function EvalsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Prompt versions & evaluations · Document agent" features={['SA10.04']} className="col-span-2">
        <StateFrame features={['SA10.04']} cap="view.usage" emptyTitle="No evaluation runs" emptyHint="Run the eval set before promoting a prompt version.">
          <DataTable dense columns={[{ key: 'v', label: 'Version', mono: true }, { key: 'st', label: 'Status' }, { key: 'q', label: 'Eval quality', align: 'right' }, { key: 'c', label: 'Cost / task', align: 'right' }, { key: 'l', label: 'p95 latency', align: 'right' }, { key: 'a', label: '' }]} rows={[
            { v: 'pv_doc_15', st: <Badge tone="warn">Candidate</Badge>, q: '0.86 (+0.03)', c: '$0.37 (−4%)', l: '4.3 s', a: <ActionButton label="Promote" cap="act.ops" size="xs" icon={<PlayCircle />} dialog={{ title: 'Promote pv_doc_15', feature: 'SA10.04', impact: ['Eval set es_doc_v6 (1,200 cases) passed thresholds', 'Rollout via SA14.04 release REL-0042 (10% → 100%)', 'Rollback target: pv_doc_14'] }} /> },
            { v: 'pv_doc_14', st: <Badge tone="good">Live</Badge>, q: '0.83', c: '$0.38', l: '4.1 s', a: null },
            { v: 'pv_doc_13', st: <Badge tone="neutral">Retired</Badge>, q: '0.79', c: '$0.41', l: '4.6 s', a: <ActionButton label="Roll back" cap="act.ops" size="xs" icon={<Undo2 />} dialog={{ title: 'Roll back to pv_doc_13', feature: 'SA10.04', impact: ['Quality −0.04 vs live', 'Requires reason'] }} /> },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Callout tone="info" title="Eval data source">Eval set uses synthetic and opted-in tenant content only.</Callout>
        <Assumption decision="D13">No customer content is used for evaluation unless the tenant opted in.</Assumption>
      </div>
    </div>
  )
}
