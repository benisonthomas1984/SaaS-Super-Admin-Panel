import Link from 'next/link'
import { ArrowUpRight, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { feature } from '@/lib/spec'
import { STAT_HELP, sectionHelp } from '@/lib/help'
import { InfoTip, PageGuideButton } from './help'

export function FeatureTag({ id, className }: { id: string; className?: string }) {
  const f = feature(id)
  return (
    <Link
      href={`/spec/coverage#${id}`}
      title={f ? `${id} · ${f.title} · ${f.priority}` : id}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none tabular',
        f?.priority === 'P1' ? 'border-dashed border-muted-foreground/50 text-muted-foreground' : 'border-primary/30 bg-primary-soft text-primary',
        className,
      )}
    >
      {id}
      {f && <span className="opacity-70">{f.priority}</span>}
    </Link>
  )
}

export type ProvKind =
  | 'reconciled' | 'estimated' | 'incomplete' | 'unrated' | 'pending' | 'forecast'
  | 'allocated' | 'direct' | 'na' | 'unknown' | 'closed' | 'provisional'

const PROV: Record<ProvKind, { label: string; cls: string }> = {
  reconciled: { label: 'Reconciled', cls: 'border-primary/40 bg-primary text-primary-foreground' },
  closed: { label: 'Period closed', cls: 'border-primary/40 bg-primary text-primary-foreground' },
  estimated: { label: 'Estimated · live', cls: 'border-dashed border-warn text-warn bg-card' },
  provisional: { label: 'Provisional', cls: 'border-dashed border-warn text-warn bg-card' },
  forecast: { label: 'Forecast', cls: 'border-dashed border-muted-foreground text-muted-foreground bg-card' },
  incomplete: { label: 'Incomplete', cls: 'stripes-warn border-warn/60 text-warn' },
  unrated: { label: 'Unrated', cls: 'border-warn/60 bg-warn-soft text-warn' },
  pending: { label: 'Pending', cls: 'border-warn/60 bg-warn-soft text-warn' },
  allocated: { label: 'Allocated', cls: 'border-muted-foreground/40 bg-muted text-muted-foreground' },
  direct: { label: 'Direct', cls: 'border-primary/30 bg-primary-soft text-primary' },
  na: { label: 'n.a.', cls: 'border-border bg-muted text-muted-foreground' },
  unknown: { label: 'Unknown', cls: 'border-border bg-muted text-muted-foreground' },
}

export function Prov({ kind, label, className }: { kind: ProvKind; label?: string; className?: string }) {
  const p = PROV[kind]
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-sm border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide', p.cls, className)}>
      {label ?? p.label}
    </span>
  )
}

export function PageHeader({ title, moduleId, description, actions }: { title: string; moduleId?: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-6">
      <div>
        {moduleId && <p className="font-mono text-xs text-muted-foreground">{moduleId}</p>}
        <h1 className="text-balance text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PageGuideButton />
        {actions}
      </div>
    </div>
  )
}

export function Panel({ title, features, actions, children, className, description }: {
  title: string
  features?: string[]
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  description?: string
}) {
  const help = sectionHelp(title, features)
  return (
    <section className={cn('rounded-md border bg-card', className)} aria-label={title}>
      <header className="flex items-start justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            {help && <InfoTip help={help} label={title.split(' · ')[0]} />}
            {features?.map((f) => <FeatureTag key={f} id={f} />)}
          </div>
          {description && <p className="mt-0.5 text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Stat({ label, value, kind, meta, href, delta, footnote }: {
  label: string
  value: React.ReactNode
  kind: ProvKind
  meta: string
  href?: string
  delta?: string
  footnote?: string
}) {
  const muted = kind === 'incomplete' || kind === 'na' || kind === 'unknown'
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {label}
          {STAT_HELP[label] && <InfoTip help={STAT_HELP[label]} label={label} />}
        </p>
        <Prov kind={kind} />
      </div>
      <p className={cn('mt-2 text-2xl font-semibold tabular tracking-tight', muted && 'text-muted-foreground', kind === 'estimated' && 'italic')}>
        {kind === 'estimated' && <span aria-label="approximately" className="mr-0.5 not-italic text-warn">≈</span>}
        {value}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">{meta}</span>
        {delta && <span className="tabular">{delta}</span>}
      </div>
      {footnote && <p className="mt-2 border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">{footnote}</p>}
      {href && (
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:underline">
          Open contributing records <ArrowUpRight className="size-3" />
        </span>
      )}
    </>
  )
  const cls = cn('group block rounded-md border bg-card p-3.5 transition-colors', kind === 'incomplete' && 'border-warn/50', href && 'hover:border-primary/50')
  return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>
}

export type Column = { key: string; label: string; align?: 'left' | 'right'; mono?: boolean; width?: string }

export function DataTable({ columns, rows, caption, dense }: { columns: Column[]; rows: Record<string, React.ReactNode>[]; caption?: string; dense?: boolean }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-muted/60">
            {columns.map((c) => (
              <th key={c.key} scope="col" style={c.width ? { width: c.width } : undefined}
                className={cn('whitespace-nowrap border-b px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground', c.align === 'right' && 'text-right')}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
              {columns.map((c) => (
                <td key={c.key} className={cn('px-3 align-top', dense ? 'py-1.5' : 'py-2', c.align === 'right' && 'text-right tabular', c.mono && 'font-mono text-xs')}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function KV({ items, cols = 2 }: { items: [string, React.ReactNode][]; cols?: 2 | 3 | 4 }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3 text-sm', cols === 2 && 'grid-cols-2', cols === 3 && 'grid-cols-3', cols === 4 && 'grid-cols-4')}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 truncate">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

const BADGE = {
  neutral: 'bg-muted text-foreground border-border',
  good: 'bg-primary-soft text-primary border-primary/30',
  warn: 'bg-warn-soft text-warn border-warn/40',
  bad: 'bg-destructive-soft text-destructive border-destructive/30',
  outline: 'bg-card text-muted-foreground border-border',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: keyof typeof BADGE; children: React.ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-sm border px-1.5 py-px text-[11px] font-medium', BADGE[tone], className)}>{children}</span>
}

export function Assumption({ decision, children }: { decision?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded border border-dashed border-warn/60 bg-warn-soft/60 px-3 py-2 text-xs leading-relaxed text-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden />
      <p>
        <span className="font-semibold text-warn">Assumption{decision ? ` · ${decision} open` : ''}:</span> {children}{' '}
        {decision && <Link href={`/spec/decisions#${decision}`} className="font-medium text-primary underline-offset-2 hover:underline">Configure</Link>}
      </p>
    </div>
  )
}

export function Callout({ tone = 'warn', title, children }: { tone?: 'warn' | 'bad' | 'info'; title: string; children: React.ReactNode }) {
  const cls = tone === 'bad' ? 'border-destructive/40 bg-destructive-soft text-destructive' : tone === 'info' ? 'border-primary/30 bg-primary-soft text-primary' : 'border-warn/50 bg-warn-soft text-warn'
  return (
    <div className={cn('flex gap-2 rounded border px-3 py-2 text-xs leading-relaxed', cls)} role={tone === 'bad' ? 'alert' : 'status'}>
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <div className="text-foreground">
        <p className="font-semibold">{title}</p>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

export function Tabs({ basePath, active, tabs }: { basePath: string; active: string; tabs: { id: string; label: string; featureId: string }[] }) {
  return (
    <nav aria-label="Sections" className="mb-5 flex gap-1 overflow-x-auto border-b">
      {tabs.map((t) => {
        const on = t.id === active
        return (
          <Link key={t.id} href={`${basePath}?tab=${t.id}`} aria-current={on ? 'page' : undefined}
            className={cn('-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors',
              on ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t.label}
            <span className="font-mono text-[10px] text-muted-foreground">{t.featureId}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Bar({ value, max, tone = 'primary', label }: { value: number; max: number; tone?: 'primary' | 'warn' | 'bad' | 'muted'; label?: string }) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100)
  const cls = tone === 'warn' ? 'bg-warn' : tone === 'bad' ? 'bg-destructive' : tone === 'muted' ? 'bg-muted-foreground/40' : 'bg-primary'
  return (
    <div className="h-1.5 w-full rounded-full bg-muted" role="meter" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Usage'}>
      <div className={cn('h-full rounded-full', cls)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  )
}

export const inputCls = 'h-8 rounded border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60'

export function FilterChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">Applied:</span>
      {items.map((i) => (
        <span key={i} className="rounded-sm border bg-card px-1.5 py-px text-[11px]">{i}</span>
      ))}
    </div>
  )
}
