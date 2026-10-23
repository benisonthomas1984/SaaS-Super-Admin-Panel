import { UserMinus, Download } from 'lucide-react'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'
import { ROLES, CAP_LABEL, type Capability } from '@/lib/rbac'
import { LiveAuditTable, SupportAccessForm } from './support-access'

const CAPS: Capability[] = ['view.finance', 'view.margin', 'view.customer', 'view.content', 'act.finance', 'act.pricing', 'act.killswitch', 'act.support', 'act.roles']

export function RolesSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Role → capability matrix" features={['SA13.01']} description="Enforced server-side; the UI only reflects it. Raw customer content is granted to no role by default.">
        <StateFrame features={['SA13.01']} cap="view.security">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3 font-medium">Role</th>{CAPS.map((c) => <th key={c} className="px-2 py-2 font-medium" title={CAP_LABEL[c]}>{c}</th>)}</tr></thead>
              <tbody>
                {Object.entries(ROLES).map(([id, r]) => (
                  <tr key={id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.label}</td>
                    {CAPS.map((c) => <td key={c} className="px-2 py-2 text-center">{r.caps.includes(c) ? <span className="text-primary" aria-label="granted">●</span> : <span className="text-muted-foreground/40" aria-label="not granted">○</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-3 gap-5">
        <Panel title="Administrators" features={['SA13.01']} className="col-span-2">
          <DataTable dense columns={[{ key: 'n', label: 'Admin' }, { key: 'r', label: 'Role' }, { key: 'mfa', label: 'MFA' }, { key: 's', label: 'Sessions' }, { key: 'l', label: 'Last active' }, { key: 'a', label: '' }]} rows={[
            { n: 'A. Rivera', r: 'Owner', mfa: <Badge tone="good">Hardware key</Badge>, s: '1', l: 'now', a: null },
            { n: 'J. Brandt', r: 'Finance', mfa: <Badge tone="good">TOTP</Badge>, s: '2', l: '10:41', a: null },
            { n: 'M. Okafor', r: 'Operations', mfa: <Badge tone="good">TOTP</Badge>, s: '1', l: '09:44', a: null },
            { n: 'P. Lindqvist', r: 'Support', mfa: <Badge tone="bad">Not enrolled</Badge>, s: '0 (blocked)', l: '—', a: <ActionButton label="Revoke" cap="act.roles" size="xs" variant="destructive" icon={<UserMinus />} dialog={{ title: 'Revoke P. Lindqvist', feature: 'SA13.01', destructive: true, impact: ['All sessions end within revocation target (TBD · D17)', 'Owner cannot revoke the last Owner'] }} /> },
          ]} />
        </Panel>
        <div className="flex flex-col gap-3">
          <KV items={[['MFA', 'Required for all roles'], ['Idle timeout', '30 min'], ['Re-auth for sensitive actions', 'Yes (≤ 5 min)'], ['Revocation propagation', <Prov key="p" kind="pending" label="TBD · D17" />]]} />
          <Assumption decision="D14">Sensitive actions above threshold need a second reviewer from a different admin.</Assumption>
        </div>
      </div>
    </div>
  )
}

export function AuditSection() {
  return (
    <Panel title="Audit trail" features={['SA13.02']} description="Append-only. Actions you take in this prototype appear at the top." actions={
      <ActionButton label="Export" cap="act.export" icon={<Download />} dialog={{ title: 'Export audit log', feature: 'SA13.02', impact: ['Async job; signed link expires in 24 h', 'Export itself is audited'] }} />
    }>
      <StateFrame features={['SA13.02']} cap="view.security" rows={6}>
        <div className="mb-3 grid grid-cols-4 gap-3">
          <Field label="Actor"><select className={inputCls}><option>All admins</option></select></Field>
          <Field label="Action"><select className={inputCls}><option>All actions</option><option>Financial</option><option>Access</option></select></Field>
          <Field label="Target"><input className={inputCls} placeholder="CO-… / key / run" /></Field>
          <Field label="Integrity"><select className={inputCls} disabled><option>Hash chain verified 10:00 UTC</option></select></Field>
        </div>
        <LiveAuditTable />
      </StateFrame>
    </Panel>
  )
}

export function RetentionSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Retention classes" features={['SA13.03', 'SA02.04']} className="col-span-2">
        <StateFrame features={['SA13.03']} cap="view.security">
          <DataTable dense columns={[{ key: 'c', label: 'Data class' }, { key: 'r', label: 'Retention' }, { key: 'reason', label: 'Basis' }, { key: 'del', label: 'On deletion request' }]} rows={[
            { c: 'Prompts & responses', r: 'Not logged (default)', reason: 'D13 assumption', del: 'Nothing to delete' },
            { c: 'Task metadata (no content)', r: '24 months', reason: 'Billing evidence', del: 'Pseudonymized' },
            { c: 'Invoices, ledger entries', r: '7 years', reason: 'Tax / legal', del: 'Retained · reason shown' },
            { c: 'Audit log', r: '7 years', reason: 'Security accountability', del: 'Retained (C07)' },
            { c: 'Knowledge files & vectors', r: 'Life of account', reason: 'Customer content', del: 'Deleted · backups expire 35 d' },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Field label="Content logging policy"><select className={inputCls}><option>No content logging (default)</option><option>Redacted · 30 days</option><option>Full · with contract consent</option></select></Field>
        <Assumption decision="D13">No prompt/response content retained; per-tenant opt-in only.</Assumption>
      </div>
    </div>
  )
}

export function SupportAccessSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Start support session" features={['SA13.04']} className="col-span-2" description="Time-boxed, scoped, reason-linked. The tenant sees a session banner and the session is audited.">
        <StateFrame features={['SA13.04']} cap="view.customer">
          <SupportAccessForm />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Callout tone="warn" title="C01 · P0 depends on P1">SA13.04 depends on SA15.01 cases (P1). At P0 a free-text case reference is mandatory instead.</Callout>
        <Callout tone="info" title="No impersonation">Support sees what the customer sees but cannot act as them, send messages, or change billing.</Callout>
      </div>
    </div>
  )
}
