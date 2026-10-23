'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/components/admin/admin-context'
import { can } from '@/lib/rbac'
import { Badge, DataTable, Field, inputCls } from '@/components/admin/ui'

export function SupportAccessForm() {
  const { role, supportSession, setSupportSession, record } = useAdmin()
  const [company, setCompany] = useState('CO-10482')
  const [caseRef, setCaseRef] = useState('')
  const [scope, setScope] = useState('Metadata only')
  const [duration, setDuration] = useState('30')
  const allowed = can(role, 'act.support')
  const valid = caseRef.trim().length >= 4

  function start(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || !allowed) return
    const expires = new Date(Date.now() + Number(duration) * 60000).toISOString().slice(11, 16) + ' UTC'
    setSupportSession({ company, reason: caseRef, scope, expiresAt: expires })
    record({ action: 'support_session.start', target: company, reason: `${caseRef} · ${scope} · ${duration} min` })
  }

  function end() {
    if (!supportSession) return
    record({ action: 'support_session.end', target: supportSession.company, reason: 'Ended by admin' })
    setSupportSession(null)
  }

  if (supportSession) {
    return (
      <div className="flex flex-col gap-3 rounded border border-warn/50 bg-warn/10 p-4 text-sm">
        <p className="font-medium">Session active · {supportSession.company}</p>
        <p className="text-xs text-muted-foreground">{supportSession.reason} · {supportSession.scope} · expires {supportSession.expiresAt}. Every view is audited.</p>
        <Button size="sm" variant="outline" onClick={end} className="self-start">End session</Button>
      </div>
    )
  }

  return (
    <form onSubmit={start} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company"><select className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)}><option>CO-10482</option><option>CO-10019</option><option>CO-10377</option></select></Field>
        <Field label="Case reference (required)" hint="Free text at P0 · SA15.01 link at P1 (C01)"><input className={inputCls} value={caseRef} onChange={(e) => setCaseRef(e.target.value)} placeholder="CASE-2291" aria-invalid={caseRef.length > 0 && !valid} /></Field>
        <Field label="Scope"><select className={inputCls} value={scope} onChange={(e) => setScope(e.target.value)}><option>Metadata only</option><option>Metadata + task traces</option><option>Customer content (needs tenant consent)</option></select></Field>
        <Field label="Duration"><select className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)}><option value="15">15 min</option><option value="30">30 min</option><option value="60">60 min (max)</option></select></Field>
      </div>
      {!allowed && <p className="text-xs text-destructive">Your role cannot open support sessions (needs act.support).</p>}
      <Button type="submit" size="sm" disabled={!valid || !allowed} className="self-start"><ShieldCheck />Start audited session</Button>
    </form>
  )
}

export function LiveAuditTable() {
  const { audit } = useAdmin()
  const sample = [
    { id: 'AUD-48210', at: '10:41:08 UTC', role: 'finance', action: 'credit_adjustment.post', target: 'CO-10482 · LED-90231', reason: 'Duplicate retry charge · CASE-2271' },
    { id: 'AUD-48209', at: '09:12:44 UTC', role: 'operations', action: 'killswitch.activate', target: 'tool:web_fetch', reason: 'INC-0918 abuse' },
    { id: 'AUD-48208', at: '08:03:12 UTC', role: 'security', action: 'admin_role.revoke', target: 'adm_17 (contractor)', reason: 'Contract ended' },
  ]
  const rows = [...audit, ...sample].map((e) => ({
    id: e.id, at: e.at, role: <Badge tone="outline">{e.role}</Badge>, action: <span className="font-mono text-xs">{e.action}</span>, target: e.target, reason: e.reason,
  }))
  return <DataTable dense columns={[{ key: 'id', label: 'ID', mono: true }, { key: 'at', label: 'Time' }, { key: 'role', label: 'Role' }, { key: 'action', label: 'Action' }, { key: 'target', label: 'Target' }, { key: 'reason', label: 'Reason' }]} rows={rows} />
}
