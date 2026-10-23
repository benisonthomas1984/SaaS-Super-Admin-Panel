import Link from 'next/link'
import { Assumption, Badge, DataTable, Panel, Prov, Stat, inputCls, Field } from '@/components/admin/ui'
import { StateFrame, Gate } from '@/components/admin/state'
import { fmtMoney } from '@/lib/sample-data'

const Q = '?period=2026-10-mtd&currency=USD'

export function HeadlineCards() {
  return (
    <StateFrame features={['SA01.01']} cap="view.finance" rows={2}
      incomplete="Provider B usage feed missing since 21 Oct 06:00 UTC (coverage 91.4%). Service cost and gross profit are Incomplete; revenue and cash remain available.">
      <div className="grid grid-cols-6 gap-3">
        <Stat label="Recognized revenue" value={fmtMoney(184212.4, 0)} kind="estimated" meta="Oct MTD · USD · 10:42 UTC" delta="+6.1% vs prior" href={`/profitability${Q}&tab=classification`} />
        <Stat label="Cash collected" value={fmtMoney(201870.0, 0)} kind="reconciled" meta="Oct MTD · USD · settled 10:30 UTC" delta="+11.8%" href={`/billing${Q}&tab=payments`} footnote="Includes $38,400 annual prepayment recognized over 12 months (SA07.01)." />
        <Stat label="Service cost" value={fmtMoney(71904.3, 0)} kind="incomplete" meta="Oct MTD · USD · 91.4% coverage" href={`/usage${Q}&tab=reconcile`} footnote="Missing: Provider B (21–23 Oct). Not counted as zero." />
        <Stat label="Gross profit" value={<Gate cap="view.margin">{fmtMoney(112308.1, 0)}</Gate>} kind="incomplete" meta="Oct MTD · USD · provisional" href={`/profitability${Q}&tab=unit`} />
        <Stat label="Recurring revenue (MRR)" value={fmtMoney(196540, 0)} kind="estimated" meta="As of 23 Oct · normalized annual" delta="+2.4%" href={`/adoption${Q}&tab=retention`} />
        <Stat label="Paying companies" value="412" kind="reconciled" meta="Excl. trials, staff, test · 23 Oct" delta="+9 net" href={`/customers${Q}&lifecycle=paying`} footnote="Seat additions are not counted as new companies." />
      </div>
      <div className="mt-3 flex items-center gap-4 rounded border bg-muted/40 px-4 py-2 text-xs">
        <Prov kind="closed" />
        <span className="font-medium">Sep 2026 · reconciled & closed 06 Oct</span>
        <span className="tabular text-muted-foreground">Revenue {fmtMoney(241088.0, 0)}</span>
        <span className="tabular text-muted-foreground">Service cost {fmtMoney(93410.22, 0)}</span>
        <span className="tabular text-muted-foreground">Gross profit <Gate cap="view.margin">{fmtMoney(147677.78, 0)} (61.3%)</Gate></span>
        <span className="ml-auto text-muted-foreground">Live estimates above are never merged into closed figures.</span>
      </div>
    </StateFrame>
  )
}

const DAYS = Array.from({ length: 23 }, (_, i) => ({
  d: i + 1,
  rev: 7200 + ((i * 37) % 11) * 180 + (i % 7 === 5 || i % 7 === 6 ? -1400 : 0),
  cost: 2700 + ((i * 53) % 9) * 120 + (i % 7 === 5 || i % 7 === 6 ? -600 : 0),
  missing: i >= 20,
}))

export function TrendPanel() {
  const max = 10000
  return (
    <Panel title="Daily revenue vs service cost" features={['SA01.01', 'SA03.04']} description="Oct 1–23 · USD · bars with hatching have incomplete cost coverage">
      <StateFrame features={['SA01.01']} cap="view.finance">
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Daily revenue and cost bars for October; days 21 to 23 have incomplete cost">
          {DAYS.map((x) => (
            <div key={x.d} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-32 w-full items-end gap-px">
                <div className="flex-1 rounded-t-sm bg-primary/80" style={{ height: `${(x.rev / max) * 100}%` }} />
                <div className={x.missing ? 'stripes-warn flex-1 rounded-t-sm border border-warn/60' : 'flex-1 rounded-t-sm bg-chart-2/70'} style={{ height: `${(x.cost / max) * 100}%` }} />
              </div>
              <span className="text-[10px] tabular text-muted-foreground">{x.d}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary/80" /> Recognized revenue (estimated)</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-chart-2/70" /> Rated service cost</span>
          <span className="flex items-center gap-1.5"><span className="stripes-warn size-2 rounded-sm border border-warn/60" /> Incomplete — Provider B feed missing</span>
        </div>
      </StateFrame>
    </Panel>
  )
}

export function ExceptionsPanel() {
  const items = [
    { sev: 'bad', title: 'Provider B usage feed missing', meta: 'A09 · since 21 Oct 06:00 UTC · cost coverage 91.4%', href: '/operations?tab=pipeline', f: 'SA14.01' },
    { sev: 'warn', title: '1,284 unrated usage events', meta: 'A05 · unknown model "prov-c/vision-xl-0925"', href: '/usage?tab=rates', f: 'SA03.02' },
    { sev: 'warn', title: 'Provider A Sep variance +$412.18 (0.9%)', meta: 'A06 · tolerance 0.5% · owner Finance', href: '/usage?tab=reconcile', f: 'SA03.04' },
    { sev: 'bad', title: '3 companies past grace period', meta: 'A04 · $11,520 overdue · next action 24 Oct', href: '/billing?tab=collections', f: 'SA06.03' },
    { sev: 'warn', title: '2 webhook events failed processing', meta: 'Out-of-order subscription.updated', href: '/billing?tab=payments', f: 'SA06.02' },
    { sev: 'neutral', title: 'Kill switch active: model prov-a/text-large-2026-03', meta: 'Since 22 Oct 14:02 UTC · INC-2287', href: '/controls?tab=kill', f: 'SA12.02' },
  ] as const
  return (
    <Panel title="Major exceptions" features={['SA01.01', 'SA12.04']} description="Grouped incidents; click to open evidence">
      <StateFrame features={['SA12.04']} emptyTitle="No open exceptions" emptyHint="All feeds fresh, all statements within tolerance. Last checked 10:42 UTC.">
        <ul className="flex flex-col divide-y">
          {items.map((i) => (
            <li key={i.title}>
              <Link href={i.href} className="flex items-start gap-3 py-2 hover:bg-muted/40">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${i.sev === 'bad' ? 'bg-destructive' : i.sev === 'warn' ? 'bg-warn' : 'bg-muted-foreground'}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">{i.meta}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{i.f}</span>
              </Link>
            </li>
          ))}
        </ul>
      </StateFrame>
    </Panel>
  )
}

export function ForecastPanel() {
  const rows = [
    { c: 'CO-10019 Halcyon Legal LLP', a: 9311.7, f: 12640, b: 12000, m: 'Linear run-rate · 23 d', conf: 'Medium', s: 'Over budget forecast' },
    { c: 'CO-10512 Quillon Analytics', a: 1702.9, f: 2310, b: 1500, m: 'Linear run-rate · 23 d', conf: 'Low · irregular', s: 'Negative contribution forecast' },
    { c: 'CO-10482 Northwind Logistics', a: 1874.18, f: 2540, b: 3000, m: 'Linear run-rate · 23 d', conf: 'High', s: 'Within budget' },
    { c: 'CO-11807 Atlas Freight Ltd', a: 84.12, f: null, b: 250, m: '—', conf: 'Insufficient history (6 d < 14 d min)', s: 'No forecast' },
  ]
  return (
    <Panel title="Forecast and margin monitoring" features={['SA01.03']} description="Planning estimates, not booked expenses. Known incomplete days (21–23 Oct, Provider B) are excluded from the run-rate.">
      <StateFrame features={['SA01.03']} cap="view.margin">
        <DataTable dense columns={[
          { key: 'c', label: 'Company' }, { key: 'a', label: 'Actual to date', align: 'right' }, { key: 'f', label: 'Forecast period-end', align: 'right' },
          { key: 'b', label: 'Budget', align: 'right' }, { key: 'm', label: 'Method' }, { key: 'conf', label: 'Confidence' }, { key: 's', label: 'Signal' },
        ]} rows={rows.map((r) => ({
          c: r.c,
          a: fmtMoney(r.a),
          f: r.f === null ? <Prov kind="na" label="Insufficient data" /> : <span className="italic text-muted-foreground">{fmtMoney(r.f, 0)} <Prov kind="forecast" /></span>,
          b: fmtMoney(r.b, 0),
          m: <span className="text-xs">{r.m}</span>,
          conf: <span className="text-xs">{r.conf}</span>,
          s: <Badge tone={r.s.startsWith('Within') ? 'good' : r.s === 'No forecast' ? 'outline' : 'warn'}>{r.s}</Badge>,
        }))} />
        <div className="mt-4 grid grid-cols-4 gap-3">
          <Field label="Forecast horizon"><select className={inputCls} defaultValue="Period end"><option>Period end</option><option>Next 30 days</option><option>Quarter end</option></select></Field>
          <Field label="Minimum history"><input className={inputCls} defaultValue="14 days" /></Field>
          <Field label="Platform budget (Oct)"><input className={inputCls} defaultValue="$95,000.00" /></Field>
          <Field label="Alert recipients"><input className={inputCls} defaultValue="finance-alerts, ops-oncall" /></Field>
        </div>
      </StateFrame>
    </Panel>
  )
}

export function CoverageStrip() {
  const feeds = [
    { n: 'Payments (processor)', s: 'Fresh · 10:30 UTC', ok: true },
    { n: 'Provider A usage', s: 'Fresh · 10:38 UTC', ok: true },
    { n: 'Provider B usage', s: 'Missing since 21 Oct', ok: false },
    { n: 'Provider C usage', s: 'Fresh · 10:12 UTC', ok: true },
    { n: 'Finance import (opex)', s: 'Last: Sep close', ok: false },
    { n: 'Ad spend import', s: 'Fresh · 06:00 UTC', ok: true },
  ]
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium text-muted-foreground">Data coverage</span>
      {feeds.map((f) => (
        <span key={f.n} className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 ${f.ok ? 'bg-card' : 'stripes-warn border-warn/50'}`}>
          <span className={`size-1.5 rounded-full ${f.ok ? 'bg-primary' : 'bg-warn'}`} aria-hidden />
          {f.n} <span className="text-muted-foreground">· {f.s}</span>
        </span>
      ))}
      <Link href="/operations?tab=pipeline" className="ml-1 font-medium text-primary hover:underline">Pipeline details</Link>
    </div>
  )
}

export function DashboardAssumptions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Assumption decision="D08">Recognized revenue and service cost follow the default classification (AI + infrastructure = service cost) until Finance supplies the chart-of-accounts mapping.</Assumption>
      <Assumption decision="D19">Reporting currency USD; historical FX from daily reference rate at transaction date. Closed periods are never restated at today&apos;s rate.</Assumption>
    </div>
  )
}
