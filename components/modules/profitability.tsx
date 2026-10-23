import { Lock, Unlock } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'
import { COMPANIES, fmtMoney, fmtPct } from '@/lib/sample-data'

export function ClassificationSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Chart-of-accounts mapping" features={['SA07.01']} className="col-span-2" description="Each expense belongs to exactly one category. Service cost and operating expense are mutually exclusive.">
        <StateFrame features={['SA07.01']} cap="view.margin">
          <DataTable dense columns={[{ key: 'e', label: 'Expense source' }, { key: 'c', label: 'Category' }, { key: 'a', label: 'GL account', mono: true }, { key: 's', label: 'Mapping' }]} rows={[
            { e: 'AI provider usage', c: 'Service cost', a: '5010', s: <Badge tone="outline">Default (D08)</Badge> },
            { e: 'Vector DB, storage, OCR', c: 'Service cost', a: '5020', s: <Badge tone="outline">Default (D08)</Badge> },
            { e: 'Payment processing fees', c: 'Contribution deduction', a: '5110', s: <Badge tone="outline">Default (D08)</Badge> },
            { e: 'Support labor', c: 'Contribution deduction', a: '5120', s: <Badge tone="warn">See C05</Badge> },
            { e: 'Ad spend', c: 'Operating · acquisition', a: '6100', s: <Badge tone="outline">Default (D08)</Badge> },
            { e: 'Payroll (non-support)', c: 'Operating expense', a: '6200', s: <Badge tone="outline">Default (D08)</Badge> },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Revenue recognition" features={['SA07.01']}>
          <KV items={[['Annual prepay (CO-10019)', '$258,000 over 12 mo'], ['Recognized Oct MTD', <span key="r" className="italic">≈ $15,966</span>], ['Deferred balance', '$193,500'], ['Period status', <Prov key="p" kind="provisional" label="Open" />]]} />
        </Panel>
        <Assumption decision="D08">Default classification shown until Finance uploads the chart-of-accounts mapping.</Assumption>
      </div>
    </div>
  )
}

export function UnitEconomicsSection() {
  const rows = COMPANIES.filter((c) => c.revenue > 0 || c.cost > 0)
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Customer unit economics · Oct MTD" features={['SA07.02']} description="Revenue − direct cost − allocated cost − payment fees − support = contribution. Incomplete coverage is labelled, never filled with zero.">
        <StateFrame features={['SA07.02']} cap="view.margin" rows={8}>
          <DataTable dense columns={[{ key: 'c', label: 'Company' }, { key: 'p', label: 'Plan' }, { key: 'r', label: 'Revenue', align: 'right' }, { key: 'd', label: 'Direct cost', align: 'right' }, { key: 'a', label: 'Allocated', align: 'right' }, { key: 'ct', label: 'Contribution', align: 'right' }, { key: 'm', label: 'Margin', align: 'right' }, { key: 'cov', label: 'Coverage' }]} rows={rows.map((c) => {
            const alloc = c.cost * 0.12
            const contrib = c.revenue - c.cost - alloc
            const margin = c.revenue > 0 ? (contrib / c.revenue) * 100 : null
            return {
              c: <span className="font-medium">{c.name} <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span></span>,
              p: <span className="text-xs">{c.plan}</span>,
              r: fmtMoney(c.revenue, 0),
              d: fmtMoney(c.cost, 0),
              a: <span className="text-muted-foreground">{fmtMoney(alloc, 0)}</span>,
              ct: <Gate cap="view.margin"><span className={contrib < 0 ? 'font-semibold text-destructive' : ''}>{fmtMoney(contrib, 0)}</span></Gate>,
              m: margin === null ? <Prov kind="na" label="n.a. · no revenue" /> : <span className={margin < 20 ? 'text-warn' : ''}>{fmtPct(margin)}</span>,
              cov: c.costCoverage < 100 ? <Prov kind="incomplete" label={`${c.costCoverage}%`} /> : <Prov kind="direct" label="100%" />,
            }
          })} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Feature & model cost" features={['SA07.02']} description="Feature revenue is not separately attributable → cost-only view (no margin invented).">
          <DataTable dense columns={[{ key: 'f', label: 'Feature' }, { key: 'c', label: 'Cost', align: 'right' }, { key: 'p', label: 'Cost / accepted outcome', align: 'right' }, { key: 'r', label: 'Revenue' }]} rows={[
            { f: 'Document agent', c: '$41,204', p: '$0.61', r: <Prov kind="na" label="Not attributable" /> },
            { f: 'Support copilot', c: '$18,812', p: '$0.09', r: <Prov kind="na" label="Not attributable" /> },
            { f: 'Data extraction API', c: '$11,888', p: '$0.33', r: <Prov kind="incomplete" label="1,284 unrated" /> },
          ]} />
        </Panel>
        <Panel title="Thresholds" features={['SA07.02', 'SA12.04']}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Low-margin alert"><input className={inputCls} defaultValue="< 20% (A08)" /></Field>
            <Field label="Negative contribution alert"><input className={inputCls} defaultValue="< $0 for 7 days" /></Field>
          </div>
          <div className="mt-3"><Assumption decision="D09">Allocated cost = 12% of direct cost (rated-cost share, alloc_v3) for this sample.</Assumption></div>
        </Panel>
      </div>
    </div>
  )
}

export function OperatingSection() {
  return (
    <div className="grid grid-cols-2 gap-5">
      <Panel title="Operating result (accrual) · Oct MTD" features={['SA07.03']}>
        <StateFrame features={['SA07.03']} cap="view.margin" incomplete="Finance opex import for Oct not received; operating expenses shown as Incomplete.">
          <DataTable dense columns={[{ key: 'l', label: 'Line' }, { key: 'v', label: 'Amount', align: 'right' }, { key: 's', label: 'Status' }]} rows={[
            { l: 'Recognized revenue', v: '$184,212', s: <Prov kind="estimated" /> },
            { l: 'Service cost', v: '($71,904)', s: <Prov kind="incomplete" label="91.4%" /> },
            { l: 'Gross profit', v: '$112,308', s: <Prov kind="incomplete" /> },
            { l: 'Contribution deductions', v: '($9,410)', s: <Prov kind="estimated" /> },
            { l: 'Operating expenses', v: <Prov kind="na" label="Awaiting import" />, s: <Prov kind="incomplete" /> },
            { l: 'Operating result', v: <Prov kind="na" label="Unavailable" />, s: <Prov kind="incomplete" /> },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Cash movement · Oct MTD" features={['SA07.03']}>
        <StateFrame features={['SA07.03']} cap="view.finance">
          <DataTable dense columns={[{ key: 'l', label: 'Line' }, { key: 'v', label: 'Amount', align: 'right' }, { key: 's', label: 'Status' }]} rows={[
            { l: 'Customer receipts', v: '$201,870', s: <Prov kind="reconciled" /> },
            { l: 'Refunds paid', v: '($1,032)', s: <Prov kind="reconciled" /> },
            { l: 'Provider prepayment (Provider A)', v: '($50,000)', s: <Prov kind="reconciled" /> },
            { l: 'Prepaid provider balance remaining', v: '$27,140', s: <Prov kind="estimated" /> },
          ]} />
          <p className="mt-2 text-xs text-muted-foreground">Cash is never presented as profit. Annual prepayment $258,000 received in Mar is recognized monthly.</p>
        </StateFrame>
      </Panel>
    </div>
  )
}

export function CloseSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Period close" features={['SA07.04', 'SA03.04']} className="col-span-2">
        <StateFrame features={['SA07.04']} cap="view.finance">
          <DataTable dense columns={[{ key: 'p', label: 'Period' }, { key: 's', label: 'Status' }, { key: 'c', label: 'Checklist' }, { key: 'b', label: 'Closed by' }, { key: 'a', label: '' }]} rows={[
            { p: 'Oct 2026', s: <Prov kind="provisional" label="Open" />, c: '2 of 6 · Provider B missing, variance open', b: '—', a: <ActionButton label="Close period" cap="act.finance" size="xs" icon={<Lock />} dialog={{ title: 'Close Oct 2026', feature: 'SA07.04', impact: ['Blocked: reconciliation incomplete (Provider A variance, Provider B feed)', 'Server rejects close until checklist is complete'] }} /> },
            { p: 'Sep 2026', s: <Prov kind="closed" />, c: '6 of 6', b: 'J. Brandt · 06 Oct', a: <ActionButton label="Reopen" cap="act.finance" size="xs" icon={<Unlock />} dialog={{ title: 'Reopen Sep 2026', feature: 'SA07.04', secondReview: true, confirmText: 'REOPEN', impact: ['Requires Finance + Owner approval (D19)', 'Prefer linked correction in Oct over reopening', 'All reports for Sep will show “Reopened” label'] }} /> },
            { p: 'Aug 2026', s: <Prov kind="closed" />, c: '6 of 6', b: 'J. Brandt · 05 Sep', a: null },
          ]} />
          <div className="mt-3"><Callout tone="info" title="Later corrections">Post as linked entries in the open period (e.g. ADJ-PA-0926 posted in Oct referencing Sep).</Callout></div>
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="FX rates" features={['SA07.04']}>
          <DataTable dense columns={[{ key: 'p', label: 'Pair' }, { key: 'r', label: 'Rate', align: 'right' }, { key: 'd', label: 'Rate date' }]} rows={[
            { p: 'EUR→USD', r: '1.0812', d: '23 Oct' }, { p: 'GBP→USD', r: '1.2944', d: '23 Oct' }, { p: 'CAD→USD', r: <Prov kind="na" label="Missing" />, d: '—' },
          ]} />
          <p className="mt-2 text-[11px] text-muted-foreground">CAD amounts show “converted value unavailable”. Source: daily reference rate (SAMPLE).</p>
        </Panel>
        <Assumption decision="D19">USD reporting currency; reopen requires Finance + Owner.</Assumption>
      </div>
    </div>
  )
}
