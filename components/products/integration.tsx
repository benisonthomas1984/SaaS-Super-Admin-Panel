'use client'

import { useState } from 'react'
import { Check, Circle, KeyRound, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, Panel, inputCls } from '@/components/admin/ui'
import { can } from '@/lib/rbac'
import { cn } from '@/lib/utils'
import { EXECUTION_META } from '@/lib/products'
import { useProducts } from './products-context'

const STEPS = ['Environment', 'Execution & billing', 'Credentials', 'Mappings', 'Signed test events', 'Readiness']

const TESTS = [
  'Bootstrap token exchange',
  'Signed request rejected when tampered',
  'Idempotent retry returns same result',
  'Entitlement resolve for test account',
  'Reserve → settle → release on test wallet',
  'Usage batch with late record',
  'Webhook delivery and signature check',
]

export function ConnectSection({ productId }: { productId: string }) {
  const { get, markConnected } = useProducts()
  const { role, record } = useAdmin()
  const product = get(productId)
  const [step, setStep] = useState(0)
  const [env, setEnv] = useState<'sandbox' | 'production'>('sandbox')
  const [secretShown, setSecretShown] = useState(false)
  const [testIdx, setTestIdx] = useState(-1)
  const [running, setRunning] = useState(false)
  if (!product) return null
  const allowed = can(role, 'act.integration')

  const runTests = () => {
    setRunning(true)
    let i = 0
    const tick = () => {
      setTestIdx(i)
      i += 1
      if (i <= TESTS.length) setTimeout(tick, 350)
      else setRunning(false)
    }
    tick()
  }
  const testsDone = testIdx >= TESTS.length

  return (
    <div className="flex flex-col gap-5">
      {!allowed && <Callout tone="bad" title="403 · You can view this wizard but not change it">Connecting a backend requires integration permission (Owner, Operations).</Callout>}
      <ol className="flex flex-wrap gap-2" aria-label="Connection steps">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} className={cn('flex items-center gap-2 rounded border px-3 py-1.5 text-xs', i === step ? 'border-primary bg-primary-soft text-primary' : i < step ? 'text-foreground' : 'text-muted-foreground')} aria-current={i === step ? 'step' : undefined}>
              {i < step ? <Check className="size-3.5" /> : <Circle className="size-3.5" />} {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      <Panel title={`Connect ${product.name} · step ${step + 1} of ${STEPS.length}`} features={['MP07']} description="Pasting an app URL never connects a product. Each step below must succeed.">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Environment">
              <select className={inputCls} value={env} onChange={(e) => setEnv(e.target.value as 'sandbox' | 'production')}>
                <option value="sandbox">Sandbox — test wallets, no real charges</option>
                <option value="production">Production</option>
              </select>
            </Field>
            <Field label="Backend base URL" hint="Used for outbound webhooks only"><input className={inputCls} defaultValue={product.appUrl} /></Field>
            <Field label="Allowed source IPs (optional)"><input className={inputCls + ' font-mono'} placeholder="203.0.113.0/24" /></Field>
            <Callout tone="info" title="Isolation">Sandbox credentials cannot read or write production wallets, and the reverse is also blocked.</Callout>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-3 text-sm">
            <p>Execution mode: <span className="font-medium">{EXECUTION_META[product.execution].label}</span> — {EXECUTION_META[product.execution].enforcement}.</p>
            <DataTable dense columns={[{ key: 'd', label: 'Data domain' }, { key: 'o', label: 'Source of truth' }]} rows={[
              { d: 'Package catalogue & prices', o: 'This panel' },
              { d: 'Customer subscriptions', o: product.billingOwner === 'central' ? 'This panel' : 'External billing — imported' },
              { d: 'Invoices & payments', o: product.billingOwner === 'central' ? 'This panel via billing provider' : 'External billing — imported' },
              { d: 'Usage & tasks', o: 'Product app → reported here' },
              { d: 'Provider cost', o: 'Provider invoices (reconciled) + app reports (estimated)' },
              { d: 'Product users & content', o: 'Product app — never copied here' },
            ]} />
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm">Generate a scoped credential for <span className="font-medium">{env}</span>. It is shown once and cannot be recovered.</p>
            {secretShown ? (
              <div className="rounded border bg-muted/50 p-3">
                <p className="font-mono text-xs break-all">sk_{env === 'sandbox' ? 'test' : 'live'}_{product.slug}_••••••••••••••••a91f</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Copy it to your product backend&apos;s secret store now. Only the last 4 characters remain visible after you leave this step.</p>
              </div>
            ) : (
              <Button size="sm" className="w-fit" disabled={!allowed} onClick={() => { setSecretShown(true); record({ action: 'credential.issue', target: product.id, reason: `${env} runtime credential` }) }}><KeyRound /> Generate credential</Button>
            )}
            <p className="text-xs text-muted-foreground">Scopes: entitlements:read, wallet:reserve, wallet:settle, usage:write, events:write. No admin or cross-product scopes.</p>
          </div>
        )}
        {step === 3 && (
          <DataTable dense columns={[{ key: 'a', label: 'App field' }, { key: 'b', label: 'Maps to' }, { key: 's', label: 'Status' }]} rows={[
            { a: 'company.id', b: 'external_company_id', s: <Badge tone="good">Mapped</Badge> },
            { a: 'user.id', b: 'external_user_id', s: <Badge tone="good">Mapped</Badge> },
            { a: 'plan_code', b: 'package_id + version', s: <Badge tone="warn">2 of 3 codes mapped</Badge> },
            { a: 'usage.kind', b: 'meter key', s: <Badge tone="warn">audio.seconds unmapped</Badge> },
          ]} />
        )}
        {step === 4 && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-1.5 text-sm">
              {TESTS.map((t, i) => (
                <li key={t} className="flex items-center gap-2">
                  {testIdx > i || testsDone ? <Check className="size-4 text-primary" /> : testIdx === i && running ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Circle className="size-4 text-muted-foreground" />}
                  {t}
                </li>
              ))}
            </ul>
            <Button size="sm" className="w-fit" disabled={!allowed || running} onClick={runTests}>{running ? 'Running…' : testsDone ? 'Run again' : 'Send signed test events'}</Button>
          </div>
        )}
        {step === 5 && (
          <div className="flex flex-col gap-3">
            <ReadinessChecklist ready={testsDone} />
            <Button size="sm" className="w-fit" disabled={!allowed || !testsDone} onClick={() => { markConnected(product.id); record({ action: 'product.connect', target: product.id, reason: `${env} verified` }) }}>
              Mark {env} connected
            </Button>
            {!testsDone && <p className="text-xs text-muted-foreground">Finish signed test events first.</p>}
            {product.connection === 'connected' && <Callout tone="info" title="Connected">Heartbeat received. Status changes are audited.</Callout>}
          </div>
        )}
        <div className="mt-5 flex justify-between border-t pt-3">
          <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <Button variant="outline" size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Next</Button>
        </div>
      </Panel>
    </div>
  )
}

function ReadinessChecklist({ ready }: { ready: boolean }) {
  const items: [string, boolean | 'warn'][] = [
    ['Credential issued and scoped', true],
    ['Signed test events passed', ready],
    ['All plan codes mapped', 'warn'],
    ['All meters mapped and rated', 'warn'],
    ['Webhook endpoint verified', ready],
    ['Usage freshness within 2 min', ready],
  ]
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm">
      {items.map(([t, ok]) => (
        <li key={t} className="flex items-center gap-2 rounded border px-2.5 py-1.5">
          {ok === true ? <Check className="size-4 text-primary" /> : ok === 'warn' ? <Circle className="size-4 text-warn" /> : <X className="size-4 text-destructive" />}
          {t}
        </li>
      ))}
    </ul>
  )
}

export function ReadinessSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  const connected = product.connection === 'connected' || product.connection === 'degraded'
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Readiness checklist" features={['MP21', 'MP07']}>
        <ReadinessChecklist ready={connected} />
      </Panel>
      <Panel title="Data coverage by domain" features={['MP21']} description="Missing data is shown as missing — never as zero.">
        <StateFrame features={['MP21']} cap="view.usage">
          <DataTable columns={[{ key: 'd', label: 'Domain' }, { key: 'f', label: 'Last received' }, { key: 'c', label: 'Coverage', align: 'right' }, { key: 's', label: 'State' }]} rows={[
            { d: 'Heartbeat', f: product.lastHeartbeat, c: '—', s: <Badge tone={product.connection === 'degraded' ? 'bad' : connected ? 'good' : 'neutral'}>{connected ? (product.connection === 'degraded' ? 'Stale' : 'Fresh') : 'Never'}</Badge> },
            { d: 'Usage batches', f: connected ? '1 min ago' : 'never', c: connected ? '99.2%' : '0%', s: <Badge tone={connected ? 'good' : 'neutral'}>{connected ? 'OK' : 'Unavailable'}</Badge> },
            { d: 'Outcome events', f: connected ? '3 min ago' : 'never', c: connected ? '87%' : '0%', s: <Badge tone="warn">Partial</Badge> },
            { d: 'Provider cost (app reports)', f: connected ? '5 min ago' : 'never', c: connected ? '100%' : '0%', s: <Badge tone="outline">Estimated</Badge> },
            { d: 'Provider invoices', f: 'Sep 30', c: '100% (Sep)', s: <Badge tone="good">Reconciled</Badge> },
            { d: 'Marketing spend', f: 'none', c: '0%', s: <Badge tone="neutral">Not connected</Badge> },
          ]} />
        </StateFrame>
      </Panel>
    </div>
  )
}

export function CredentialsSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  return (
    <div className="flex flex-col gap-5">
      <Callout tone="info" title="Not the same as customer API keys">These credentials belong to the {product.name} backend. Customer-facing API keys live in Developer platform (SA16.01).</Callout>
      <Panel title="Runtime credentials" features={['MP08']}>
        <StateFrame features={['MP08']} cap="view.security" emptyTitle="No credentials issued" emptyHint="Run the connection wizard to issue the first credential.">
          <DataTable columns={[{ key: 'id', label: 'Credential', mono: true }, { key: 'e', label: 'Environment' }, { key: 's', label: 'Scopes' }, { key: 'u', label: 'Last used' }, { key: 'x', label: 'Expires' }, { key: 'st', label: 'Status' }, { key: 'a', label: '' }]} rows={product.connection === 'not_connected' ? [] : [
            { id: 'cred_live_••a91f', e: 'Production', s: '5 runtime scopes', u: '12 s ago', x: '2027-04-01', st: <Badge tone="good">Active</Badge>, a: <CredActions /> },
            { id: 'cred_test_••77c0', e: 'Sandbox', s: '5 runtime scopes', u: '2 h ago', x: '2027-04-01', st: <Badge tone="good">Active</Badge>, a: <CredActions /> },
            { id: 'cred_live_••0e12', e: 'Production', s: '5 runtime scopes', u: 'Sep 30', x: 'Rotated · overlap ends Oct 24', st: <Badge tone="warn">Rotating</Badge>, a: <CredActions /> },
          ]} />
        </StateFrame>
        <div className="mt-3"><Assumption decision="PD07">Rotation overlap window is undecided; shown as TBD until approved.</Assumption></div>
      </Panel>
      <Panel title="Product admin access" features={['MP24']} description="Grants scoped to this product only. A grant here gives no access to other products.">
        <DataTable dense columns={[{ key: 'p', label: 'Person' }, { key: 'r', label: 'Product role' }, { key: 'sc', label: 'Scope' }, { key: 'a', label: '' }]} rows={[
          { p: 'A. Rivera', r: 'Product owner', sc: `${product.name} · packages, analytics`, a: <ActionButton size="xs" label="Revoke" cap="act.roles" dialog={{ title: 'Revoke product grant', feature: 'MP24', impact: ['Access ends immediately for this product only'] }} /> },
          { p: 'J. Chen', r: 'Product analyst', sc: `${product.name} · aggregates only`, a: <ActionButton size="xs" label="Revoke" cap="act.roles" dialog={{ title: 'Revoke product grant', feature: 'MP24', impact: ['Access ends immediately for this product only'] }} /> },
        ]} />
      </Panel>
    </div>
  )
}

function CredActions() {
  return (
    <div className="flex gap-1.5">
      <ActionButton size="xs" label="Rotate" cap="act.integration" dialog={{ title: 'Rotate credential', feature: 'MP08', impact: ['A new secret is shown once', 'Old secret works until the overlap window ends (PD07: TBD)', 'Signed credential.rotated event sent'] }} />
      <ActionButton size="xs" label="Revoke" cap="act.security" dialog={{ title: 'Revoke credential now', feature: 'MP08', destructive: true, impact: ['All calls with this credential fail with 401 immediately', 'Product cannot reserve credits until a new credential is installed'], uncertain: 'Requests already in flight may complete.' }} />
    </div>
  )
}

export function WebhooksSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Outbound subscriptions" features={['MP19']} description="Signed events this panel sends to the product. The product must verify the signature and handle duplicates.">
        <DataTable columns={[{ key: 'e', label: 'Event' }, { key: 's', label: 'Signing key' }, { key: 'd', label: 'Delivery (24 h)', align: 'right' }, { key: 'st', label: 'Status' }]} rows={[
          { e: 'package.updated', s: 'whsec_••4c1', d: '3 / 3', st: <Badge tone="good">Healthy</Badge> },
          { e: 'subscription.changed', s: 'whsec_••4c1', d: '41 / 41', st: <Badge tone="good">Healthy</Badge> },
          { e: 'entitlement.invalidated', s: 'whsec_••4c1', d: '118 / 120', st: <Badge tone="warn">2 retrying</Badge> },
          { e: 'product.suspended', s: 'whsec_••4c1', d: '0 / 0', st: <Badge tone="outline">No events</Badge> },
        ]} />
      </Panel>
      <Panel title="Delivery log" features={['MP19']}>
        <StateFrame features={['MP19']} cap="view.usage" emptyTitle="No deliveries in this period">
          <DataTable dense columns={[{ key: 'id', label: 'event_id', mono: true }, { key: 't', label: 'Type' }, { key: 'a', label: 'Attempts', align: 'right' }, { key: 'r', label: 'Last response' }, { key: 'x', label: '' }]} rows={[
            { id: 'evt_9QX2…', t: 'entitlement.invalidated', a: '4', r: <span className="text-destructive">503 · 11:02</span>, x: <ActionButton size="xs" label="Redeliver" cap="act.integration" dialog={{ title: 'Redeliver event', feature: 'MP19', impact: ['Same event_id is sent again', 'Receiver must treat it as a duplicate if already processed'] }} /> },
            { id: 'evt_9QW8…', t: 'subscription.changed', a: '1', r: '200 · 10:47', x: '' },
          ]} />
        </StateFrame>
      </Panel>
    </div>
  )
}
