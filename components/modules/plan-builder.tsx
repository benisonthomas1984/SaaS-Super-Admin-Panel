'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { can } from '@/lib/rbac'
import { useAdmin } from '@/components/admin/admin-context'
import { Assumption, Callout, Field, inputCls } from '@/components/admin/ui'

const STEPS = ['Basics', 'Price', 'Credits & limits', 'What it includes', 'Review']
const MODELS = ['Small text models', 'Mid text models', 'Large text models', 'Vision models', 'Embeddings']
const AGENTS = ['Document agent', 'Support copilot', 'Extraction API', 'Bring your own key (BYOK)']

export function CreatePlanButton() {
  const { role, record } = useAdmin()
  const allowed = can(role, 'act.pricing')
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  return (
    <span className="inline-flex items-center gap-2">
      <Button size="sm" disabled={!allowed} title={allowed ? undefined : 'Requires Finance administrator or Owner'} onClick={() => { setDone(null); setOpen(true) }}><Plus /> Create plan</Button>
      {done && <span className="text-[11px] text-primary" role="status">Saved as draft · {done}</span>}
      {open && <Builder onClose={() => setOpen(false)} onSave={(name) => { setDone(record({ action: 'SA05.01:Create plan draft', target: name, reason: 'New plan draft' })); setOpen(false) }} />}
    </span>
  )
}

function Builder({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [billing, setBilling] = useState<'seat' | 'flat' | 'usage'>('seat')
  const [price, setPrice] = useState('49')
  const [credits, setCredits] = useState('60000')
  const [overage, setOverage] = useState<'block' | 'charge' | 'warn'>('block')
  const [models, setModels] = useState<string[]>(['Small text models', 'Mid text models'])
  const [agents, setAgents] = useState<string[]>(['Document agent'])

  const blendedCost = models.includes('Large text models') ? 0.00062 : models.includes('Mid text models') ? 0.00031 : 0.00012
  const costAtFullUse = Number(credits) * blendedCost
  const margin = Number(price) > 0 ? ((Number(price) - costAtFullUse) / Number(price)) * 100 : 0
  const canNext = [name.trim().length >= 2, Number(price) >= 0, Number(credits) > 0, models.length > 0, true][step]

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6">
      <div role="dialog" aria-modal="true" aria-label="Create plan" className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-md border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-3">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">SA05.01 · SA05.02</p>
            <h2 className="text-base font-semibold">Create a new plan{name ? `: ${name}` : ''}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close"><X className="size-4" /></button>
        </div>
        <ol className="flex gap-1 border-b px-5 py-2.5 text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('flex flex-1 items-center gap-1.5', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
              <span className={cn('flex size-5 items-center justify-center rounded-full text-[10px] font-semibold', i < step ? 'bg-primary text-primary-foreground' : i === step ? 'border-2 border-primary text-primary' : 'border')}>{i + 1}</span>{s}
            </li>
          ))}
        </ol>
        <div className="flex min-h-72 flex-col gap-4 overflow-y-auto px-5 py-4 text-sm">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Plan name" hint="What customers see, e.g. “Team”"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Team" /></Field>
              <Field label="Who can buy it"><select className={inputCls}><option>Anyone (self-serve)</option><option>Sales-assisted only</option><option>Hidden — by invite link</option></select></Field>
              <Field label="Free trial"><select className={inputCls}><option>None</option><option>14 days</option><option>30 days</option></select></Field>
              <Field label="Short description"><input className={inputCls} placeholder="For small teams starting with AI" /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-xs font-medium">How is it charged?</legend>
                {([['seat', 'Per user per month', 'Price grows with team size'], ['flat', 'Flat monthly fee', 'Same price for the whole company'], ['usage', 'Pay as you go', 'Only pay for credits used']] as const).map(([v, l, h]) => (
                  <label key={v} className={cn('flex cursor-pointer items-start gap-2 rounded border p-2.5', billing === v && 'border-primary bg-primary-soft')}>
                    <input type="radio" name="billing" checked={billing === v} onChange={() => setBilling(v)} className="mt-1 accent-[var(--primary)]" />
                    <span><span className="font-medium">{l}</span><span className="block text-xs text-muted-foreground">{h}</span></span>
                  </label>
                ))}
              </fieldset>
              <div className="grid grid-cols-2 gap-3">
                <Field label={billing === 'usage' ? 'Price per 1,000 credits (USD)' : `Price (USD) ${billing === 'seat' ? 'per seat' : ''} / month`}><input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={inputCls} /></Field>
                <Field label="Annual discount" hint="D05 — configurable"><select className={inputCls}><option>None</option><option>10%</option><option>20%</option></select></Field>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">Credits are the allowance customers spend when they use AI. One question, one document page, one agent step — each costs some credits.</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Included credits / month${billing === 'seat' ? ' per seat' : ''}`}><input value={credits} onChange={(e) => setCredits(e.target.value)} inputMode="numeric" className={inputCls} /></Field>
                <Field label="Unused credits at month end" hint="D06 — open decision"><select className={inputCls}><option>Expire (assumed)</option><option>Roll over 1 month</option><option>Roll over, capped</option></select></Field>
                <Field label="Storage limit"><select className={inputCls}><option>10 GB</option><option>50 GB</option><option>250 GB</option></select></Field>
                <Field label="Max requests per minute"><input className={inputCls} defaultValue="120" /></Field>
              </div>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1 text-xs font-medium">When credits run out</legend>
                {([['block', 'Pause AI until next month or a top-up'], ['charge', 'Keep working and bill the extra (overage)'], ['warn', 'Keep working, alert only (risky)']] as const).map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 text-sm"><input type="radio" name="overage" checked={overage === v} onChange={() => setOverage(v)} className="accent-[var(--primary)]" />{l}</label>
                ))}
              </fieldset>
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1 text-xs font-medium">AI models allowed</legend>
                {MODELS.map((m) => <label key={m} className="flex items-center gap-2"><input type="checkbox" checked={models.includes(m)} onChange={() => toggle(models, setModels, m)} className="accent-[var(--primary)]" />{m}</label>)}
              </fieldset>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1 text-xs font-medium">Agents & features</legend>
                {AGENTS.map((m) => <label key={m} className="flex items-center gap-2"><input type="checkbox" checked={agents.includes(m)} onChange={() => toggle(agents, setAgents, m)} className="accent-[var(--primary)]" />{m}</label>)}
              </fieldset>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-3">
              <ul className="flex flex-col gap-1 rounded border bg-muted/40 p-3 text-xs">
                <li><span className="font-medium">Plan:</span> {name} · v1 · Draft</li>
                <li><span className="font-medium">Price:</span> ${price} {billing === 'seat' ? 'per seat / month' : billing === 'flat' ? 'per month' : 'per 1,000 credits'}</li>
                <li><span className="font-medium">Credits:</span> {Number(credits).toLocaleString()} / month · when exhausted: {overage === 'block' ? 'pause' : overage === 'charge' ? 'bill overage' : 'alert only'}</li>
                <li><span className="font-medium">Includes:</span> {[...models, ...agents].join(', ')}</li>
              </ul>
              <div className={cn('rounded border p-3', margin < 40 ? 'border-warn/60 bg-warn-soft' : 'border-primary/30 bg-primary-soft')}>
                <p className="text-xs font-medium">Margin check <span className="font-normal text-muted-foreground">· Estimated, if a {billing === 'seat' ? 'seat' : 'customer'} uses every credit</span></p>
                <p className="mt-1 text-lg font-semibold tabular">{margin.toFixed(0)}% gross margin</p>
                <p className="text-xs text-muted-foreground">AI cost ≈ ${costAtFullUse.toFixed(2)} vs price ${price}. {margin < 40 ? 'Below the 40% target — consider fewer credits or cheaper models.' : 'Above the 40% target.'}</p>
              </div>
              <Assumption decision="D04">The 40% target margin and blended model cost are sample assumptions; real values come from the rate catalogue (SA03.02).</Assumption>
              <Callout tone="info" title="Nothing changes yet">Saving creates a <span className="font-medium">draft</span>. No customer sees it until you publish it from the catalogue with an effective date.</Callout>
            </div>
          )}
        </div>
        <div className="flex justify-between border-t px-5 py-3">
          <Button variant="ghost" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>{step === 0 ? 'Cancel' : 'Back'}</Button>
          {step < 4 ? <Button disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={() => onSave(name)}>Save draft</Button>}
        </div>
      </div>
    </div>
  )
}
