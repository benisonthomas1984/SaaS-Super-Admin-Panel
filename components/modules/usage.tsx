import { Upload, Plus, CheckCheck } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, FilterChips, KV, Panel, Prov, inputCls } from '@/components/admin/ui'
import { fmtMoney } from '@/lib/sample-data'

export function TasksSection() {
  const tasks = [
    { id: 'tsk_01JB8Q', co: 'CO-10482', f: 'Document agent', m: 'prov-a/text-large-2026-03', st: 'Completed', att: 3, cr: '412', cost: 0.3812, prov: 'estimated' },
    { id: 'tsk_01JB8R', co: 'CO-10019', f: 'Support copilot', m: 'prov-b/chat-mid-2026-01', st: 'Completed', att: 1, cr: '38', cost: null, prov: 'pending' },
    { id: 'tsk_01JB8S', co: 'CO-10512', f: 'Data extraction API', m: 'prov-c/vision-xl-0925', st: 'Completed', att: 1, cr: '—', cost: null, prov: 'unrated' },
    { id: 'tsk_01JB8T', co: 'CO-10377', f: 'Document agent', m: 'prov-a/text-large-2026-03', st: 'Unknown outcome', att: 2, cr: '120 reserved', cost: 0.1104, prov: 'estimated' },
    { id: 'tsk_01JB8U', co: 'CO-10482', f: 'Document agent', m: 'prov-a/text-small-2026-02', st: 'Cancelled by user', att: 1, cr: '0', cost: 0.0042, prov: 'reconciled' },
  ] as const
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3 rounded-md border bg-card px-4 py-3">
        {[['Company', ['All', 'CO-10482', 'CO-10019']], ['Feature', ['All', 'Document agent', 'Support copilot', 'Data extraction API']], ['Model', ['All', 'prov-a/text-large-2026-03', 'prov-b/chat-mid-2026-01']], ['Status', ['All', 'Completed', 'Failed', 'Cancelled', 'Unknown outcome']], ['Environment', ['Production', 'Staging', 'Evaluation']]].map(([l, o]) => (
          <Field key={l as string} label={l as string}><select className={inputCls}>{(o as string[]).map((x) => <option key={x}>{x}</option>)}</select></Field>
        ))}
        <Field label="Task / correlation ID"><input className={inputCls} placeholder="tsk_… or corr_…" /></Field>
        <FilterChips items={['Oct 1–23', 'Production', 'Excl. internal traffic']} />
      </div>
      <Panel title="Root tasks" features={['SA03.01']} description="One row per customer-facing request. Cost status shows whether the provider cost is rated, pending a rate, or reconciled.">
        <StateFrame features={['SA03.01']} cap="view.usage" rows={6} emptyTitle="No tasks for this scope" emptyHint="No usage events matched. This is not the same as zero cost — check pipeline freshness (SA14.01).">
          <DataTable dense columns={[{ key: 'id', label: 'Task', mono: true }, { key: 'co', label: 'Company', mono: true }, { key: 'f', label: 'Feature' }, { key: 'm', label: 'Model (version)', mono: true }, { key: 'st', label: 'Status' }, { key: 'att', label: 'Attempts', align: 'right' }, { key: 'cr', label: 'Credits charged', align: 'right' }, { key: 'cost', label: 'Provider cost', align: 'right' }]} rows={tasks.map((t) => ({
            ...t,
            st: <Badge tone={t.st === 'Completed' ? 'good' : t.st.startsWith('Unknown') ? 'warn' : 'neutral'}>{t.st}</Badge>,
            cost: <span className="flex items-center justify-end gap-1.5">{t.cost === null ? null : <Gate cap="view.margin">{fmtMoney(t.cost, 4)}</Gate>}<Prov kind={t.prov} /></span>,
          }))} />
        </StateFrame>
      </Panel>
      <Panel title="Task tree · tsk_01JB8Q" features={['SA03.01', 'SA10.03']} description="CO-10482 · Document agent · prompt version pv_doc_14 · started 23 Oct 09:12:04 UTC">
        <StateFrame features={['SA03.01']} cap="view.usage">
          <ol className="flex flex-col gap-1 font-mono text-xs">
            {[
              ['0', 'root task', 'Completed', '412 cr charged once at settlement'],
              ['1', '├ attempt 1 · prov-a/text-large · 8,210 in / 1,904 out tok', 'Failed · provider 529', '$0.1210 incurred · not billed (D05)'],
              ['1', '├ attempt 2 · prov-a/text-large · 8,210 in / 2,311 out tok', 'Completed', '$0.1288'],
              ['2', '│ ├ tool: web_fetch × 3', 'Completed', '$0.0030'],
              ['2', '│ ├ child agent: table_extractor', 'Completed', '$0.0814'],
              ['2', '│ └ embedding · 14 chunks', 'Completed', '$0.0004'],
              ['1', '└ attempt 3 · guardrail check', 'Completed', '$0.0466'],
            ].map(([d, l, s, c], i) => (
              <li key={i} className="flex items-center gap-3 rounded px-2 py-1 hover:bg-muted/50">
                <span className="flex-1 whitespace-pre">{l}</span>
                <Badge tone={s.startsWith('Failed') ? 'bad' : 'good'}>{s}</Badge>
                <span className="w-60 text-right text-muted-foreground">{c}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3"><Assumption decision="D05">Failed provider attempts are internal cost, not customer billable. Partial results are billed only for completed attempts.</Assumption></div>
        </StateFrame>
      </Panel>
    </div>
  )
}

export function RatesSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Provider rate catalogue" features={['SA03.02', 'SA10.01']} description="Effective-dated. Historical tasks keep the rate version used at execution." actions={
        <ActionButton label="Add future rate" cap="act.pricing" icon={<Plus />} dialog={{
          title: 'Add rate version for prov-a/text-large-2026-03', feature: 'SA03.02',
          impact: ['Effective 1 Nov 2026 00:00 UTC — does not change October tasks', 'Previous version remains for historical rating', 'Contract source required'],
          fields: <div className="grid grid-cols-3 gap-3"><Field label="Input / 1M tok"><input className={inputCls} defaultValue="$2.40" /></Field><Field label="Output / 1M tok"><input className={inputCls} defaultValue="$9.60" /></Field><Field label="Effective from"><input className={inputCls} defaultValue="2026-11-01" /></Field></div>,
        }} />
      }>
        <StateFrame features={['SA03.02']} cap="view.margin">
          <DataTable dense columns={[{ key: 'm', label: 'Model / resource', mono: true }, { key: 'u', label: 'Unit' }, { key: 'r', label: 'Rate (SAMPLE)', align: 'right' }, { key: 'v', label: 'Version', mono: true }, { key: 'e', label: 'Effective' }, { key: 's', label: 'Source' }]} rows={[
            { m: 'prov-a/text-large-2026-03', u: 'input / output · 1M tok', r: '$2.50 / $10.00', v: 'rv_a_017', e: '1 Mar 2026 → open', s: 'Public list · retrieved 01 Mar' },
            { m: 'prov-a/text-large-2026-03', u: 'cached input · 1M tok', r: '$1.25', v: 'rv_a_018', e: '1 Mar 2026 → open', s: 'Public list' },
            { m: 'prov-b/chat-mid-2026-01', u: 'input / output · 1M tok', r: '$0.80 / $3.20', v: 'rv_b_009', e: '1 Jan 2026 → open', s: 'Contract PB-2025-11 (−15%)' },
            { m: 'prov-c/vision-xl-0925', u: '—', r: <Prov kind="unrated" label="No rate" />, v: '—', e: '—', s: 'Missing' },
            { m: 'search-tool/web_fetch', u: 'per call', r: '$0.0010', v: 'rv_t_003', e: '1 Jun 2026 → open', s: 'Invoice-derived' },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Unrated exception queue" features={['SA03.02', 'SA12.04']} description="Alert A05. Unrated usage is excluded from cost totals and labelled — never priced at zero.">
        <StateFrame features={['SA03.02']} cap="view.usage" emptyTitle="No unrated usage" emptyHint="Every metered event has a rate version.">
          <DataTable dense columns={[{ key: 'k', label: 'Unmatched key', mono: true }, { key: 'n', label: 'Events', align: 'right' }, { key: 'c', label: 'Companies', align: 'right' }, { key: 'f', label: 'First seen' }, { key: 'a', label: '' }]} rows={[
            { k: 'prov-c/vision-xl-0925', n: '1,284', c: '7', f: '19 Oct 02:14 UTC', a: <ActionButton label="Map to rate" cap="act.pricing" size="xs" dialog={{ title: 'Map unrated model', feature: 'SA03.02', impact: ['Re-rates 1,284 events with chosen version', 'Customer charges do not change (sell rate is separate, SA05.02)'] }} /> },
            { k: 'storage/vector-gb-hour', n: '96', c: '2', f: '22 Oct 18:00 UTC', a: <ActionButton label="Map to rate" cap="act.pricing" size="xs" dialog={{ title: 'Map unrated resource', feature: 'SA03.02', impact: ['Re-rates 96 events'] }} /> },
          ]} />
        </StateFrame>
      </Panel>
    </div>
  )
}

export function SharedCostsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Non-token and shared costs · Sep 2026" features={['SA03.03']} className="col-span-2" description="Direct costs attach to records; shared costs use a versioned allocation driver. Totals tie to the source invoice.">
        <StateFrame features={['SA03.03']} cap="view.margin" incomplete="Finance opex import for Oct not yet received — showing Sep (closed).">
          <DataTable dense columns={[{ key: 'c', label: 'Cost' }, { key: 'src', label: 'Source invoice' }, { key: 'd', label: 'Direct', align: 'right' }, { key: 'a', label: 'Allocated', align: 'right' }, { key: 'u', label: 'Unallocated', align: 'right' }, { key: 'drv', label: 'Driver (version)' }]} rows={[
            { c: 'Vector database', src: 'VDB-INV-0926', d: '$3,812.00', a: '$1,140.00', u: '$0.00', drv: 'GB-month · alloc_v3' },
            { c: 'Object storage', src: 'S3-INV-0926', d: '$1,204.55', a: '$0.00', u: '$0.00', drv: 'Direct by bucket' },
            { c: 'Hosting & compute', src: 'HOST-0926', d: '$0.00', a: '$8,960.00', u: '$412.30', drv: 'Rated-cost share · alloc_v3' },
            { c: 'OCR / transcription', src: 'OCR-0926', d: '$2,118.40', a: '$0.00', u: '$0.00', drv: 'Direct by task' },
            { c: 'Observability', src: 'OBS-0926', d: '$0.00', a: '$1,880.00', u: '$0.00', drv: 'Equal per active company' },
          ]} />
          <p className="mt-2 text-xs text-muted-foreground">Unallocated remainder $412.30 is shown, not spread silently. Tie-out: $19,527.25 = sum of source invoices ✓</p>
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Allocation policy" features={['SA03.03']}>
          <div className="flex flex-col gap-3">
            <Field label="Hosting driver"><select className={inputCls} defaultValue="share"><option value="share">Rated-cost share</option><option>Equal per active company</option><option>Request count</option></select></Field>
            <Field label="Support labor classification" hint="Single setting resolves contradiction C05"><select className={inputCls}><option>Contribution deduction (SA15.01)</option><option>Shared service cost (SA03.03)</option></select></Field>
            <ActionButton label="Publish alloc_v4" cap="act.pricing" variant="default" dialog={{ title: 'Publish allocation version alloc_v4', feature: 'SA03.03', impact: ['Applies from Nov 2026 forward', 'Closed periods keep alloc_v3', 'Unit economics will label the driver version per period'] }} />
          </div>
        </Panel>
        <Assumption decision="D09">Usage-weighted allocation for hosting; equal-per-company for observability until Finance chooses drivers.</Assumption>
      </div>
    </div>
  )
}

export function ReconcileSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Provider reconciliation" features={['SA03.04']} description="Estimated (internally rated) vs provider statement. Only marked Reconciled when variance is within tolerance or explained by a linked adjustment." actions={
        <ActionButton label="Import statement" cap="act.finance" icon={<Upload />} dialog={{ title: 'Import provider statement', feature: 'SA03.04', impact: ['Parses line items; matches by account, project, key, model, date', 'Does not modify tasks; creates variance rows', 'Duplicate statement IDs are rejected'] }} />
      }>
        <StateFrame features={['SA03.04']} cap="view.margin" rows={5}>
          <DataTable columns={[{ key: 'p', label: 'Provider · period' }, { key: 'e', label: 'Internal estimate', align: 'right' }, { key: 's', label: 'Statement', align: 'right' }, { key: 'v', label: 'Variance', align: 'right' }, { key: 't', label: 'Tolerance' }, { key: 'st', label: 'Status' }, { key: 'a', label: '' }]} rows={[
            { p: 'Provider A · Sep 2026', e: <span className="italic">{fmtMoney(45210.04)}</span>, s: fmtMoney(45622.22), v: <span className="text-warn">+$412.18 (0.91%)</span>, t: '±0.5%', st: <Prov kind="pending" label="Variance open" />, a: <ActionButton label="Post adjustment" cap="act.finance" size="xs" dialog={{ title: 'Post linked cost adjustment', feature: 'SA03.04', impact: ['Creates adjustment ADJ-PA-0926 for $412.18 linked to statement', 'Original rated tasks are not edited', 'Reason code required (e.g. cached-token rounding)'], fields: <Field label="Reason code"><select className={inputCls}><option>Provider rounding</option><option>Missing internal events</option><option>Rate version error</option></select></Field> }} /> },
            { p: 'Provider B · Sep 2026', e: <span className="italic">{fmtMoney(28190.4)}</span>, s: fmtMoney(28201.1), v: '+$10.70 (0.04%)', t: '±0.5%', st: <Prov kind="reconciled" />, a: null },
            { p: 'Provider C · Sep 2026', e: <span className="italic">{fmtMoney(6402.0)}</span>, s: fmtMoney(6402.0), v: '$0.00', t: '±0.5%', st: <Prov kind="reconciled" />, a: null },
            { p: 'Provider B · Oct 2026', e: <span className="italic">≈ {fmtMoney(21010.0)}</span>, s: <Prov kind="na" label="Not issued" />, v: '—', t: '±0.5%', st: <Prov kind="incomplete" label="Feed missing 21–23 Oct" />, a: null },
          ]} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Callout tone="info" title="Unmatched statement lines: 3 ($18.40)">Project key <span className="font-mono">proj_legacy_eu</span> not mapped to any company. Shown as unmatched, never assigned to a customer.</Callout>
            <KV items={[['Match keys', 'account · project · key · model · date'], ['Billing boundary', 'UTC calendar day (D18 assumption)']]} />
          </div>
          <div className="mt-3 flex justify-end">
            <ActionButton label="Mark Provider A Sep reconciled" cap="act.finance" icon={<CheckCheck />} dialog={{ title: 'Mark reconciled', feature: 'SA03.04', impact: ['Blocked while variance exceeds tolerance without a linked adjustment', 'Locks rated cost for Sep · Provider A'], uncertain: 'Variance +0.91% exceeds ±0.5%. Post an adjustment first; otherwise the server rejects this action.' }} />
          </div>
        </StateFrame>
      </Panel>
    </div>
  )
}
