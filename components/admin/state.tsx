'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Inbox, Lock, RefreshCw, ServerCrash, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CAP_LABEL, ROLES, can, rolesWith, type Capability } from '@/lib/rbac'
import { useAdmin, type DemoState } from './admin-context'
import { Callout, FeatureTag } from './ui'

type FrameProps = {
  features: string[]
  cap?: Capability
  emptyTitle?: string
  emptyHint?: string
  incomplete?: string
  rows?: number
  children: React.ReactNode
  forceState?: DemoState | 'restricted'
}

export function StateFrame({ features, cap, emptyTitle = 'No records for this scope', emptyHint = 'Adjust filters or period. An empty result is not the same as a zero value.', incomplete, rows = 4, children, forceState }: FrameProps) {
  const { role, demoState, record } = useAdmin()
  const [retried, setRetried] = useState(false)
  const state: DemoState | 'restricted' = forceState ?? (cap && !can(role, cap) ? 'restricted' : retried ? 'live' : demoState)

  useEffect(() => setRetried(false), [demoState])

  if (state === 'restricted' && cap) {
    return (
      <div className="flex items-start gap-3 rounded border border-dashed bg-muted/40 p-4" role="status">
        <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">403 · Access denied by server</p>
          <p className="mt-0.5 leading-relaxed text-muted-foreground">
            {ROLES[role].label} cannot {CAP_LABEL[cap]}. Data was not sent to this browser — this is not merely hidden.
            Available to: {rolesWith(cap).join(', ') || 'no role'}.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => record({ action: 'access.request', target: features.join(','), reason: `Requested ${cap}` })}>
              Request scoped access
            </Button>
            <span className="flex gap-1">{['SA13.01', ...features].map((f) => <FeatureTag key={f} id={f} />)}</span>
          </div>
        </div>
      </div>
    )
  }
  if (state === 'restricted') {
    return (
      <div className="flex items-start gap-3 rounded border border-dashed bg-muted/40 p-4 text-sm" role="status">
        <Lock className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
        <p className="text-muted-foreground"><span className="font-semibold text-foreground">403 · Access denied by server.</span> Your role is not permitted to view this section.</p>
      </div>
    )
  }
  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading</span>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" style={{ width: `${100 - (i % 3) * 12}%` }} />
        ))}
      </div>
    )
  }
  if (state === 'empty') {
    return (
      <div className="flex flex-col items-center gap-1 rounded border border-dashed px-6 py-8 text-center" role="status">
        <Inbox className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="max-w-md text-pretty text-xs leading-relaxed text-muted-foreground">{emptyHint}</p>
      </div>
    )
  }
  if (state === 'error') {
    return (
      <div className="flex items-start gap-3 rounded border border-destructive/30 bg-destructive-soft p-4" role="alert">
        <ServerCrash className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-destructive">Could not load this section</p>
          <p className="mt-0.5 leading-relaxed text-muted-foreground">
            Request <span className="font-mono text-xs">req_7f3a91c2</span> failed (upstream timeout). Previously loaded figures are not reused as current values.
          </p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => setRetried(true)}>
            <RefreshCw /> Retry
          </Button>
        </div>
      </div>
    )
  }
  if (state === 'incomplete') {
    return (
      <div className="flex flex-col gap-3">
        <Callout title="Incomplete data — figures below are provisional">
          {incomplete ?? 'One or more source feeds are missing or delayed for this scope. Affected values are labelled Incomplete; missing values are never shown as zero.'}
        </Callout>
        {children}
      </div>
    )
  }
  return <>{children}</>
}

export function Gate({ cap, children, className }: { cap: Capability; children: React.ReactNode; className?: string }) {
  const { role } = useAdmin()
  if (can(role, cap)) return <>{children}</>
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-px text-[11px] text-muted-foreground', className)} title={`Restricted: requires ${CAP_LABEL[cap]}`}>
      <Lock className="size-3" aria-hidden /> Restricted
    </span>
  )
}

type DialogSpec = {
  title: string
  feature: string
  impact: string[]
  uncertain?: string
  confirmText?: string
  secondReview?: boolean
  fields?: React.ReactNode
  confirmLabel?: string
  destructive?: boolean
}

export function ActionButton({ label, cap, dialog, variant = 'outline', size = 'sm', icon }: {
  label: string
  cap: Capability
  dialog: DialogSpec
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  size?: 'sm' | 'xs' | 'default'
  icon?: React.ReactNode
}) {
  const { role, record } = useAdmin()
  const allowed = can(role, cap)
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size={size}
        variant={variant}
        disabled={!allowed}
        title={allowed ? undefined : `Server will deny: requires ${CAP_LABEL[cap]} (${rolesWith(cap).join(', ')})`}
        onClick={() => { setResult(null); setOpen(true) }}
      >
        {allowed ? icon : <Lock />}
        {label}
      </Button>
      {result && (
        <span className="inline-flex items-center gap-1 text-[11px] text-primary" role="status">
          <CheckCircle2 className="size-3" /> {result}
        </span>
      )}
      {open && (
        <ConfirmDialog
          spec={dialog}
          onClose={() => setOpen(false)}
          onConfirm={(reason) => {
            const id = record({ action: `${dialog.feature}:${label}`, target: dialog.title, reason })
            setResult(dialog.secondReview ? `Awaiting second reviewer · ${id}` : `Queued · ${id}`)
            setOpen(false)
          }}
        />
      )}
    </span>
  )
}

function ConfirmDialog({ spec, onClose, onConfirm }: { spec: DialogSpec; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [typed, setTyped] = useState('')
  const titleId = useId()
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canConfirm = reason.trim().length >= 8 && (!spec.confirmText || typed === spec.confirmText)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-md border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-3">
          <div>
            <FeatureTag id={spec.feature} />
            <h2 id={titleId} className="mt-1 text-base font-semibold">{spec.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close dialog"><X className="size-4" /></button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Impact preview</p>
            <ul className="flex flex-col gap-1">
              {spec.impact.map((i) => (
                <li key={i} className="flex gap-2 leading-relaxed"><span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" aria-hidden />{i}</li>
              ))}
            </ul>
          </div>
          {spec.uncertain && <Callout title="Outcome uncertainty">{spec.uncertain}</Callout>}
          {spec.fields}
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Reason (required, recorded in audit trail · SA13.02)</span>
            <textarea ref={ref} value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="rounded border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Incident INC-2291 — runaway extraction agent" />
            <span className="text-[11px] text-muted-foreground">Minimum 8 characters.</span>
          </label>
          {spec.confirmText && (
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium">Type <span className="font-mono">{spec.confirmText}</span> to confirm</span>
              <input value={typed} onChange={(e) => setTyped(e.target.value)} className="h-8 rounded border border-input bg-background px-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
          )}
          {spec.secondReview && (
            <p className="rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
              Above the second-review threshold (D14). Change stays <span className="font-medium text-foreground">pending</span> until a different authorized administrator approves.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={spec.destructive ? 'destructive' : 'default'} disabled={!canConfirm} onClick={() => onConfirm(reason)}>
            {spec.confirmLabel ?? (spec.secondReview ? 'Submit for review' : 'Confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
