'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, CircleHelp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PAGE_GUIDES, type Help } from '@/lib/help'

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((l, i) => (
        <p key={i} className={cn(l.startsWith('•') && 'pl-2')}>{l}</p>
      ))}
    </>
  )
}

export function InfoTip({ help, label }: { help: Help; label: string }) {
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <span ref={wrap} className="relative inline-flex">
      <button
        type="button"
        aria-label={`What is ${label}?`}
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const r = e.currentTarget.getBoundingClientRect()
          setAlignRight(r.left > window.innerWidth - 400)
          setOpen((o) => !o)
        }}
        className={cn('inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', open && 'bg-primary-soft text-primary')}
      >
        <CircleHelp className="size-3.5" />
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={`About ${label}`}
          className={cn('absolute top-6 z-50 flex w-96 flex-col gap-2.5 rounded-md border bg-popover p-4 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-popover-foreground shadow-lg', alignRight ? 'right-0' : 'left-0')}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{label}</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded p-0.5 text-muted-foreground hover:bg-muted" aria-label="Close"><X className="size-3.5" /></button>
          </div>
          <div><p className="mb-0.5 font-semibold text-primary">What it is</p><Lines text={help.what} /></div>
          {help.how && <div><p className="mb-0.5 font-semibold text-primary">How it works</p><div className="flex flex-col gap-0.5 text-muted-foreground"><Lines text={help.how} /></div></div>}
          {help.actions && (
            <div>
              <p className="mb-0.5 font-semibold text-primary">What you can do</p>
              <ul className="flex flex-col gap-1 text-muted-foreground">
                {help.actions.map((a) => <li key={a} className="flex gap-1.5"><span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />{a}</li>)}
              </ul>
            </div>
          )}
          {help.example && <div className="rounded bg-muted px-2.5 py-1.5"><span className="font-semibold">Example: </span>{help.example}</div>}
          {help.watch && <div className="rounded border border-warn/40 bg-warn-soft px-2.5 py-1.5"><span className="font-semibold text-warn">Watch out: </span>{help.watch}</div>}
        </div>
      )}
    </span>
  )
}

function guideKey(pathname: string) {
  if (PAGE_GUIDES[pathname]) return pathname
  if (pathname.startsWith('/customers/')) return '/customers/[id]'
  if (pathname.startsWith('/settings')) return '/settings'
  return undefined
}

export function PageGuideButton() {
  const pathname = usePathname()
  const key = guideKey(pathname)
  const [open, setOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!key) return null
  const g = PAGE_GUIDES[key]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded border border-primary/30 bg-primary-soft px-2.5 text-xs font-medium text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BookOpen className="size-3.5" /> How this page works
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <aside role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex h-full w-full max-w-md flex-col border-l bg-card shadow-xl">
            <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary">Page guide</p>
                <h2 id={titleId} className="text-lg font-semibold">{g.title}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close guide"><X className="size-4" /></button>
            </header>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4 text-sm leading-relaxed">
              <div>
                <p className="font-medium">{g.summary}</p>
                <p className="mt-1 text-muted-foreground">{g.why}</p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">What is on this page</p>
                <ul className="flex flex-col gap-2">
                  {g.sections.map((s) => (
                    <li key={s.name} className="rounded border p-2.5">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.explain}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {g.tasks && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Step by step</p>
                  <div className="flex flex-col gap-3">
                    {g.tasks.map((t) => (
                      <div key={t.title} className="rounded border bg-muted/40 p-3">
                        <p className="font-medium">{t.title}</p>
                        <ol className="mt-1.5 flex list-decimal flex-col gap-1 pl-5 text-xs text-muted-foreground">
                          {t.steps.map((s) => <li key={s}>{s}</li>)}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded border border-primary/30 bg-primary-soft p-3 text-xs">
                <p className="font-medium text-foreground">Tip</p>
                <p className="text-muted-foreground">Every section has a <CircleHelp className="inline size-3" aria-label="help" /> button next to its title. Click it for a plain-language explanation. New to the platform? Read the <Link href="/start" className="font-medium text-primary underline-offset-2 hover:underline" onClick={() => setOpen(false)}>Start here</Link> tour.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
