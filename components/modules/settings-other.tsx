'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Mail, Upload, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { can, ROLES, type RoleId } from '@/lib/rbac'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, inputCls } from '@/components/admin/ui'

const ADMINS = [
  { name: 'Maya Okafor', email: 'maya@ledgerline.example', role: 'owner' as RoleId, mfa: 'Passkey', login: 'Google Workspace SSO', last: '2 min ago', state: 'Active' },
  { name: 'Arjun Ilunga', email: 'arjun@ledgerline.example', role: 'finance' as RoleId, mfa: 'Authenticator app', login: 'Google Workspace SSO', last: '1 h ago', state: 'Active' },
  { name: 'Rosa Chen', email: 'rosa@ledgerline.example', role: 'operations' as RoleId, mfa: 'Passkey', login: 'Google Workspace SSO', last: '12 min ago', state: 'Active' },
  { name: 'Jonas Brandt', email: 'jonas@ledgerline.example', role: 'support' as RoleId, mfa: 'Authenticator app', login: 'Google Workspace SSO', last: 'Yesterday', state: 'Active' },
  { name: 'Lena Fischer', email: 'lena@ledgerline.example', role: 'security' as RoleId, mfa: 'Hardware key', login: 'Google Workspace SSO', last: '3 h ago', state: 'Active' },
  { name: 'Tom Reyes', email: 'tom.contractor@agency.example', role: 'analyst' as RoleId, mfa: 'Not set up', login: 'Email + password', last: 'Never', state: 'Invited · expires in 5 days' },
  { name: 'Break-glass owner', email: 'emergency@ledgerline.example', role: 'owner' as RoleId, mfa: 'Hardware key ×2', login: 'Email + password (sealed)', last: '41 days ago (drill)', state: 'Sealed' },
]

export function TeamSection() {
  const { role } = useAdmin()
  const [invite, setInvite] = useState<RoleId>('analyst')

  return (
    <div className="flex flex-col gap-5">
      <Callout tone="info" title="Where admin user IDs and passwords are kept">
        Each admin signs in with their own email. Passwords are <span className="font-medium">never stored or shown here</span> — with Single Sign-On (SSO) they live in your Google Workspace; otherwise only a one-way scrambled version (hash) is kept, which even engineers cannot read. To help someone who is locked out, send a reset link or reset their second factor. Never share one login between people: the audit trail must show who did what.
      </Callout>

      <Panel title="Admin team" features={['GAP-S03', 'SA13.01']} description="People who can sign in to this superadmin panel, their role and how they sign in."
        actions={<ActionButton label="Invite admin" cap="act.roles" variant="default" icon={<UserPlus />} dialog={{ title: 'Invite an administrator', feature: 'GAP-S03', impact: ['Sends a one-time invite link valid for 7 days', `They will get the ${ROLES[invite].label} role: ${ROLES[invite].boundary}`, 'They must set up a second factor (MFA) on first sign-in'], secondReview: invite === 'owner', fields: (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name"><input className={inputCls} placeholder="Priya Shah" /></Field>
            <Field label="Work email"><input type="email" className={inputCls} placeholder="priya@ledgerline.example" /></Field>
            <Field label="Role" hint="Give the smallest role that does the job.">
              <select value={invite} onChange={(e) => setInvite(e.target.value as RoleId)} className={inputCls}>
                {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Access expires" hint="Use for contractors."><select className={inputCls}><option>Never</option><option>In 30 days</option><option>In 90 days</option></select></Field>
          </div>
        ) }} />}>
        <DataTable dense columns={[{ key: 'n', label: 'Person' }, { key: 'r', label: 'Role' }, { key: 'l', label: 'Signs in with' }, { key: 'm', label: 'Second factor' }, { key: 'la', label: 'Last active' }, { key: 's', label: 'Status' }, { key: 'a', label: '' }]} rows={ADMINS.map((a) => ({
          n: <div><p className="font-medium">{a.name}</p><p className="text-[11px] text-muted-foreground">{a.email}</p></div>,
          r: ROLES[a.role].label,
          l: a.login,
          m: a.mfa === 'Not set up' ? <Badge tone="warn">Not set up</Badge> : a.mfa,
          la: a.last,
          s: <Badge tone={a.state === 'Active' ? 'good' : a.state === 'Sealed' ? 'neutral' : 'warn'}>{a.state}</Badge>,
          a: a.state === 'Sealed' ? <span className="text-[11px] text-muted-foreground">Opened only in emergencies</span> : (
            <span className="flex gap-1">
              <ActionButton label="Reset access" cap="act.roles" size="xs" dialog={{ title: `Reset access for ${a.name}`, feature: 'GAP-S03', impact: [a.login.includes('SSO') ? 'Password is managed by Google Workspace — this resets their second factor and signs them out everywhere' : 'Emails a password-reset link valid for 30 minutes', 'Their role and history are unchanged'] }} />
              <ActionButton label="Remove" cap="act.roles" size="xs" variant="ghost" dialog={{ title: `Remove ${a.name}`, feature: 'GAP-S03', destructive: true, impact: ['Signs them out immediately and blocks sign-in', 'Their past actions stay in the audit trail', 'Any support sessions they hold are ended'], uncertain: a.role === 'owner' ? 'At least one active owner must remain.' : undefined }} />
            </span>
          ),
        }))} />
      </Panel>

      <div className="grid grid-cols-2 gap-5">
        <Panel title="Sign-in rules" features={['GAP-S03', 'SA13.01']}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sign-in method"><select className={inputCls} disabled={!can(role, 'act.security')}><option>Google Workspace SSO (required)</option><option>SSO or email + password</option></select></Field>
            <Field label="Second factor (MFA)"><select className={inputCls} disabled={!can(role, 'act.security')}><option>Required for everyone</option><option>Required for owner & finance</option></select></Field>
            <Field label="Sign out after inactivity"><select className={inputCls} disabled={!can(role, 'act.security')}><option>30 minutes</option><option>2 hours</option><option>8 hours</option></select></Field>
            <Field label="Allowed networks" hint="Optional office/VPN IP ranges"><input className={inputCls} defaultValue="Any (no restriction)" disabled={!can(role, 'act.security')} /></Field>
          </div>
        </Panel>
        <Panel title="Emergency (break-glass) account" features={['GAP-S03']}>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">If SSO is down, a sealed owner account lets you get back in. Its password and two hardware keys are kept offline (e.g. company safe or password manager vault owned by two founders). Every use pages the Security admin and is audited.</p>
          <div className="mt-3"><KV cols={2} items={[['Last drill', '12 Sep 2026 · passed'], ['Keys held by', 'M. Okafor, L. Fischer']]} /></div>
          <div className="mt-3"><Assumption>Two-person custody of the emergency account is an assumed policy; confirm with Security.</Assumption></div>
        </Panel>
      </div>
    </div>
  )
}

export function BrandSection() {
  const { role, record } = useAdmin()
  const allowed = can(role, 'act.settings')
  const [name, setName] = useState('Ledgerline AI')
  const [color, setColor] = useState('#0f6e6e')
  const [saved, setSaved] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <Callout tone="info" title="What brand settings change">These are what your customers see: the logo and colours in their app, the name on invoices, and the sender of every email. Changes apply to customer-facing surfaces only, never to this admin panel.</Callout>
      <div className="grid grid-cols-5 gap-5">
        <Panel title="Brand identity" features={['GAP-S04']} className="col-span-3">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} disabled={!allowed} /></Field>
            <Field label="Primary colour" hint="Buttons and links in the customer app">
              <span className="flex items-center gap-2"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={!allowed} className="h-8 w-10 rounded border" aria-label="Pick colour" /><input value={color} onChange={(e) => setColor(e.target.value)} className={inputCls} disabled={!allowed} /></span>
            </Field>
            <Field label="Support email shown to customers"><input className={inputCls} defaultValue="help@ledgerline.example" disabled={!allowed} /></Field>
            <Field label="Help centre URL"><input className={inputCls} defaultValue="https://help.ledgerline.example" disabled={!allowed} /></Field>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[['Logo (light background)', 'SVG or PNG, 512px+'], ['Logo (dark background)', 'Missing — light logo used'], ['Favicon / app icon', 'Square PNG, 256px']].map(([l, h], i) => (
              <div key={l} className="flex flex-col gap-2 rounded border border-dashed p-3">
                <p className="text-xs font-medium">{l}</p>
                <div className="flex h-16 items-center justify-center rounded bg-muted">
                  {i === 1 ? <span className="text-[11px] text-warn">Not uploaded</span> : <Image src="/brand/ledgerline-logo.png" alt={`${name} ${l}`} width={48} height={48} className="rounded" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{h}</p>
                <Button size="xs" variant="outline" disabled={!allowed}><Upload /> Replace</Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" disabled={!allowed} onClick={() => setSaved(record({ action: 'GAP-S04:Publish brand', target: name, reason: 'Brand update' }))}>Publish brand</Button>
            {saved && <span className="text-xs text-primary" role="status">Published · {saved} · live in about 5 minutes</span>}
          </div>
        </Panel>
        <Panel title="Customer preview" features={['GAP-S04']} className="col-span-2">
          <div className="overflow-hidden rounded border">
            <div className="flex items-center gap-2 border-b bg-card px-3 py-2">
              <Image src="/brand/ledgerline-logo.png" alt="" width={20} height={20} className="rounded-sm" />
              <span className="text-sm font-semibold">{name}</span>
            </div>
            <div className="flex flex-col gap-2 bg-background p-4">
              <p className="text-xs text-muted-foreground">Low credit warning email</p>
              <p className="text-sm">Your workspace has 8% of its monthly credits left.</p>
              <span className="w-fit rounded px-3 py-1.5 text-xs font-medium text-primary-foreground" style={{ backgroundColor: color }}>Top up credits</span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Email sender & domain" features={['GAP-S04']} description="Proves to Gmail/Outlook that emails really come from you, so they don't land in spam. Your IT person adds these records once at your domain provider.">
        <div className="mb-3 grid grid-cols-3 gap-3">
          <Field label="From name"><input className={inputCls} defaultValue="Ledgerline AI" disabled={!allowed} /></Field>
          <Field label="From address"><input className={inputCls} defaultValue="no-reply@mail.ledgerline.example" disabled={!allowed} /></Field>
          <Field label="Sent through"><input className={inputCls} value="Resend (Integrations)" readOnly /></Field>
        </div>
        <DataTable dense columns={[{ key: 't', label: 'Record' }, { key: 'h', label: 'Host' }, { key: 'p', label: 'Purpose' }, { key: 's', label: 'Status' }]} rows={[
          { t: 'TXT (SPF)', h: 'mail.ledgerline.example', p: 'Allows Resend to send for you', s: <Badge tone="good">Verified</Badge> },
          { t: 'CNAME (DKIM)', h: 'resend._domainkey', p: 'Digital signature on every email', s: <Badge tone="good">Verified</Badge> },
          { t: 'TXT (DMARC)', h: '_dmarc', p: 'Tells inboxes what to do with fakes', s: <Badge tone="warn">Missing — add for better delivery</Badge> },
        ]} />
        <div className="mt-3"><Button size="sm" variant="outline" disabled={!allowed}><Mail /> Send test email to me</Button></div>
      </Panel>
    </div>
  )
}

export function GeneralSection() {
  const { role } = useAdmin()
  const allowed = can(role, 'act.settings')
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Company & legal details" features={['GAP-S05']} description="Printed on invoices and receipts.">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Legal entity"><input className={inputCls} defaultValue="Ledgerline Technologies Ltd" disabled={!allowed} /></Field>
            <Field label="Tax / VAT number"><input className={inputCls} defaultValue="GB 123 4567 89" disabled={!allowed} /></Field>
            <Field label="Registered address"><input className={inputCls} defaultValue="12 Harbour St, London" disabled={!allowed} /></Field>
            <Field label="Terms & privacy URLs"><input className={inputCls} defaultValue="ledgerline.example/legal" disabled={!allowed} /></Field>
          </div>
        </Panel>
        <Panel title="Money & time defaults" features={['GAP-S05', 'SA06.05']} description="Used across every report unless a filter overrides it.">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reporting currency" hint="D08 — FX source configurable"><select className={inputCls} disabled={!allowed}><option>USD</option><option>EUR</option><option>GBP</option></select></Field>
            <Field label="Reporting time zone"><select className={inputCls} disabled={!allowed}><option>UTC</option><option>Europe/London</option><option>America/New_York</option></select></Field>
            <Field label="Financial year starts"><select className={inputCls} disabled={!allowed}><option>January</option><option>April</option><option>July</option></select></Field>
            <Field label="Period close day" hint="Day of month finance closes the books"><select className={inputCls} disabled={!allowed}><option>5th business day</option><option>Last day</option></select></Field>
          </div>
        </Panel>
      </div>
      <Panel title="Environments" features={['GAP-S05']} description="Separate copies of the platform. Only Production affects real customers and money.">
        <DataTable dense columns={[{ key: 'e', label: 'Environment' }, { key: 'p', label: 'Purpose' }, { key: 'd', label: 'Data' }, { key: 'b', label: 'Billing' }]} rows={[
          { e: <Badge tone="bad">Production</Badge>, p: 'Real customers', d: 'Real, private', b: 'Real charges' },
          { e: <Badge tone="warn">Staging</Badge>, p: 'Final checks before release', d: 'Copied, anonymised', b: 'Test mode' },
          { e: <Badge tone="neutral">Development</Badge>, p: 'Engineers building features', d: 'Fake', b: 'None' },
          { e: <Badge tone="neutral">Evaluation</Badge>, p: 'Testing AI quality on sample sets', d: 'Curated test sets', b: 'Internal cost only' },
        ]} />
      </Panel>
    </div>
  )
}
