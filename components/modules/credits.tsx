import { Plus } from 'lucide-react'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Bar, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

const CO = 'CO-10482 Northwind Logistics'

export function BucketsSection() {
  const buckets = [
    { b: 'Included · Oct 2026', g: 500000, av: 178280, r: 4120, s: 317600, e: 0, exp: '31 Oct 2026', ord: 1 },
    { b: 'Purchased · PO-7711', g: 50000, av: 4120, r: 0, s: 45880, e: 0, exp: '12 Jun 2027', ord: 2 },
    { b: 'Promotional · LAUNCH25', g: 10000, av: 0, r: 0, s: 6200, e: 3800, exp: 'Expired 30 Sep', ord: 3 },
    { b: 'Service credit · SC-0031', g: 2000, av: 0, r: 0, s: 0, e: 0, exp: '—', ord: 4 },
  ]
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-3">
        {[['Granted', '562,000'], ['Available', '182,400'], ['Reserved (in flight)', '4,120'], ['Spent', '369,680']].map(([l, v]) => (
          <div key={l} className="rounded-md border bg-card p-3.5">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular">{v} <span className="text-sm font-normal text-muted-foreground">credits</span></p>
          </div>
        ))}
      </div>
      <Panel title={`Credit buckets · ${CO}`} features={['SA04.01']} description="Credits are a commercial unit — distinct from provider tokens and cash. Conversion version cv_2026_07 (1 credit = $0.01 list).">
        <StateFrame features={['SA04.01']} cap="view.customer">
          <DataTable columns={[{ key: 'ord', label: 'Spend order', align: 'right' }, { key: 'b', label: 'Bucket' }, { key: 'g', label: 'Granted', align: 'right' }, { key: 'av', label: 'Available', align: 'right' }, { key: 'r', label: 'Reserved', align: 'right' }, { key: 's', label: 'Spent', align: 'right' }, { key: 'e', label: 'Expired', align: 'right' }, { key: 'exp', label: 'Expiry' }, { key: 'bar', label: 'Consumed', width: '140px' }]} rows={buckets.map((b) => ({
            ...b, g: b.g.toLocaleString(), av: b.av.toLocaleString(), r: b.r.toLocaleString(), s: b.s.toLocaleString(), e: b.e ? <span className="text-muted-foreground">{b.e.toLocaleString()}</span> : '0',
            bar: <Bar value={b.s + b.e} max={b.g} tone={b.e ? 'muted' : 'primary'} />,
          }))} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-2 gap-5">
        <Panel title="User sublimits" features={['SA04.01', 'SA02.02']} description="Optional. Cannot exceed the company pool.">
          <StateFrame features={['SA04.01']} cap="view.customer" emptyTitle="No user sublimits" emptyHint="All members draw from the company pool.">
            <DataTable dense columns={[{ key: 'u', label: 'User' }, { key: 'l', label: 'Monthly limit', align: 'right' }, { key: 's', label: 'Spent', align: 'right' }, { key: 'b', label: '', width: '120px' }]} rows={[
              { u: 'luis@northwind-logistics.example', l: '20,000', s: '19,410', b: <Bar value={19410} max={20000} tone="warn" /> },
              { u: 'priya@northwind-logistics.example', l: '10,000', s: '2,120', b: <Bar value={2120} max={10000} /> },
            ]} />
          </StateFrame>
        </Panel>
        <div className="flex flex-col gap-3">
          <Assumption decision="D01">Hybrid model: subscription includes a monthly credit allowance; purchased packs top up. Credits ≠ tokens ≠ cash.</Assumption>
          <Assumption decision="D03">Company pool with optional per-user sublimits.</Assumption>
          <Assumption decision="D06">Included credits expire at period end with no rollover; purchased credits expire after 12 months; promotional per offer.</Assumption>
        </div>
      </div>
    </div>
  )
}

export function ReservationsSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Reservations" features={['SA04.02']} description="Atomic reservation before execution; settled exactly once; unused amount released.">
        <StateFrame features={['SA04.02']} cap="view.usage" emptyTitle="No open reservations" emptyHint="No tasks are currently holding credits.">
          <DataTable dense columns={[{ key: 'id', label: 'Reservation', mono: true }, { key: 't', label: 'Task', mono: true }, { key: 'co', label: 'Company', mono: true }, { key: 'r', label: 'Reserved', align: 'right' }, { key: 'a', label: 'Actual', align: 'right' }, { key: 'st', label: 'State' }, { key: 'age', label: 'Age' }]} rows={[
            { id: 'rsv_7712', t: 'tsk_01JB8V', co: 'CO-10482', r: '600', a: '—', st: <Badge tone="outline">Active</Badge>, age: '00:42' },
            { id: 'rsv_7713', t: 'tsk_01JB8T', co: 'CO-10377', r: '120', a: <Prov kind="unknown" />, st: <Badge tone="warn">Pending · unknown outcome</Badge>, age: '14:10' },
            { id: 'rsv_7701', t: 'tsk_01JB8Q', co: 'CO-10482', r: '600', a: '412', st: <Badge tone="good">Settled · 188 released</Badge>, age: '—' },
            { id: 'rsv_7699', t: 'tsk_01JB8P', co: 'CO-10512', r: '300', a: '—', st: <Badge tone="bad">Denied · insufficient balance</Badge>, age: '—' },
          ]} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-3 gap-5">
        <Panel title="Settlement trace · rsv_7701" features={['SA04.02', 'SA04.03']} className="col-span-2">
          <ol className="flex flex-col gap-1 font-mono text-xs">
            {[['09:12:04', 'reserve 600 cr', 'idem key rsv_7701'], ['09:12:41', 'provider usage received', '10,121 tok'], ['09:12:41', 'settle 412 cr', 'ledger LE-991204'], ['09:12:41', 'release 188 cr', 'ledger LE-991205'], ['09:12:55', 'duplicate settle', 'ignored · same idem key']].map(([t, a, n]) => (
              <li key={t + a} className="flex gap-3 rounded px-2 py-1 hover:bg-muted/50"><span className="text-muted-foreground">{t}</span><span className="flex-1">{a}</span><span className="text-muted-foreground">{n}</span></li>
            ))}
          </ol>
        </Panel>
        <Panel title="Recovery policy" features={['SA04.02', 'SA12.01']}>
          <div className="flex flex-col gap-3">
            <Field label="Reservation timeout"><input className={inputCls} defaultValue="15 min" /></Field>
            <Field label="Wallet unavailable"><select className={inputCls}><option>Fail closed (deny new tasks)</option><option>Capped emergency allowance</option></select></Field>
            <Field label="Emergency allowance cap" hint="Disabled when fail-closed"><input className={inputCls} disabled defaultValue="500 cr / company" /></Field>
            <Assumption decision="D12">Fail closed until a capped emergency allowance is approved.</Assumption>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function LedgerSection() {
  return (
    <Panel title={`Immutable ledger · ${CO}`} features={['SA04.03']} description="Append-only. Corrections are new linked entries; nothing is edited or deleted." actions={
      <ActionButton label="Post adjustment" cap="act.finance" icon={<Plus />} dialog={{
        title: 'Post manual credit adjustment', feature: 'SA04.03', secondReview: true,
        impact: ['+25,000 cr to Purchased · PO-7711', 'Opening 182,400 → closing 207,400 available', 'Above 10,000 cr single-approver limit → second reviewer required (D14)', 'Idempotency key generated; retries cannot double-post'],
        fields: <div className="grid grid-cols-2 gap-3"><Field label="Amount (credits)"><input className={inputCls} defaultValue="25000" /></Field><Field label="Linked record"><input className={inputCls} defaultValue="CASE-8812" /></Field></div>,
      }} />
    }>
      <StateFrame features={['SA04.03']} cap="view.customer" rows={6}>
        <DataTable dense columns={[{ key: 'id', label: 'Entry', mono: true }, { key: 't', label: 'Time (UTC)' }, { key: 'k', label: 'Type' }, { key: 'b', label: 'Bucket' }, { key: 'amt', label: 'Amount', align: 'right' }, { key: 'open', label: 'Opening', align: 'right' }, { key: 'close', label: 'Closing', align: 'right' }, { key: 'src', label: 'Source / actor' }]} rows={[
          { id: 'LE-991205', t: '23 Oct 09:12:41', k: 'release', b: 'Included', amt: '+188', open: '182,212', close: '182,400', src: 'rsv_7701' },
          { id: 'LE-991204', t: '23 Oct 09:12:41', k: 'settle', b: 'Included', amt: '−412', open: '182,624', close: '182,212', src: 'tsk_01JB8Q' },
          { id: 'LE-990811', t: '22 Oct 16:03:10', k: 'correction → LE-990402', b: 'Included', amt: '+120', open: '182,504', close: '182,624', src: 'Finance · J. Brandt · “double-billed retry”' },
          { id: 'LE-990402', t: '22 Oct 11:44:02', k: 'settle', b: 'Included', amt: '−120', open: '182,624', close: '182,504', src: 'tsk_01JB6A' },
          { id: '—', t: '22 Oct 11:44:09', k: 'duplicate event', b: '—', amt: <span className="text-muted-foreground">ignored</span>, open: '—', close: '—', src: 'evt_pay_88a1 (same idem key)' },
          { id: 'LE-981100', t: '01 Oct 00:00:00', k: 'grant', b: 'Included', amt: '+500,000', open: '0', close: '500,000', src: 'Plan Scale v3' },
        ]} />
        <div className="mt-3"><Callout tone="info" title="Opening + entries = closing (verified)">Balance check passes for 1 Oct → 23 Oct. Single-approver limit: 10,000 cr. Max adjustment: 250,000 cr.</Callout></div>
      </StateFrame>
    </Panel>
  )
}

export function ExhaustionSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Exhaustion policy" features={['SA04.04']} className="col-span-2" description="What happens when available credits reach zero.">
        <StateFrame features={['SA04.04']} cap="view.customer">
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="sr-only">Policy</legend>
            {[['stop', 'Stop new tasks', 'Default. Running tasks settle against reservation.'], ['overage', 'Approved overage billed later', 'Requires contract + cap. Billed on next invoice.'], ['topup', 'Bounded automatic top-up', 'Explicit customer consent and monthly cap.'], ['degrade', 'Degrade to cheaper model', 'Requires routing eligibility (SA10.02).']].map(([v, l, h], i) => (
              <label key={v} className="flex gap-2 rounded border p-3 text-sm has-checked:border-primary has-checked:bg-primary-soft">
                <input type="radio" name="exh" defaultChecked={i === 2} className="mt-1 accent-primary" />
                <span><span className="font-medium">{l}</span><br /><span className="text-xs text-muted-foreground">{h}</span></span>
              </label>
            ))}
          </fieldset>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <Field label="Minimum balance trigger"><input className={inputCls} defaultValue="10,000 cr" /></Field>
            <Field label="Top-up amount"><input className={inputCls} defaultValue="50,000 cr ($450.00)" /></Field>
            <Field label="Monthly top-up cap"><input className={inputCls} defaultValue="$1,800.00" /></Field>
            <Field label="Consent"><input className={inputCls} disabled defaultValue="Given 14 Mar · D. Whitfield" /></Field>
          </div>
          <div className="mt-4"><Assumption decision="D04">Stop is the platform default; top-up and overage are opt-in per company.</Assumption></div>
        </StateFrame>
      </Panel>
      <Panel title="Top-up attempts" features={['SA04.04', 'SA06.02']}>
        <StateFrame features={['SA04.04']} cap="view.customer" emptyTitle="No top-ups this period">
          <ul className="flex flex-col gap-2 text-xs">
            <li className="flex justify-between"><span>18 Oct · $450.00</span><Badge tone="good">Paid · credits granted</Badge></li>
            <li className="flex justify-between"><span>21 Oct · $450.00</span><Badge tone="bad">Card declined</Badge></li>
            <li className="flex justify-between"><span>21 Oct · retry 1</span><Badge tone="good">Paid · granted once</Badge></li>
          </ul>
          <KV items={[['Remaining cap', '$900.00'], ['Refund policy', 'Unused purchased credits refundable 14 d']]} />
        </StateFrame>
      </Panel>
    </div>
  )
}
