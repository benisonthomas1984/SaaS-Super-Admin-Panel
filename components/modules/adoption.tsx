import { StateFrame, Gate } from '@/components/admin/state'
import { Assumption, Badge, Bar, Callout, DataTable, KV, Panel, Prov } from '@/components/admin/ui'

export function ActivationSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Feature adoption · Oct MTD" features={['SA09.01']} className="col-span-2" description="Breadth (companies using) × depth (accepted outcomes per active seat). Internal and evaluation traffic excluded.">
        <StateFrame features={['SA09.01']} cap="view.usage">
          <DataTable dense columns={[{ key: 'f', label: 'Feature' }, { key: 'b', label: 'Companies using', align: 'right' }, { key: 'bar', label: 'Breadth', width: '160px' }, { key: 'd', label: 'Outcomes / seat', align: 'right' }, { key: 'a', label: 'Activation event' }]} rows={[
            { f: 'Document agent', b: '318 / 412', bar: <Bar value={318} max={412} />, d: '41.2', a: 'Document accepted' },
            { f: 'Support copilot', b: '201 / 412', bar: <Bar value={201} max={412} />, d: '88.0', a: 'Draft sent unedited' },
            { f: 'Data extraction API', b: '64 / 412', bar: <Bar value={64} max={412} />, d: '—', a: <Prov kind="na" label="No seat model" /> },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <KV items={[['Seat utilization (paid)', '78%'], ['Time to first value (median)', '2.4 days'], ['Activated within 14 d', '36.7%']]} />
        <Assumption decision="D11">Activation proven by an accepted-outcome event, defined per feature.</Assumption>
      </div>
    </div>
  )
}

export function SuccessSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Task success by model & prompt version" features={['SA09.02', 'SA03.01']} description="Joins outcome + feedback to model ID and prompt version captured at execution.">
        <StateFrame features={['SA09.02']} cap="view.usage">
          <DataTable dense columns={[{ key: 'f', label: 'Feature' }, { key: 'm', label: 'Model', mono: true }, { key: 'pv', label: 'Prompt ver.', mono: true }, { key: 'n', label: 'Tasks', align: 'right' }, { key: 's', label: 'Completed', align: 'right' }, { key: 'acc', label: 'Accepted', align: 'right' }, { key: 'fb', label: 'Feedback +/−', align: 'right' }, { key: 'cost', label: 'Cost / accepted', align: 'right' }]} rows={[
            { f: 'Document agent', m: 'prov-a/text-large', pv: 'pv_doc_14', n: '48,210', s: '96.1%', acc: '81.4%', fb: '2,104 / 312', cost: <Gate cap="view.margin">$0.61</Gate> },
            { f: 'Document agent', m: 'prov-a/text-large', pv: 'pv_doc_13', n: '12,880', s: '95.4%', acc: '76.0%', fb: '611 / 140', cost: <Gate cap="view.margin">$0.66</Gate> },
            { f: 'Support copilot', m: 'prov-b/chat-mid', pv: 'pv_sup_07', n: '210,442', s: '99.2%', acc: '68.9%', fb: <Prov kind="unknown" label="Sparse" />, cost: <Gate cap="view.margin">$0.09</Gate> },
          ]} />
        </StateFrame>
      </Panel>
      <Callout tone="info" title="Contradiction C02 handled">Prompt version IDs are captured on every task at P0 so this view works; evaluation releases (SA10.04) remain P1.</Callout>
    </div>
  )
}

export function RetentionSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Revenue retention · trailing 12 months" features={['SA09.03']} className="col-span-2">
        <StateFrame features={['SA09.03']} cap="view.finance">
          <div className="grid grid-cols-4 gap-3">
            {[['Gross revenue retention', '91.2%'], ['Net revenue retention', '108.4%'], ['Logo churn (monthly)', '1.9%'], ['Contraction MRR', '$4,120']].map(([l, v]) => (
              <div key={l} className="rounded border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-xl font-semibold tabular">{v}</p></div>
            ))}
          </div>
          <div className="mt-4">
            <DataTable dense columns={[{ key: 'k', label: 'Churn reason (Oct)' }, { key: 'n', label: 'Companies', align: 'right' }, { key: 'm', label: 'MRR lost', align: 'right' }, { key: 't', label: 'Type' }]} rows={[
              { k: 'Budget / price', n: '3', m: '$1,840', t: <Badge tone="neutral">Voluntary</Badge> },
              { k: 'Payment failure', n: '2', m: '$960', t: <Badge tone="warn">Involuntary</Badge> },
              { k: 'Moved to competitor', n: '1', m: '$1,320', t: <Badge tone="neutral">Voluntary</Badge> },
              { k: 'Not recorded', n: '1', m: '$480', t: <Prov kind="unknown" /> },
            ]} />
          </div>
        </StateFrame>
      </Panel>
      <Callout tone="info" title="Definitions">Churn is measured at company level (billing owner). Pauses are excluded from churn and shown separately (2 paused).</Callout>
    </div>
  )
}

export function HealthSection() {
  return (
    <Panel title="Customer health & support burden" features={['SA09.04', 'SA15.01']} description="Advisory signals with reasons. Never auto-changes billing or access.">
      <StateFrame features={['SA09.04']} cap="view.customer">
        <DataTable dense columns={[{ key: 'c', label: 'Company' }, { key: 'h', label: 'Health' }, { key: 'r', label: 'Top reasons' }, { key: 's', label: 'Support hrs (30 d)', align: 'right' }, { key: 'm', label: 'Missing signals' }]} rows={[
          { c: 'Brightpath Health', h: <Badge tone="bad">At risk</Badge>, r: 'Past due 21 d · usage −42% · 3 open cases', s: '7.5', m: '—' },
          { c: 'Atlas Freight Inc.', h: <Badge tone="warn">Watch</Badge>, r: 'Dispute open · negative contribution', s: '4.0', m: 'NPS' },
          { c: 'Northwind Logistics', h: <Badge tone="good">Healthy</Badge>, r: 'Seat util 92% · accepted 81%', s: '1.0', m: 'NPS' },
          { c: 'Quillon Analytics', h: <Prov kind="incomplete" label="Not scored" />, r: '2 of 5 signals missing', s: '0.5', m: 'Acquisition, NPS' },
        ]} />
        <div className="mt-3"><Assumption decision="D09">Support hours come from SA15.01 case time tracking; classified per C05 setting.</Assumption></div>
      </StateFrame>
    </Panel>
  )
}
