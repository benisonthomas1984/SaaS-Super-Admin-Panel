import { Send } from 'lucide-react'
import { CreatePlanButton } from './plan-builder'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, KV, Panel, Prov, inputCls } from '@/components/admin/ui'

export function CatalogueSection() {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Plan catalogue" features={['SA05.01']} description="Plans are versioned. Existing customers stay on their version unless a migration is explicitly scheduled." actions={<CreatePlanButton />}>
        <StateFrame features={['SA05.01']} cap="view.customer">
          <DataTable columns={[{ key: 'p', label: 'Plan' }, { key: 'v', label: 'Version' }, { key: 'st', label: 'Status' }, { key: 'price', label: 'Price', align: 'right' }, { key: 'cr', label: 'Included credits', align: 'right' }, { key: 'seat', label: 'Seats', align: 'right' }, { key: 'feat', label: 'Features · models' }, { key: 'subs', label: 'Companies', align: 'right' }]} rows={[
            { p: 'Starter', v: 'v4', st: <Badge tone="good">Published</Badge>, price: '$29 / seat', cr: '20,000', seat: '1–5', feat: 'Doc agent · small models', subs: '188' },
            { p: 'Growth', v: 'v3', st: <Badge tone="good">Published</Badge>, price: '$80 / seat', cr: '120,000', seat: '5–25', feat: '+ Support copilot · mid models', subs: '142' },
            { p: 'Growth', v: 'v2', st: <Badge tone="outline">Legacy · not sellable</Badge>, price: '$72 / seat', cr: '100,000', seat: '5–25', feat: 'Doc agent · mid models', subs: '31' },
            { p: 'Scale', v: 'v3', st: <Badge tone="good">Published</Badge>, price: '$96 / seat', cr: '500,000', seat: '20–100', feat: '+ Extraction API · large models', subs: '47' },
            { p: 'Scale', v: 'v4', st: <Badge tone="warn">Draft</Badge>, price: '$99 / seat', cr: '550,000', seat: '20–100', feat: '+ BYOK (flag)', subs: '0' },
            { p: 'Enterprise', v: 'contract', st: <Badge tone="neutral">Contract-only</Badge>, price: 'Custom', cr: 'Per contract', seat: 'Custom', feat: 'All', subs: '4' },
          ]} />
        </StateFrame>
      </Panel>
      <div className="grid grid-cols-3 gap-5">
        <Panel title="Publish Scale v4" features={['SA05.01', 'SA14.04']} className="col-span-2" description="Draft → preview → publish. Staged cohort rollout is P1 (SA14.04) — see contradiction C03.">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Effective from"><input className={inputCls} defaultValue="2026-11-01 00:00 UTC" /></Field>
            <Field label="Eligibility"><select className={inputCls}><option>New customers only</option><option>New + opt-in upgrades</option></select></Field>
            <Field label="Existing Scale v3 customers"><select className={inputCls}><option>Stay on v3 (no migration)</option><option>Migrate at next renewal</option></select></Field>
            <Field label="Rollout cohort" hint="P1 · SA14.04"><select className={inputCls} disabled><option>All eligible (P0 behaviour)</option></select></Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ActionButton label="Preview & publish" cap="act.pricing" variant="default" icon={<Send />} dialog={{ title: 'Publish Scale v4', feature: 'SA05.01', impact: ['0 existing companies change price', 'New signups from 1 Nov see Scale v4', 'Scale v3 remains for 47 companies', 'Price +$3/seat, credits +50,000'] }} />
            <span className="text-xs text-muted-foreground">Last edit: A. Rivera · 22 Oct · diff vs v3: 3 fields</span>
          </div>
        </Panel>
        <Panel title="Customer overrides" features={['SA05.01']}>
          <ul className="flex flex-col gap-2 text-xs">
            <li className="rounded border p-2"><p className="font-medium">CO-10482 · +20% storage quota</p><p className="text-muted-foreground">Reason: migration buffer · expires 31 Dec · J. Brandt</p></li>
            <li className="rounded border p-2"><p className="font-medium">CO-10019 · prov-a/text-large enabled</p><p className="text-muted-foreground">Contract C-221 · no expiry</p></li>
          </ul>
        </Panel>
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Sell-rate policy · sr_2026_07" features={['SA05.02']} className="col-span-2" description="Customer-facing credit rates. Separate from provider cost rates (SA03.02).">
        <StateFrame features={['SA05.02']} cap="view.customer">
          <DataTable dense columns={[{ key: 'r', label: 'Resource' }, { key: 'u', label: 'Unit' }, { key: 'c', label: 'Credits', align: 'right' }, { key: 'm', label: 'Min charge', align: 'right' }]} rows={[
            { r: 'Large model · input', u: '1K tokens', c: '0.40', m: '—' },
            { r: 'Large model · output', u: '1K tokens', c: '1.60', m: '—' },
            { r: 'Mid model · input / output', u: '1K tokens', c: '0.12 / 0.48', m: '—' },
            { r: 'Web fetch tool', u: 'call', c: '0.50', m: '—' },
            { r: 'OCR', u: 'page', c: '2.00', m: '1 page' },
            { r: 'Document agent task', u: 'task', c: 'sum of resources', m: '5 cr' },
          ]} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Field label="Precision"><select className={inputCls}><option>0.01 credit</option><option>1 credit</option></select></Field>
            <Field label="Rounding stage"><select className={inputCls}><option>Once at task settlement</option><option>Per operation</option><option>At invoice aggregation</option></select></Field>
            <Field label="Rounding mode"><select className={inputCls}><option>Half-up</option><option>Ceiling</option></select></Field>
          </div>
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Sample task preview" features={['SA05.02', 'SA15.03']}>
          <KV cols={2} items={[['Input', '8,210 tok × 0.40'], ['Output', '2,311 tok × 1.60'], ['Tools', '3 × 0.50'], ['Raw', '7.4818 cr'], ['Rounded', <span key="r" className="font-semibold">7.48 cr</span>], ['Shown to customer', '7.48 cr']]} />
          <p className="mt-2 text-[11px] text-muted-foreground">Same value appears in usage history, invoice and wallet (customer-facing views not designed — gap G01).</p>
        </Panel>
        <Assumption decision="D02">Round once at task settlement to 0.01 credit, half-up.</Assumption>
      </div>
    </div>
  )
}

export function OffersSection() {
  return (
    <div className="grid grid-cols-2 gap-5">
      <Panel title="Trials & promotions" features={['SA05.03']}>
        <StateFrame features={['SA05.03']} cap="view.customer" emptyTitle="No active offers">
          <DataTable dense columns={[{ key: 'o', label: 'Offer' }, { key: 'e', label: 'Eligibility' }, { key: 'l', label: 'Limits' }, { key: 'x', label: 'Expiry' }, { key: 'st', label: 'Status' }]} rows={[
            { o: '14-day trial', e: 'New companies · verified domain', l: '10,000 cr · 3 seats', x: '14 d from signup', st: <Badge tone="good">Active</Badge> },
            { o: 'LAUNCH25 coupon', e: 'Growth, Scale', l: '25% off 3 months · 500 uses', x: '31 Dec 2026', st: <Badge tone="good">412 / 500 used</Badge> },
            { o: 'Partner credits', e: 'Partner-referred', l: '+10,000 cr once', x: '90 d', st: <Badge tone="outline">Paused</Badge> },
          ]} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Coupon stacking" hint="Not specified in source — configurable"><select className={inputCls}><option>No stacking (best single offer)</option><option>Stack coupon + trial</option></select></Field>
            <Field label="Trial cost tagging"><select className={inputCls} disabled><option>Tag as acquisition / trial cost (SA08.02)</option></select></Field>
          </div>
        </StateFrame>
      </Panel>
      <Panel title="Enterprise contracts" features={['SA05.03']}>
        <StateFrame features={['SA05.03']} cap="view.finance">
          <DataTable dense columns={[{ key: 'c', label: 'Contract' }, { key: 'co', label: 'Company' }, { key: 't', label: 'Terms' }, { key: 'p', label: 'Precedence' }]} rows={[
            { c: 'C-221', co: 'CO-10019 Halcyon Legal', t: '$21,500/mo · 1.2M cr · annual commit', p: 'Contract > plan > promotion' },
            { c: 'C-238', co: 'CO-10702 Tidewater', t: '$14,200/mo · 640K cr · EU region', p: 'Contract > plan > promotion' },
          ]} />
          <div className="mt-3"><Assumption decision="D07">Conflict precedence: contract terms override plan; promotions apply only where the contract permits.</Assumption></div>
        </StateFrame>
      </Panel>
    </div>
  )
}

export function ChangesSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Subscription change preview · CO-10482" features={['SA05.04']} className="col-span-2" description="Scale v3 → Enterprise (C-draft-251) · requested by M. Okafor">
        <StateFrame features={['SA05.04']} cap="view.customer">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Change type"><select className={inputCls}><option>Upgrade</option><option>Downgrade</option><option>Cancellation</option><option>Pause</option><option>Reactivation</option></select></Field>
            <Field label="Timing"><select className={inputCls}><option>Immediate (prorated)</option><option>Next billing cycle (1 Nov)</option></select></Field>
          </div>
          <div className="mt-4">
            <DataTable dense columns={[{ key: 'k', label: 'Effect' }, { key: 'b', label: 'Before' }, { key: 'a', label: 'After' }]} rows={[
              { k: 'Price', b: '$4,800 / mo', a: '$6,200 / mo' },
              { k: 'Proration (8 days)', b: '—', a: <span className="italic">≈ $361.29 charged now <Prov kind="estimated" /></span> },
              { k: 'Included credits', b: '500,000 (178,280 left)', a: '750,000 — reset on change' },
              { k: 'Seats', b: '50 paid', a: '75 paid' },
              { k: 'Access timing', b: '—', a: 'After payment succeeds (SA06.02)' },
            ]} />
          </div>
          <div className="mt-3"><Callout title="Downgrade conflict check">A downgrade to Growth v3 would exceed seats (46 &gt; 25) and storage (412 GB &gt; 100 GB). The server blocks it until resolved.</Callout></div>
          <div className="mt-4 flex justify-end">
            <ActionButton label="Confirm change" cap="act.support" variant="default" dialog={{ title: 'Confirm subscription upgrade', feature: 'SA05.04', impact: ['Charges ≈ $361.29 proration now', 'Enterprise entitlements activate after payment success', 'Included credit reset: unused 178,280 expire (D06)'] }} />
          </div>
        </StateFrame>
      </Panel>
      <Assumption decision="D07">Upgrades are immediate and prorated; downgrades take effect next cycle. Credit allowance resets on immediate change.</Assumption>
    </div>
  )
}
