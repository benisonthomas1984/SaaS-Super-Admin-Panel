'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Ban, RotateCcw, CalendarX, Headset, ArrowRightLeft, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Company } from '@/lib/sample-data'
import { fmtMoney, fmtNum } from '@/lib/sample-data'
import { can } from '@/lib/rbac'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Bar, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'
import { lifecycleTone } from './customers-list'

export function LifecycleActions({ c }: { c: Company }) {
  const { role, setSupportSession, record } = useAdmin()
  const [opening, setOpening] = useState(false)
  const [reason, setReason] = useState('')
  const [scope, setScope] = useState('Read-only · metadata')
  const [duration, setDuration] = useState('30 min')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={lifecycleTone(c.lifecycle)} className="text-xs">{c.lifecycle}</Badge>
      <Link href="/plans?tab=changes" className="inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-[0.8rem] font-medium hover:bg-muted"><ArrowRightLeft className="size-3.5" /> Change plan</Link>
      {c.lifecycle === 'Suspended' ? (
        <ActionButton label="Restore" cap="act.support" icon={<RotateCcw />} dialog={{
          title: `Restore ${c.name}`, feature: 'SA02.01',
          impact: ['Restores eligible entitlements only (past-due remains blocked)', 'Members regain access within revocation target (D17: TBD)', 'Customer notified via “Account restored” template (SA15.02)'],
        }} />
      ) : (
        <ActionButton label="Suspend" cap="act.support" variant="destructive" icon={<Ban />} dialog={{
          title: `Suspend ${c.name} (${c.id})`, feature: 'SA02.01', destructive: true, confirmText: c.id,
          impact: [`Blocks new AI tasks for ${c.seats.used} members across 3 workspaces`, '7 jobs in flight · 2 scheduled exports · 1 sync', 'Billing records, invoices and ledger are preserved', 'Effective: immediately (or choose a time below)'],
          uncertain: 'Provider calls already started may still incur cost. They are tracked as incurred cost (SA03.01) and settled once.',
          fields: (
            <div className="grid grid-cols-2 gap-3">
              <Field label="In-flight work" hint="Open policy (spec SA02.01) — explicit per action">
                <select className={inputCls}><option>Let running tasks finish; block new</option><option>Cancel running tasks</option></select>
              </Field>
              <Field label="Effective time"><input className={inputCls} defaultValue="Immediately" /></Field>
            </div>
          ),
        }} />
      )}
      <ActionButton label="Schedule closure" cap="act.support" icon={<CalendarX />} dialog={{
        title: `Schedule closure for ${c.name}`, feature: 'SA02.04', confirmText: 'CLOSE',
        impact: ['Moves to Cancellation pending → Closed on effective date', 'Starts data request workflow per store (see Closure & data requests)', 'Financial, tax and audit records retained per retention class'],
      }} />
      <Button size="sm" variant="secondary" disabled={!can(role, 'act.support')} onClick={() => setOpening(true)}><Headset /> Open support session</Button>
      {opening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6">
          <div role="dialog" aria-modal="true" aria-label="Open support session" className="w-full max-w-lg rounded-md border bg-card shadow-xl">
            <div className="border-b px-5 py-3">
              <p className="font-mono text-[10px] text-muted-foreground">SA13.04 · P0</p>
              <h2 className="text-base font-semibold">Open controlled support session</h2>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              <Field label="Reason"><textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="rounded border border-input bg-background px-2 py-1.5 text-sm" placeholder="Customer reports duplicate charge on INV-2026-10-0412" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Scope"><select className={inputCls} value={scope} onChange={(e) => setScope(e.target.value)}><option>Read-only · metadata</option><option>Read-only · metadata + billing</option><option>Write · requires customer approval</option></select></Field>
                <Field label="Duration"><select className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)}><option>15 min</option><option>30 min</option><option>60 min (max)</option></select></Field>
              </div>
              <Field label="Case reference" hint="Free-text at P0. Becomes a required SA15.01 case link when SA15.01 ships (contradiction C01).">
                <input className={inputCls} defaultValue="CASE-8812" />
              </Field>
              <Assumption decision="D14">Customer approval is required only for write scope. Raw prompts and outputs are never in scope unless the tenant opted in (SA13.03).</Assumption>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button variant="ghost" onClick={() => setOpening(false)}>Cancel</Button>
              <Button disabled={reason.trim().length < 8} onClick={() => {
                record({ action: 'support_session.open', target: c.id, reason })
                setSupportSession({ company: `${c.name} (${c.id})`, reason, scope, expiresAt: `in ${duration}` })
                setOpening(false)
              }}>Start session</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Overview360({ c }: { c: Company }) {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Identity & tenancy" features={['SA02.03', 'SA02.01']}>
        <StateFrame features={['SA02.03']} cap="view.customer">
          <KV items={[['Company ID', <span key="i" className="font-mono">{c.id}</span>], ['Domain', c.domain], ['Billing reference', <span key="b" className="font-mono text-xs">{c.billingRef}</span>], ['Data region', c.region], ['Account owner', c.owner], ['Created', '14 Mar 2025']]} />
        </StateFrame>
      </Panel>
      <Panel title="Plan & contract" features={['SA05.01', 'SA05.03']}>
        <StateFrame features={['SA05.01']} cap="view.customer">
          <KV items={[['Plan', `${c.plan} · ${c.planVersion}`], ['Billing cycle', 'Monthly · renews 1 Nov'], ['MRR', fmtMoney(c.mrr, 0)], ['Seats', `${c.seats.used} of ${c.seats.paid} paid`], ['Overrides', '1 · +20% storage, expires 31 Dec'], ['Contract', 'None (self-serve)']]} />
        </StateFrame>
      </Panel>
      <Panel title="Wallet" features={['SA04.01']} actions={<Link href="/credits" className="text-xs font-medium text-primary hover:underline">Ledger</Link>}>
        <StateFrame features={['SA04.01']} cap="view.customer">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Available</span><span className="font-semibold tabular">{fmtNum(c.creditsAvailable)} cr</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reserved (in flight)</span><span className="tabular">4,120 cr</span></div>
            <Bar value={317600} max={500000} label="Included allowance consumed" />
            <p className="text-[11px] text-muted-foreground">317,600 of 500,000 included credits consumed · expires 31 Oct (D06 assumption)</p>
          </div>
        </StateFrame>
      </Panel>
      <Panel title="Usage & cost (Oct MTD)" features={['SA03.01', 'SA03.04']} className="col-span-2">
        <StateFrame features={['SA03.01']} cap="view.usage" incomplete="Provider B statements for 21–23 Oct not yet received.">
          <DataTable dense columns={[{ key: 'k', label: 'Measure' }, { key: 'v', label: 'Value', align: 'right' }, { key: 's', label: 'Status' }, { key: 'f', label: 'Source · freshness' }]} rows={[
            { k: 'Root tasks', v: fmtNum(18422), s: <Prov kind="reconciled" />, f: 'Usage store · 10:41 UTC' },
            { k: 'Failed / retried attempts', v: '612 / 1,048', s: <Prov kind="reconciled" />, f: 'Usage store · 10:41 UTC' },
            { k: 'Credits consumed', v: fmtNum(317600), s: <Prov kind="reconciled" label="Settled" />, f: 'Wallet ledger · 10:41 UTC' },
            { k: 'Provider cost (rated)', v: <Gate cap="view.margin">{fmtMoney(c.cost)}</Gate>, s: <Prov kind="estimated" />, f: 'Rate catalogue v2026-10 · not yet reconciled' },
            { k: 'Provider cost (Sep, reconciled)', v: <Gate cap="view.margin">{fmtMoney(2311.4)}</Gate>, s: <Prov kind="reconciled" />, f: 'Provider statements · closed 06 Oct' },
          ]} />
        </StateFrame>
      </Panel>
      <Panel title="Billing" features={['SA06.01', 'SA06.03']}>
        <StateFrame features={['SA06.01']} cap="view.customer">
          <KV cols={2} items={[['Open invoice', 'INV-2026-10-0412'], ['Unbilled usage', <span key="u" className="italic">≈ {fmtMoney(412.4)}</span>], ['Past due', '$0.00'], ['Payment method', 'Card •••• 4242 · exp 03/28']]} />
        </StateFrame>
      </Panel>
      <Panel title="Acquisition" features={['SA08.01']}>
        <StateFrame features={['SA08.01']} cap="view.finance">
          <KV items={[['First touch', c.source], ['Confidence', 'High · signup UTM'], ['Campaign', 'Q1-docs-agent'], ['CAC (ad only)', <Gate key="cac" cap="view.margin">{fmtMoney(1840, 0)}</Gate>]]} />
        </StateFrame>
      </Panel>
      <Panel title="Health signals" features={['SA09.04']}>
        <StateFrame features={['SA09.04']} cap="view.customer">
          <ul className="flex flex-col gap-1.5 text-xs">
            <li className="flex justify-between"><span>Seat utilization</span><Badge tone="good">92%</Badge></li>
            <li className="flex justify-between"><span>Accepted outcome rate</span><Badge tone="good">81%</Badge></li>
            <li className="flex justify-between"><span>Failed payment (90 d)</span><Badge tone="outline">None</Badge></li>
            <li className="flex justify-between"><span>NPS / survey</span><Prov kind="unknown" label="Signal missing" /></li>
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">Advisory only. Never triggers billing or access changes.</p>
        </StateFrame>
      </Panel>
      <Panel title="Support & recent audit" features={['SA15.01', 'SA13.02']}>
        <StateFrame features={['SA13.02']} cap="view.customer">
          <ul className="flex flex-col gap-1.5 text-xs">
            <li><span className="font-mono text-muted-foreground">CASE-8812</span> Duplicate charge question · open · SLA 6h left</li>
            <li><span className="font-mono text-muted-foreground">AUD-48190</span> Storage override +20% · J. Brandt · 02 Oct</li>
            <li><span className="font-mono text-muted-foreground">AUD-48022</span> Seat cap 50 → 60 requested · pending review</li>
          </ul>
        </StateFrame>
      </Panel>
    </div>
  )
}

export function Workspaces({ c }: { c: Company }) {
  const members = [
    { n: 'Dana Whitfield', e: 'dana@northwind-logistics.example', w: 'Operations', r: 'Workspace owner', s: 'Active', multi: false },
    { n: 'Luis Ortega', e: 'luis@northwind-logistics.example', w: 'Operations', r: 'Member', s: 'Active', multi: true },
    { n: 'Priya Nand', e: 'priya@northwind-logistics.example', w: 'Finance', r: 'Admin', s: 'Active', multi: false },
    { n: 'invite pending', e: 'k.osei@northwind-logistics.example', w: 'Claims', r: 'Member', s: 'Invited · expires 30 Oct', multi: false },
    { n: 'Former user', e: 'b.ross@northwind-logistics.example', w: 'Claims', r: '—', s: 'Revoked 11 Oct', multi: false },
  ]
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Workspaces" features={['SA02.02']}>
        <StateFrame features={['SA02.02']} cap="view.customer" emptyTitle="No workspaces" emptyHint="A company needs at least one workspace before members can be invited.">
          <ul className="flex flex-col gap-3 text-sm">
            {[['Operations', 28], ['Finance', 9], ['Claims', 9]].map(([w, n]) => (
              <li key={w as string} className="flex flex-col gap-1">
                <div className="flex justify-between"><span className="font-medium">{w}</span><span className="tabular text-muted-foreground">{n} members</span></div>
                <Bar value={n as number} max={30} />
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded border bg-muted/40 p-3 text-xs">
            <p className="font-medium">Seats: {c.seats.used} used of {c.seats.paid} paid</p>
            <p className="text-muted-foreground">Seat cap: 60 · Adding beyond 50 adds paid seats at $96/seat/mo prorated (SA05.04).</p>
          </div>
        </StateFrame>
      </Panel>
      <Panel title="Members" features={['SA02.02']} className="col-span-2" actions={
        <ActionButton label="Invite member" cap="act.support" icon={<UserPlus />} dialog={{
          title: 'Invite member to Operations', feature: 'SA02.02',
          impact: [`Seat count ${c.seats.used} → ${c.seats.used + 1} of ${c.seats.paid} paid — no billing change`, 'Invite expires in 7 days', 'If accepted after seats are full, invite is blocked (not silently billed)'],
          fields: <div className="grid grid-cols-2 gap-3"><Field label="Email"><input className={inputCls} defaultValue="new.user@northwind-logistics.example" /></Field><Field label="Role"><select className={inputCls}><option>Member</option><option>Admin</option></select></Field></div>,
        }} />
      }>
        <StateFrame features={['SA02.02']} cap="view.customer">
          <DataTable dense columns={[{ key: 'n', label: 'User' }, { key: 'w', label: 'Workspace' }, { key: 'r', label: 'Role' }, { key: 's', label: 'Status' }, { key: 'a', label: '' }]} rows={members.map((m) => ({
            n: <div><p className="font-medium">{m.n}</p><p className="text-[11px] text-muted-foreground">{m.e}{m.multi && ' · also member of CO-10233 (separate access)'}</p></div>,
            w: m.w, r: m.r,
            s: <Badge tone={m.s.startsWith('Active') ? 'good' : m.s.startsWith('Invited') ? 'warn' : 'neutral'}>{m.s}</Badge>,
            a: m.s === 'Active' ? (
              m.r === 'Workspace owner' ? (
                <ActionButton label="Transfer ownership" cap="act.support" size="xs" dialog={{ title: 'Transfer Operations ownership', feature: 'SA02.02', impact: ['New owner must be an active member', 'Previous owner becomes Admin', 'No seat or billing change'] }} />
              ) : (
                <ActionButton label="Revoke" cap="act.support" size="xs" variant="ghost" dialog={{ title: `Revoke ${m.n}`, feature: 'SA02.02', destructive: true, impact: ['Active sessions and tokens revoked (target: D17 TBD)', `Paid seats stay ${c.seats.paid} until next cycle; used seats ${c.seats.used} → ${c.seats.used - 1}`, 'Running tasks started by this user finish under the company policy'] }} />
              )
            ) : null,
          }))} />
        </StateFrame>
      </Panel>
    </div>
  )
}

export function DataRequests({ c }: { c: Company }) {
  const stores = [
    { s: 'Primary app database', a: 'Delete', st: 'Completed 18 Oct', t: 'good' },
    { s: 'Uploaded files & object storage', a: 'Delete', st: 'Completed 18 Oct', t: 'good' },
    { s: 'Vector index (namespace ns_10482)', a: 'Delete', st: 'Running · 61%', t: 'warn' },
    { s: 'Search index', a: 'Delete', st: 'Queued', t: 'outline' },
    { s: 'Analytics warehouse', a: 'De-identify', st: 'Failed · retry 2/5', t: 'bad' },
    { s: 'Invoices, ledger, tax records', a: 'Retain', st: 'Retained · legal obligation (7 yr)', t: 'neutral' },
    { s: 'Audit trail', a: 'Retain', st: 'Retained · security record', t: 'neutral' },
    { s: 'Backups', a: 'Expire', st: 'Ages out 17 Jan 2027', t: 'neutral' },
  ] as const
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Request DSR-0091 · Delete company data" features={['SA02.04']} className="col-span-2" description={`Requested 17 Oct by Owner (${c.name}) · verified via account owner email + MFA`}>
        <StateFrame features={['SA02.04']} cap="view.customer" emptyTitle="No closure or data requests" emptyHint="Requests appear here once verified. Unverified requests stay in the support queue.">
          <DataTable dense columns={[{ key: 's', label: 'Store' }, { key: 'a', label: 'Action' }, { key: 'st', label: 'Outcome' }]} rows={stores.map((x) => ({ s: x.s, a: x.a, st: <Badge tone={x.t}>{x.st}</Badge> }))} />
          <p className="mt-3 text-xs text-muted-foreground">This request is never shown as “fully deleted” while any store is running, failed or retained (contradiction C07).</p>
        </StateFrame>
      </Panel>
      <Panel title="New request" features={['SA02.04', 'SA13.03']}>
        <div className="flex flex-col gap-3">
          <Field label="Request type"><select className={inputCls}><option>Export company data</option><option>Delete company data</option><option>Close account</option></select></Field>
          <Field label="Scope"><select className={inputCls}><option>Whole company</option><option>Single workspace</option><option>Single user</option></select></Field>
          <ActionButton label="Preview scope & submit" cap="act.support" variant="default" dialog={{
            title: 'Submit data request', feature: 'SA02.04',
            impact: ['Queues one job per store (8 stores)', 'Retained records listed with reason before confirm', 'Export link expires in 72 h, access-controlled'],
          }} />
          <Assumption decision="D13">Backup expiry and retention classes follow the default data policy until Security/Legal confirm.</Assumption>
        </div>
      </Panel>
    </div>
  )
}
