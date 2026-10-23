import { KeyRound, RotateCw } from 'lucide-react'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function KeysSection() {
  return (
    <Panel title="API keys & service accounts" features={['SA16.01', 'SA16.03']} description="Keys are shown once at creation. Each key is scoped to one company and one environment.">
      <StateFrame features={['SA16.01']} cap="view.security" emptyTitle="No keys for this scope">
        <DataTable dense columns={[{ key: 'k', label: 'Key', mono: true }, { key: 'co', label: 'Company', mono: true }, { key: 'env', label: 'Env' }, { key: 'sc', label: 'Scopes' }, { key: 'last', label: 'Last used' }, { key: 'rl', label: 'Rate limit' }, { key: 'a', label: '' }]} rows={[
          { k: 'sk_live_…a91c', co: 'CO-10482', env: <Badge tone="bad">live</Badge>, sc: 'tasks:write · usage:read', last: '10:41 · 34.x.x.x', rl: '300 rpm', a: <ActionButton label="Rotate" cap="act.security" size="xs" icon={<RotateCw />} dialog={{ title: 'Rotate sk_live_…a91c', feature: 'SA16.01', impact: ['New key shown once', 'Old key valid for 24 h overlap (configurable)'] }} /> },
          { k: 'sk_test_…0c3d', co: 'CO-10482', env: <Badge tone="outline">test</Badge>, sc: 'tasks:write', last: '22 Oct', rl: '60 rpm', a: null },
          { k: 'sk_live_…77e0', co: 'CO-10601', env: <Badge tone="bad">live</Badge>, sc: 'tasks:write', last: '09:10 · 7 countries', rl: '300 rpm', a: <ActionButton label="Revoke" cap="act.security" size="xs" variant="destructive" icon={<KeyRound />} dialog={{ title: 'Revoke sk_live_…77e0', feature: 'SA16.01', destructive: true, impact: ['Immediate 401 for all requests', 'Linked to abuse signal INC-0918'] }} /> },
        ]} />
      </StateFrame>
    </Panel>
  )
}

export function WebhooksSection() {
  return (
    <Panel title="Outbound webhooks" features={['SA16.02']} description="Signed, retried with backoff, replayable. Delivery failures never block the source action.">
      <StateFrame features={['SA16.02']} cap="view.usage" emptyTitle="No endpoints configured">
        <DataTable dense columns={[{ key: 'e', label: 'Endpoint' }, { key: 'co', label: 'Company', mono: true }, { key: 'ev', label: 'Events' }, { key: 'sr', label: 'Success (7 d)', align: 'right' }, { key: 's', label: 'Status' }]} rows={[
          { e: 'https://hooks.northwind.example/ll', co: 'CO-10482', ev: 'task.completed · credits.low', sr: '99.7%', s: <Badge tone="good">Healthy</Badge> },
          { e: 'https://api.atlas.example/events', co: 'CO-10233', ev: 'task.completed', sr: '61.2%', s: <Badge tone="bad">Disabled after 72 h failures</Badge> },
        ]} />
        <div className="mt-3"><KV cols={3} items={[['Retry schedule', '1 m · 5 m · 30 m · 2 h · 12 h'], ['Signature', 'HMAC-SHA256 + timestamp'], ['Replay window', '7 days']]} /></div>
      </StateFrame>
    </Panel>
  )
}

export function EnvironmentsSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Environment separation" features={['SA16.03']} className="col-span-2">
        <StateFrame features={['SA16.03']} cap="view.usage">
          <DataTable dense columns={[{ key: 'e', label: 'Environment' }, { key: 'p', label: 'Payments' }, { key: 'w', label: 'Wallets' }, { key: 'c', label: 'Counted in COGS' }, { key: 'k', label: 'Key prefix', mono: true }]} rows={[
            { e: 'Production', p: 'Live mode', w: 'Real', c: 'Yes', k: 'sk_live_' },
            { e: 'Staging', p: 'Test mode', w: 'Isolated copy', c: 'No', k: 'sk_test_' },
            { e: 'Development', p: 'None', w: 'Synthetic', c: 'No', k: 'sk_dev_' },
            { e: 'Evaluation', p: 'None', w: 'Internal budget', c: <span>No · shown as R&amp;D</span>, k: 'sk_eval_' },
          ]} />
        </StateFrame>
      </Panel>
      <Callout tone="info" title="Environment switcher">The header switcher changes the banner and data scope. A test key can never move a production wallet (enforced server-side · G02).</Callout>
    </div>
  )
}

export function ByokSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Bring-your-own-key" features={['SA16.04', 'SA10.02']} className="col-span-2" description="Conditional feature. Customer-paid usage is shown as estimated external spend, not platform cost.">
        <StateFrame features={['SA16.04']} cap="view.security" emptyTitle="No BYOK companies" emptyHint="Feature flag is off (D16 assumption).">
          <div className="grid grid-cols-3 gap-3">
            <Field label="BYOK availability"><select className={inputCls}><option>Deferred (flag off)</option><option>Enterprise only</option><option>All paid plans</option></select></Field>
            <Field label="On customer key failure"><select className={inputCls}><option>Fail task · notify (no silent fallback)</option><option>Fallback to platform key with consent</option></select></Field>
            <Field label="Platform fee on BYOK"><input className={inputCls} defaultValue="Per contract" /></Field>
          </div>
          <div className="mt-4">
            <DataTable dense columns={[{ key: 'co', label: 'Company' }, { key: 'p', label: 'Provider' }, { key: 'h', label: 'Key health' }, { key: 'sp', label: 'External spend (30 d)', align: 'right' }]} rows={[
              { co: 'CO-10019 · Halcyon (pilot sample)', p: 'Provider A', h: <Badge tone="good">Valid · last check 10:00</Badge>, sp: <Prov kind="estimated" label="≈ $8,140" /> },
            ]} />
          </div>
        </StateFrame>
      </Panel>
      <Assumption decision="D16">BYOK deferred; screens designed so the decision can be enabled without redesign.</Assumption>
    </div>
  )
}
