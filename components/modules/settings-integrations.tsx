'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, Plug, Plus, RotateCw, Search, ShieldCheck, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { can } from '@/lib/rbac'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton } from '@/components/admin/state'
import { Badge, Callout, DataTable, Field, Panel, inputCls } from '@/components/admin/ui'

type Category = 'AI models' | 'Knowledge sources' | 'Payments' | 'Email & messaging' | 'Marketing & analytics' | 'Infrastructure'
type Auth = 'apikey' | 'oauth'
type Integration = {
  id: string
  name: string
  category: Category
  auth: Auth
  blurb: string
  feeds: string[]
  status: 'connected' | 'attention' | 'off'
  envs: string[]
  lastCheck?: string
  note?: string
}

const CATALOG: Integration[] = [
  { id: 'openai', name: 'OpenAI', category: 'AI models', auth: 'apikey', blurb: 'GPT models for chat, extraction and embeddings.', feeds: ['Models & agents', 'Usage cost', 'Reconciliation'], status: 'connected', envs: ['Production', 'Staging', 'Evaluation'], lastCheck: '10:38 UTC' },
  { id: 'anthropic', name: 'Anthropic', category: 'AI models', auth: 'apikey', blurb: 'Claude models for long documents and agents.', feeds: ['Models & agents', 'Usage cost', 'Reconciliation'], status: 'connected', envs: ['Production', 'Staging'], lastCheck: '10:38 UTC' },
  { id: 'google-ai', name: 'Google Gemini', category: 'AI models', auth: 'apikey', blurb: 'Gemini models, used as a fallback route.', feeds: ['Models & agents', 'Usage cost'], status: 'attention', envs: ['Production'], lastCheck: '09:12 UTC', note: 'Key expires in 6 days — rotate soon' },
  { id: 'openrouter', name: 'OpenRouter', category: 'AI models', auth: 'apikey', blurb: 'One key for many models from many providers. Billed by OpenRouter.', feeds: ['Models & agents', 'Usage cost', 'Reconciliation'], status: 'off', envs: [] },
  { id: 'gdrive', name: 'Google Drive', category: 'Knowledge sources', auth: 'oauth', blurb: 'Lets customers connect their Drive so the AI can search their documents.', feeds: ['Knowledge & connectors', 'Storage'], status: 'off', envs: [] },
  { id: 'sharepoint', name: 'Microsoft SharePoint', category: 'Knowledge sources', auth: 'oauth', blurb: 'Customer SharePoint and OneDrive libraries.', feeds: ['Knowledge & connectors'], status: 'connected', envs: ['Production', 'Staging'], lastCheck: '10:02 UTC' },
  { id: 'notion', name: 'Notion', category: 'Knowledge sources', auth: 'oauth', blurb: 'Customer Notion workspaces as a knowledge source.', feeds: ['Knowledge & connectors'], status: 'off', envs: [] },
  { id: 'stripe', name: 'Stripe', category: 'Payments', auth: 'apikey', blurb: 'Card payments, invoices and payment events (webhooks).', feeds: ['Billing', 'Cash collected', 'Credits top-ups'], status: 'connected', envs: ['Production', 'Staging'], lastCheck: '10:40 UTC' },
  { id: 'resend', name: 'Resend', category: 'Email & messaging', auth: 'apikey', blurb: 'Sends customer emails: invoices, low-credit alerts, invites.', feeds: ['Support & comms', 'Brand sender'], status: 'connected', envs: ['Production'], lastCheck: '10:15 UTC' },
  { id: 'slack', name: 'Slack', category: 'Email & messaging', auth: 'oauth', blurb: 'Sends internal alerts to your team channels.', feeds: ['Alerts & incidents'], status: 'connected', envs: ['Production'], lastCheck: '10:20 UTC' },
  { id: 'gads', name: 'Google Ads', category: 'Marketing & analytics', auth: 'oauth', blurb: 'Imports ad spend so CAC can be calculated.', feeds: ['Acquisition · spend & CAC'], status: 'attention', envs: ['Production'], lastCheck: '22 Oct', note: 'Last import 26h ago' },
  { id: 'linkedin', name: 'LinkedIn Ads', category: 'Marketing & analytics', auth: 'oauth', blurb: 'Imports LinkedIn campaign spend.', feeds: ['Acquisition · spend & CAC'], status: 'off', envs: [] },
  { id: 'pinecone', name: 'Pinecone', category: 'Infrastructure', auth: 'apikey', blurb: 'Vector database that stores searchable document chunks.', feeds: ['Knowledge index', 'Shared costs'], status: 'connected', envs: ['Production', 'Staging'], lastCheck: '10:30 UTC' },
  { id: 's3', name: 'Amazon S3', category: 'Infrastructure', auth: 'apikey', blurb: 'File storage for uploads and exports.', feeds: ['Storage', 'Shared costs', 'Exports'], status: 'connected', envs: ['Production', 'Staging'], lastCheck: '10:30 UTC' },
]

type Secret = { id: string; name: string; service: string; env: string; last4: string; owner: string; created: string; lastUsed: string; rotate: string; state: 'ok' | 'due' | 'revoked' }

const SECRETS: Secret[] = [
  { id: 'sec_01', name: 'OpenAI · production', service: 'OpenAI', env: 'Production', last4: 'a91F', owner: 'M. Okafor', created: '02 Jun 2026', lastUsed: '2 min ago', rotate: '02 Dec 2026', state: 'ok' },
  { id: 'sec_02', name: 'OpenAI · staging', service: 'OpenAI', env: 'Staging', last4: '7c2D', owner: 'M. Okafor', created: '02 Jun 2026', lastUsed: '1 h ago', rotate: '02 Dec 2026', state: 'ok' },
  { id: 'sec_03', name: 'Anthropic · production', service: 'Anthropic', env: 'Production', last4: 'Qx0p', owner: 'M. Okafor', created: '18 Jul 2026', lastUsed: '1 min ago', rotate: '18 Jan 2027', state: 'ok' },
  { id: 'sec_04', name: 'Google Gemini · production', service: 'Google Gemini', env: 'Production', last4: 'Lm3z', owner: 'R. Chen', created: '29 Apr 2026', lastUsed: '14 min ago', rotate: '29 Oct 2026', state: 'due' },
  { id: 'sec_05', name: 'Stripe secret · live', service: 'Stripe', env: 'Production', last4: 'Ty81', owner: 'A. Ilunga', created: '11 Jan 2026', lastUsed: '30 s ago', rotate: '11 Jan 2027', state: 'ok' },
  { id: 'sec_06', name: 'Stripe webhook signing', service: 'Stripe', env: 'Production', last4: 'wh4K', owner: 'A. Ilunga', created: '11 Jan 2026', lastUsed: '30 s ago', rotate: '11 Jan 2027', state: 'ok' },
  { id: 'sec_07', name: 'Resend · production', service: 'Resend', env: 'Production', last4: 're9B', owner: 'J. Brandt', created: '05 Mar 2026', lastUsed: '6 min ago', rotate: '05 Mar 2027', state: 'ok' },
  { id: 'sec_08', name: 'Pinecone · production', service: 'Pinecone', env: 'Production', last4: 'pc2M', owner: 'R. Chen', created: '20 Feb 2026', lastUsed: '1 min ago', rotate: '20 Feb 2027', state: 'ok' },
  { id: 'sec_09', name: 'Old OpenAI key (leaked test)', service: 'OpenAI', env: 'Development', last4: 'zz10', owner: 'M. Okafor', created: '01 Feb 2026', lastUsed: 'never since revoke', rotate: '—', state: 'revoked' },
]

const STATUS = {
  connected: { label: 'Connected', tone: 'good' as const },
  attention: { label: 'Needs attention', tone: 'warn' as const },
  off: { label: 'Not connected', tone: 'outline' as const },
}

export function IntegrationsSection() {
  const { role, record } = useAdmin()
  const allowed = can(role, 'act.settings')
  const [items, setItems] = useState(CATALOG)
  const [secrets, setSecrets] = useState(SECRETS)
  const [wizard, setWizard] = useState<{ preset?: string } | null>(null)
  const [cat, setCat] = useState<'All' | Category>('All')

  const categories = useMemo(() => Array.from(new Set(CATALOG.map((c) => c.category))), [])
  const shown = items.filter((i) => cat === 'All' || i.category === cat)
  const counts = { connected: items.filter((i) => i.status === 'connected').length, attention: items.filter((i) => i.status === 'attention').length }

  return (
    <div className="flex flex-col gap-5">
      <Callout tone="info" title="Where your keys and outside services live">
        Every outside service the platform uses — AI providers like OpenAI, Anthropic or OpenRouter, document sources like Google Drive, Stripe for payments — is connected here. Their API keys are stored in the encrypted <span className="font-medium">Key vault</span> below. After saving, a key can never be viewed again, only replaced (rotated), so it cannot leak from this screen.
      </Callout>

      <Panel title="Connected integrations" features={['GAP-S01']} description={`${counts.connected} connected · ${counts.attention} need attention · ${items.length - counts.connected - counts.attention} available`}
        actions={<Button size="sm" disabled={!allowed} title={allowed ? undefined : 'Requires Platform owner'} onClick={() => setWizard({})}><Plus /> Add integration</Button>}>
        <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Integration category">
          {(['All', ...categories] as const).map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
              className={cn('rounded-full border px-2.5 py-1 text-xs', cat === c ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground')}>{c}</button>
          ))}
        </div>
        <ul className="grid grid-cols-3 gap-3">
          {shown.map((i) => (
            <li key={i.id} className={cn('flex flex-col gap-2 rounded border bg-background p-3', i.status === 'attention' && 'border-warn/50')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded bg-muted text-xs font-semibold" aria-hidden>{i.name.slice(0, 2)}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{i.name}</p>
                    <p className="text-[11px] text-muted-foreground">{i.category} · {i.auth === 'apikey' ? 'API key' : 'Sign-in (OAuth)'}</p>
                  </div>
                </div>
                <Badge tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Badge>
              </div>
              <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{i.blurb}</p>
              {i.note && <p className="text-[11px] font-medium text-warn">{i.note}</p>}
              <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Feeds:</span> {i.feeds.join(' · ')}</p>
              {i.envs.length > 0 && <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Environments:</span> {i.envs.join(', ')} · checked {i.lastCheck}</p>}
              <div className="mt-auto flex gap-2 pt-1">
                {i.status === 'off' ? (
                  <Button size="xs" disabled={!allowed} onClick={() => setWizard({ preset: i.id })}><Plug /> Connect</Button>
                ) : (
                  <>
                    <Button size="xs" variant="outline" disabled={!allowed} onClick={() => { const id = record({ action: 'GAP-S01:Test connection', target: i.name, reason: 'Manual health check' }); setItems((p) => p.map((x) => x.id === i.id ? { ...x, lastCheck: `just now · ${id}` } : x)) }}>Test connection</Button>
                    <ActionButton label="Disable" cap="act.settings" size="xs" variant="ghost" dialog={{ title: `Disable ${i.name}`, feature: 'GAP-S01', destructive: true, impact: [`Stops all traffic to ${i.name} in ${i.envs.join(', ')}`, `Screens fed by it (${i.feeds.join(', ')}) will show "Incomplete" until re-enabled`, i.category === 'AI models' ? 'Routing falls back to the next model in each policy (Models & agents › Routing)' : 'Customer connections using it pause; nothing is deleted', 'Stored keys stay in the vault, disabled'] }} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Key vault" features={['GAP-S02', 'SA16.01']} description="Encrypted at rest. Only the last 4 characters are ever shown. Reading a key is impossible from the panel; services fetch them directly."
        actions={<ActionButton label="Add secret" cap="act.security" icon={<KeyRound />} dialog={{ title: 'Add secret to vault', feature: 'GAP-S02', impact: ['Encrypted immediately; you will not be able to view it again', 'Owner is notified 14 days before rotation is due'], fields: <div className="grid grid-cols-2 gap-3"><Field label="Name"><input className={inputCls} defaultValue="OpenRouter · production" /></Field><Field label="Environment"><select className={inputCls}><option>Production</option><option>Staging</option><option>Development</option><option>Evaluation</option></select></Field><Field label="Secret value"><input type="password" className={inputCls} placeholder="Paste key" autoComplete="off" /></Field><Field label="Rotate every"><select className={inputCls}><option>90 days</option><option>180 days</option><option>365 days</option></select></Field></div> }} />}>
        <DataTable dense columns={[{ key: 'n', label: 'Secret' }, { key: 'env', label: 'Env' }, { key: 'v', label: 'Value' }, { key: 'o', label: 'Owner' }, { key: 'u', label: 'Last used' }, { key: 'r', label: 'Rotation due' }, { key: 's', label: 'Status' }, { key: 'a', label: '' }]} rows={secrets.map((s) => ({
          n: <div><p className="font-medium">{s.name}</p><p className="font-mono text-[10px] text-muted-foreground">{s.id} · created {s.created}</p></div>,
          env: s.env,
          v: <span className="font-mono text-xs">•••• •••• {s.last4}</span>,
          o: s.owner, u: s.lastUsed, r: s.rotate,
          s: <Badge tone={s.state === 'ok' ? 'good' : s.state === 'due' ? 'warn' : 'neutral'}>{s.state === 'ok' ? 'Active' : s.state === 'due' ? 'Rotate now' : 'Revoked'}</Badge>,
          a: s.state === 'revoked' ? null : (
            <span className="flex gap-1">
              <ActionButton label="Rotate" cap="act.security" size="xs" icon={<RotateCw />} dialog={{ title: `Rotate ${s.name}`, feature: 'GAP-S02', impact: ['New key becomes active immediately', 'Old key keeps working for a 1-hour overlap, then is revoked — no downtime', `Services using ${s.service} pick up the new key automatically`], fields: <Field label="New secret value"><input type="password" className={inputCls} placeholder="Paste the new key from the provider dashboard" autoComplete="off" /></Field> }} />
              <ActionButton label="Revoke" cap="act.security" size="xs" variant="ghost" dialog={{ title: `Revoke ${s.name}`, feature: 'GAP-S02', destructive: true, confirmText: 'REVOKE', impact: [`All ${s.env} calls to ${s.service} using this key fail immediately`, 'Use this if a key has leaked. Also revoke it in the provider\'s own dashboard.'] }} />
            </span>
          ),
        }))} />
      </Panel>

      {wizard && (
        <AddIntegrationWizard
          preset={wizard.preset}
          catalog={items}
          onClose={() => setWizard(null)}
          onSave={(i, envs, reason, last4) => {
            const id = record({ action: 'GAP-S01:Connect integration', target: i.name, reason })
            setItems((p) => p.map((x) => x.id === i.id ? { ...x, status: 'connected', envs, lastCheck: 'just now', note: undefined } : x))
            if (last4) setSecrets((p) => [{ id: `sec_${p.length + 10}`, name: `${i.name} · ${envs[0]?.toLowerCase() ?? 'production'}`, service: i.name, env: envs[0] ?? 'Production', last4, owner: 'You', created: 'Today', lastUsed: 'just now', rotate: 'in 90 days', state: 'ok' }, ...p])
            setWizard(null)
            return id
          }}
        />
      )}
    </div>
  )
}

const STEPS = ['Choose service', 'Connect', 'Test', 'Where to use it', 'Review']

function AddIntegrationWizard({ preset, catalog, onClose, onSave }: {
  preset?: string
  catalog: Integration[]
  onClose: () => void
  onSave: (i: Integration, envs: string[], reason: string, last4?: string) => string
}) {
  const [step, setStep] = useState(preset ? 1 : 0)
  const [pick, setPick] = useState<string | undefined>(preset)
  const [q, setQ] = useState('')
  const [key, setKey] = useState('')
  const [oauthDone, setOauthDone] = useState(false)
  const [test, setTest] = useState<'idle' | 'running' | 'ok' | 'fail'>('idle')
  const [envs, setEnvs] = useState<string[]>(['Production'])
  const [cap, setCap] = useState('2000')
  const [reason, setReason] = useState('')
  const sel = catalog.find((c) => c.id === pick)
  const available = catalog.filter((c) => c.status === 'off' && c.name.toLowerCase().includes(q.toLowerCase()))

  const canNext = [!!sel, sel?.auth === 'apikey' ? key.length >= 12 : oauthDone, test === 'ok', envs.length > 0, reason.trim().length >= 8][step]

  const runTest = () => {
    setTest('running')
    setTimeout(() => setTest(key.includes('bad') ? 'fail' : 'ok'), 1100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6">
      <div role="dialog" aria-modal="true" aria-label="Add integration" className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-md border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-3">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">GAP-S01 · proposed</p>
            <h2 className="text-base font-semibold">Add integration{sel ? `: ${sel.name}` : ''}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close"><X className="size-4" /></button>
        </div>
        <ol className="flex gap-1 border-b px-5 py-2.5 text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('flex flex-1 items-center gap-1.5', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
              <span className={cn('flex size-5 items-center justify-center rounded-full text-[10px] font-semibold', i < step ? 'bg-primary text-primary-foreground' : i === step ? 'border-2 border-primary text-primary' : 'border')}>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="flex min-h-72 flex-col gap-4 overflow-y-auto px-5 py-4 text-sm">
          {step === 0 && (
            <>
              <label className="relative">
                <span className="sr-only">Search services</span>
                <Search className="absolute left-2 top-2 size-4 text-muted-foreground" aria-hidden />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: OpenRouter, Google Drive, Notion…" className={cn(inputCls, 'w-full pl-8')} />
              </label>
              <ul className="grid grid-cols-2 gap-2">
                {available.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => setPick(c.id)} aria-pressed={pick === c.id}
                      className={cn('flex w-full flex-col items-start gap-0.5 rounded border p-3 text-left', pick === c.id ? 'border-primary bg-primary-soft' : 'hover:bg-muted/50')}>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.category}</span>
                      <span className="text-xs text-muted-foreground">{c.blurb}</span>
                    </button>
                  </li>
                ))}
                {available.length === 0 && <li className="col-span-2 rounded border border-dashed p-4 text-center text-xs text-muted-foreground">No unconnected service matches. Need something not listed? Request a custom connector from engineering.</li>}
              </ul>
            </>
          )}

          {step === 1 && sel && (sel.auth === 'apikey' ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground">Create an API key in the {sel.name} dashboard (usually under Settings › API keys), copy it, and paste it here. It is encrypted as soon as you continue.</p>
              <Field label={`${sel.name} API key`} hint="Tip: type a key containing “bad” to preview the failure state.">
                <input type="password" value={key} onChange={(e) => { setKey(e.target.value); setTest('idle') }} autoComplete="off" placeholder="sk-or-v1-…" className={cn(inputCls, 'font-mono')} />
              </Field>
              {sel.id === 'openrouter' && <Field label="Spending account label (optional)"><input className={inputCls} defaultValue="ledgerline-prod" /></Field>}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" aria-hidden /> Stored in the Key vault. Never shown again, never sent to the browser.</p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-muted-foreground">{sel.name} uses secure sign-in instead of a key. You will be sent to {sel.name} to approve <span className="font-medium text-foreground">read-only</span> access, then returned here.</p>
              <div className="rounded border bg-muted/40 p-3 text-xs">
                <p className="font-medium">Permissions requested</p>
                <ul className="mt-1 list-disc pl-4 text-muted-foreground"><li>See and download files the customer selects</li><li>Read file sharing permissions (so the AI respects who can see what)</li><li>No permission to edit or delete</li></ul>
              </div>
              {oauthDone ? <Badge tone="good">Signed in as platform@ledgerline.example</Badge> : <Button size="sm" onClick={() => setOauthDone(true)}>Sign in with {sel.name.split(' ')[0]}</Button>}
            </div>
          ))}

          {step === 2 && sel && (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground">We make a small, free test call to confirm the {sel.auth === 'apikey' ? 'key' : 'connection'} works and has the right permissions.</p>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={runTest} disabled={test === 'running'}>{test === 'running' ? <Loader2 className="animate-spin" /> : <Plug />} Run test</Button>
                {test === 'ok' && <span className="flex items-center gap-1 text-xs text-primary" role="status"><CheckCircle2 className="size-4" /> Connected · {sel.category === 'AI models' ? '312 models available · 240 ms' : 'access verified · 410 ms'}</span>}
                {test === 'fail' && <span className="flex items-center gap-1 text-xs text-bad" role="alert"><XCircle className="size-4" /> 401 Invalid key. Check you copied the whole key, then go back and paste it again.</span>}
              </div>
            </div>
          )}

          {step === 3 && sel && (
            <div className="flex flex-col gap-4">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-xs font-medium">Environments</legend>
                <p className="text-xs text-muted-foreground">Production = real customers and money. Test in Staging first if unsure.</p>
                <div className="flex gap-4">
                  {['Production', 'Staging', 'Development', 'Evaluation'].map((e) => (
                    <label key={e} className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" checked={envs.includes(e)} onChange={(ev) => setEnvs((p) => ev.target.checked ? [...p, e] : p.filter((x) => x !== e))} className="accent-[var(--primary)]" /> {e}
                    </label>
                  ))}
                </div>
              </fieldset>
              {sel.category === 'AI models' && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Monthly spend cap (USD)" hint="Creates a provider-level limit in Budgets & emergency (SA12.01).">
                    <input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="numeric" className={inputCls} />
                  </Field>
                  <Field label="Next step after saving" hint="Models are not used until registered and enabled for plans.">
                    <select className={inputCls}><option>Open Models & agents › Registry</option><option>Do it later</option></select>
                  </Field>
                </div>
              )}
              {sel.category === 'Knowledge sources' && <Callout tone="info" title="What customers will see">A “Connect {sel.name}” button appears in their workspace settings. Each customer signs in with their own account — their files are never shared with other customers.</Callout>}
            </div>
          )}

          {step === 4 && sel && (
            <div className="flex flex-col gap-3">
              <ul className="flex flex-col gap-1 rounded border bg-muted/40 p-3 text-xs">
                <li><span className="font-medium">Service:</span> {sel.name} ({sel.category})</li>
                <li><span className="font-medium">Credential:</span> {sel.auth === 'apikey' ? `API key ending ${key.slice(-4)} → Key vault` : 'OAuth token → Key vault'}</li>
                <li><span className="font-medium">Environments:</span> {envs.join(', ')}</li>
                {sel.category === 'AI models' && <li><span className="font-medium">Spend cap:</span> ${Number(cap).toLocaleString()} / month</li>}
                <li><span className="font-medium">Feeds:</span> {sel.feeds.join(' · ')}</li>
              </ul>
              {sel.category === 'AI models' && <Callout tone="warn" title="Before customers use it">Add a rate card in Usage › Rate catalogue so every call is costed; otherwise usage lands in the Unrated queue.</Callout>}
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium">Reason (recorded in audit trail)</span>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="rounded border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="e.g. Add OpenRouter as low-cost route for Starter plan" />
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 border-t px-5 py-3">
          <Button variant="ghost" onClick={() => (step === 0 || (preset && step === 1) ? onClose() : setStep(step - 1))}>{step === 0 || (preset && step === 1) ? 'Cancel' : 'Back'}</Button>
          {step < 4 ? (
            <Button disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button disabled={!canNext || !sel} onClick={() => sel && onSave(sel, envs, reason, sel.auth === 'apikey' ? key.slice(-4) : undefined)}>Save &amp; connect</Button>
          )}
        </div>
      </div>
    </div>
  )
}
