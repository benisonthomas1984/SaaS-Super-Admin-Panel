'use client'

import { useState } from 'react'
import { Copy, Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/components/admin/admin-context'
import { ActionButton, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Callout, DataTable, Field, Panel, inputCls } from '@/components/admin/ui'
import { can } from '@/lib/rbac'
import { useProducts } from './products-context'

export function PackagesSection({ productId }: { productId: string }) {
  const { get, addPackage } = useProducts()
  const { role, record } = useAdmin()
  const product = get(productId)
  const [form, setForm] = useState({ name: '', slug: '', monthly: '', annual: '', credits: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  if (!product) return null
  const allowed = can(role, 'act.pricing')

  return (
    <div className="flex flex-col gap-5">
      <Panel title={`Packages in ${product.name}`} features={['MP02']} description="Any number of packages per product. Names may repeat across products; slugs are unique inside this product.">
        <StateFrame features={['MP02']} cap="view.customer" emptyTitle="This product has no packages yet" emptyHint="Add the first package below. Customers cannot subscribe until a package version is published.">
          {product.packages.length === 0 ? (
            <p className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No packages yet. Add one below.</p>
          ) : (
            <DataTable columns={[
              { key: 'n', label: 'Package' }, { key: 'id', label: 'package_id', mono: true }, { key: 'st', label: 'Status' }, { key: 'v', label: 'Current version' },
              { key: 'm', label: 'Monthly', align: 'right' }, { key: 'a', label: 'Annual', align: 'right' }, { key: 's', label: 'Subscribers', align: 'right' }, { key: 'x', label: '' },
            ]} rows={product.packages.map((p) => ({
              n: <span className="font-medium">{p.name} <span className="font-mono text-xs text-muted-foreground">/{p.slug}</span></span>,
              id: p.id,
              st: <Badge tone={p.status === 'active' ? 'good' : p.status === 'draft' ? 'warn' : 'neutral'}>{p.status}</Badge>,
              v: p.currentVersion, m: p.monthly, a: p.annual, s: p.subscribers.toString(),
              x: (
                <div className="flex gap-1.5">
                  <ActionButton size="xs" label="Duplicate" cap="act.pricing" icon={<Copy />} dialog={{ title: `Duplicate ${p.name} as new draft`, feature: 'MP02', impact: ['Creates a new draft package in this product only', 'Original package and its subscribers are untouched'] }} />
                  <ActionButton size="xs" label="Archive" cap="act.pricing" dialog={{ title: `Archive ${p.name}`, feature: 'MP02', destructive: true, impact: ['Stops new sales of this package', `${p.subscribers} existing subscribers keep their terms`] }} />
                </div>
              ),
            }))} />
          )}
        </StateFrame>
      </Panel>

      <Panel title="Add package · POST /admin/products/{product_id}/packages" features={['MP02']} description={`Parent is taken from the path: ${product.id}. A package cannot be created before its product exists.`}>
        <form className="flex flex-col gap-3" onSubmit={(e) => {
          e.preventDefault()
          const res = addPackage(product.id, form)
          if (res.ok) {
            record({ action: 'package.create', target: `${product.id}/${res.id}`, reason: `Draft package ${form.name}` })
            setMsg({ ok: true, text: `Created ${res.id} as draft v1 under ${product.name}.` })
            setForm({ name: '', slug: '', monthly: '', annual: '', credits: '' })
          } else setMsg({ ok: false, text: res.error })
        }}>
          <div className="grid grid-cols-5 gap-3">
            <Field label="Name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Starter" /></Field>
            <Field label="Slug"><input required className={inputCls + ' font-mono'} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Monthly price"><input className={inputCls} value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} placeholder="$29 / seat" /></Field>
            <Field label="Annual price"><input className={inputCls} value={form.annual} onChange={(e) => setForm({ ...form, annual: e.target.value })} placeholder="$290 / seat" /></Field>
            <Field label={`Included ${product.creditUnit}s`}><input className={inputCls} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="20,000" /></Field>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={!allowed || !form.name || !form.slug}><Plus /> Save draft package</Button>
            {!allowed && <span className="text-xs text-muted-foreground">Requires pricing permission (Owner, Finance).</span>}
          </div>
          {msg && <Callout tone={msg.ok ? 'info' : 'bad'} title={msg.ok ? 'Saved' : 'Rejected by server'}>{msg.text}</Callout>}
        </form>
      </Panel>
    </div>
  )
}

export function BuilderSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  const [hardCap, setHardCap] = useState(true)
  if (!product) return null
  const pkg = product.packages[1] ?? product.packages[0]
  const telemetry = product.execution === 'telemetry_only'

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">{product.name} › {pkg ? `${pkg.name} › draft ${pkg.versions.find((v) => v.status === 'draft')?.label ?? 'new version'}` : 'no package'}</p>
      {!pkg ? (
        <Callout tone="info" title="No package to edit">Add a package first in the Packages tab.</Callout>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-5">
            <Panel title="Features and limits" features={['MP05']} className="col-span-2" description="Feature keys are scoped to this product. A limit left blank is a validation error, not unlimited.">
              <DataTable dense columns={[{ key: 'k', label: 'Feature key', mono: true }, { key: 't', label: 'Type' }, { key: 'v', label: 'Value' }, { key: 'n', label: 'Note' }]} rows={[
                { k: 'doc.summarize', t: 'Boolean', v: <Badge tone="good">Enabled</Badge>, n: '' },
                { k: 'doc.batch_extract', t: 'Boolean', v: <Badge tone="good">Enabled</Badge>, n: 'Pro-only — Starter calls are denied server-side' },
                { k: 'seats.max', t: 'Count', v: '25', n: '' },
                { k: 'storage.gb', t: 'Quantity', v: '50 GB', n: '' },
                { k: 'models.allowlist', t: 'Enum', v: 'small, mid', n: '' },
                { k: 'audio.transcribe', t: 'Count', v: <span className="text-destructive">missing</span>, n: 'Blocks publish: omitted ≠ unlimited' },
              ]} />
            </Panel>
            <Panel title="Meters and units" features={['MP06']}>
              <DataTable dense columns={[{ key: 'm', label: 'Meter' }, { key: 'u', label: 'Unit' }, { key: 'a', label: 'Aggregation' }]} rows={[
                { m: 'model.input', u: '1K tokens', a: 'sum' },
                { m: 'model.cached_input', u: '1K tokens', a: 'subset of input' },
                { m: 'model.output', u: '1K tokens', a: 'sum' },
                { m: 'ocr.pages', u: 'page', a: 'sum' },
                { m: 'audio.seconds', u: 'second', a: 'sum · unrated' },
              ]} />
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Cached input is part of input, never added on top — prevents double charging.</p>
            </Panel>
          </div>

          <Panel title="Prices and credit rules" features={['MP04']} description="Every change creates a new effective-dated price record. Historical prices are never overwritten.">
            <div className="grid grid-cols-4 gap-3">
              <Field label="Currency"><select className={inputCls}><option>USD</option><option>EUR</option></select></Field>
              <Field label="Monthly variant"><input className={inputCls} defaultValue={pkg.monthly} /></Field>
              <Field label="Annual variant" hint="Cash received ≠ annual profit"><input className={inputCls} defaultValue={pkg.annual} /></Field>
              <Field label={`Included ${product.creditUnit}s / month`}><input className={inputCls} defaultValue={pkg.versions[0]?.credits} /></Field>
              <Field label="Overage"><select className={inputCls}><option>Stop at zero (D04)</option><option>Bill at $0.002 / credit</option></select></Field>
              <Field label="Trial"><select className={inputCls}><option>14 days · 2,000 credits</option><option>None</option></select></Field>
              <Field label="Rounding"><select className={inputCls}><option>Once at task settlement (D02)</option><option>Per operation</option></select></Field>
              <Field label="Billing provider price ref"><input className={inputCls + ' font-mono'} placeholder="price_… (mapped, not entered here)" /></Field>
            </div>
            <div className="mt-4 rounded border bg-muted/40 p-3 text-sm">
              <p className="font-medium">Charge preview — sample operation</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">12K input (4K cached) + 3K output tokens, 2 OCR pages → 12 × 0.12 + 3 × 0.48 + 2 × 2.00 = <span className="font-mono text-foreground">6.88 {product.creditUnit}s</span> under this draft. Provider cost is shown separately and never on the customer charge.</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hardCap} onChange={(e) => setHardCap(e.target.checked)} /> Paid hard-cap package
              </label>
              {telemetry && hardCap && <Badge tone="bad">Blocked: telemetry-only product cannot enforce a hard cap (PC04)</Badge>}
            </div>
            <div className="mt-4 flex gap-2">
              <ActionButton label="Validate draft" cap="act.pricing" dialog={{ title: 'Validate draft version', feature: 'MP03', impact: ['1 error: audio.transcribe limit missing', '1 warning: meter audio.seconds has no sell rate', 'Publish stays disabled until errors are fixed'] }} />
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}

export function VersionsSection({ productId }: { productId: string }) {
  const { get } = useProducts()
  const product = get(productId)
  if (!product) return null
  const pkg = product.packages.find((p) => p.versions.some((v) => v.status === 'draft')) ?? product.packages[0]

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Version history" features={['MP03']} description="A version with subscribers is immutable. Publishing does not migrate anyone.">
        <StateFrame features={['MP03']} cap="view.customer" emptyTitle="No versions">
          <DataTable columns={[{ key: 'p', label: 'Package' }, { key: 'v', label: 'Version' }, { key: 's', label: 'Status' }, { key: 'e', label: 'Effective from' }, { key: 'c', label: 'Included credits', align: 'right' }, { key: 'n', label: 'Subscribers', align: 'right' }]}
            rows={product.packages.flatMap((p) => p.versions.map((v) => ({
              p: p.name, v: v.label,
              s: <Badge tone={v.status === 'published' ? 'good' : v.status === 'draft' ? 'warn' : 'neutral'}>{v.status === 'published' && v.subscribers > 0 ? 'published · locked' : v.status}</Badge>,
              e: v.effectiveFrom, c: v.credits, n: v.subscribers.toString(),
            })))} />
        </StateFrame>
      </Panel>
      {pkg && (
        <div className="grid grid-cols-2 gap-5">
          <Panel title={`Publish ${pkg.name} next version`} features={['MP03', 'MP04']}>
            <DataTable dense columns={[{ key: 'f', label: 'Field' }, { key: 'o', label: 'Current' }, { key: 'n', label: 'Draft' }]} rows={[
              { f: 'Included credits', o: pkg.versions[0]?.credits ?? '—', n: pkg.versions.find((v) => v.status === 'draft')?.credits ?? '—' },
              { f: 'Monthly price', o: pkg.monthly, n: pkg.monthly },
              { f: 'doc.batch_extract', o: 'Enabled', n: 'Enabled' },
            ]} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Effective from"><input className={inputCls} defaultValue="2026-11-01 00:00 UTC" /></Field>
              <Field label="Applies to"><select className={inputCls}><option>New subscriptions only</option></select></Field>
            </div>
            <div className="mt-3">
              <ActionButton label="Publish version" cap="act.pricing" variant="default" icon={<Send />} dialog={{ title: `Publish ${pkg.name} new version`, feature: 'MP03', impact: ['New sales use the new version from the effective date', `${pkg.subscribers} current subscribers stay pinned to their version`, 'Late usage is rated on the version in effect when it occurred', 'Signed package.updated event sent to the app'] }} />
            </div>
          </Panel>
          <Panel title="Schedule subscriber migration" features={['MP03', 'MP10']} description="A separate, explicit step after publishing.">
            <div className="grid grid-cols-2 gap-3">
              <Field label="From version"><select className={inputCls}>{pkg.versions.map((v) => <option key={v.id}>{v.label}</option>)}</select></Field>
              <Field label="When"><select className={inputCls}><option>At each subscriber&apos;s next renewal</option><option>On a fixed date</option></select></Field>
            </div>
            <Callout tone="warn" title="Smaller allowance">Subscribers moving to a smaller allowance keep their current allowance until the migration date (D07).</Callout>
            <div className="mt-3">
              <ActionButton label="Schedule migration" cap="act.pricing" dialog={{ title: 'Schedule subscriber migration', feature: 'MP10', secondReview: true, impact: [`Up to ${pkg.subscribers} subscriptions change version at renewal`, 'Each customer is notified 30 days ahead (SA15.02)', 'Can be cancelled until it runs'] }} />
            </div>
            <div className="mt-3"><Assumption decision="D07">Upgrades are immediate and prorated; downgrades apply at next renewal.</Assumption></div>
          </Panel>
        </div>
      )}
    </div>
  )
}
