'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { COMPANIES, fmtMoney, type Lifecycle } from '@/lib/sample-data'
import { Badge, DataTable, Field, Prov, inputCls } from '@/components/admin/ui'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { cn } from '@/lib/utils'

const LIFECYCLES: (Lifecycle | 'All')[] = ['All', 'Trial', 'Active', 'Past due', 'Suspended', 'Cancellation pending', 'Closed']

export function lifecycleTone(l: Lifecycle) {
  return l === 'Active' ? 'good' : l === 'Trial' ? 'outline' : l === 'Past due' || l === 'Cancellation pending' ? 'warn' : l === 'Suspended' ? 'bad' : 'neutral'
}

export function CustomersList() {
  const [q, setQ] = useState('')
  const [life, setLife] = useState<(typeof LIFECYCLES)[number]>('All')

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return COMPANIES.filter((c) => (life === 'All' || c.lifecycle === life) &&
      (!s || [c.id, c.name, c.domain, c.billingRef].some((v) => v.toLowerCase().includes(s))))
  }, [q, life])

  const ambiguous = rows.length > 1 && new Set(rows.map((r) => r.name.split(' ').slice(0, 2).join(' '))).size < rows.length && q.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-md border bg-card px-4 py-3">
        <label className="flex min-w-80 flex-1 flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Search by company ID, name, domain or billing reference
          <span className="relative">
            <Search className="pointer-events-none absolute left-2 top-2 size-4 text-muted-foreground" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. atlas, CO-10482, cus_SAMPLE_2290"
              className={cn(inputCls, 'w-full pl-8 normal-case tracking-normal')} />
          </span>
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Lifecycle state</span>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Lifecycle filter">
            {LIFECYCLES.map((l) => (
              <button key={l} type="button" aria-pressed={life === l} onClick={() => setLife(l)}
                className={cn('h-8 rounded border px-2.5 text-xs', life === l ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted')}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <ActionButton label="Create company" cap="act.support" variant="default" size="default" icon={<Plus />} dialog={{
          title: 'Create company', feature: 'SA02.01',
          impact: ['Creates company in Trial state with a stable ID (CO-#####)', 'Region, retention class and data policy set from defaults (SA13.03)', 'No billing record until a plan is assigned (SA05.01)'],
          fields: (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Legal name"><input className={inputCls} defaultValue="Example Corp" /></Field>
              <Field label="Primary domain"><input className={inputCls} defaultValue="example.example" /></Field>
              <Field label="Data region"><select className={inputCls}><option>US-East</option><option>EU-West</option></select></Field>
              <Field label="Owner email"><input className={inputCls} defaultValue="owner@example.example" /></Field>
            </div>
          ),
        }} />
      </div>

      {ambiguous && (
        <p className="rounded border border-warn/50 bg-warn-soft px-3 py-2 text-xs" role="status">
          <span className="font-semibold text-warn">Similar names found.</span> Confirm by stable company ID, domain and billing reference before taking action.
        </p>
      )}

      <StateFrame features={['SA02.01', 'SA02.03']} cap="view.customer" rows={8}
        emptyTitle="No companies match" emptyHint="Try a company ID (CO-#####), domain or billing reference."
        incomplete="Billing feed delayed for 2 companies (CO-10019, CO-10702). Their revenue and cost coverage show last-synced values.">
        {rows.length === 0 ? (
          <StateFrame features={['SA02.03']} forceState="empty" emptyTitle="No companies match this search" emptyHint="Search matches ID, name, domain and billing reference exactly as stored."><span /></StateFrame>
        ) : (
          <DataTable caption="Companies" columns={[
            { key: 'name', label: 'Company' }, { key: 'id', label: 'Company ID', mono: true }, { key: 'state', label: 'Lifecycle' },
            { key: 'plan', label: 'Plan · version' }, { key: 'seats', label: 'Seats used/paid', align: 'right' }, { key: 'mrr', label: 'MRR', align: 'right' },
            { key: 'contrib', label: 'Contribution MTD', align: 'right' }, { key: 'cov', label: 'Cost coverage', align: 'right' }, { key: 'owner', label: 'Account owner' }, { key: 'sync', label: 'Last sync' },
          ]} rows={rows.map((c) => ({
            name: (
              <div>
                <Link href={`/customers/${c.id}`} className="font-medium text-primary hover:underline">{c.name}</Link>
                <p className="text-[11px] text-muted-foreground">{c.domain} · <span className="font-mono">{c.billingRef}</span></p>
              </div>
            ),
            id: c.id,
            state: <Badge tone={lifecycleTone(c.lifecycle)}>{c.lifecycle}</Badge>,
            plan: <span className="text-xs">{c.plan} · {c.planVersion}</span>,
            seats: c.seats.paid ? `${c.seats.used}/${c.seats.paid}` : <span className="text-muted-foreground">{c.seats.used}/trial</span>,
            mrr: c.mrr ? fmtMoney(c.mrr, 0) : <span className="text-muted-foreground">—</span>,
            contrib: <Gate cap="view.margin">{c.costCoverage < 100 ? <span className="flex items-center justify-end gap-1"><Prov kind="incomplete" />{fmtMoney(c.revenue - c.cost, 0)}</span> : <span className={c.revenue - c.cost < 0 ? 'text-destructive' : ''}>{fmtMoney(c.revenue - c.cost, 0)}</span>}</Gate>,
            cov: <span className={c.costCoverage < 100 ? 'text-warn' : ''}>{c.costCoverage}%</span>,
            owner: <span className="text-xs">{c.owner}</span>,
            sync: <span className="text-xs text-muted-foreground">{c.lastSync}</span>,
          }))} />
        )}
      </StateFrame>
    </div>
  )
}
