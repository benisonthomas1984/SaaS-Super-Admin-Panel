import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FEATURES, FLOWS, MODULES, featureHref, featuresFor } from '@/lib/spec'
import { ROLES } from '@/lib/rbac'
import { Badge, FeatureTag, PageHeader, Panel } from '@/components/admin/ui'

export const metadata = { title: 'IA, screens & flows — Ledgerline Superadmin' }

const GROUPS = ['Overview', 'Customers & money', 'Growth', 'AI & data', 'Control & trust'] as const

export default function SpecPage() {
  const p0 = FEATURES.filter((f) => f.priority === 'P0').length
  return (
    <>
      <PageHeader moduleId="Design spec" title="Information architecture, screens and flows" description={`16 modules · ${FEATURES.length} subfeatures (${p0} P0 · ${FEATURES.length - p0} P1). Every screen section carries its feature ID tag; P0 tags are solid, P1 tags are dashed.`} />

      <div className="flex flex-col gap-5">
        <Panel title="Navigation model" description="Left rail groups modules by job-to-be-done. Global header: environment switcher, role preview, data-state preview, support session banner. Scope bar persists across Overview and money modules.">
          <div className="grid grid-cols-5 gap-3">
            {GROUPS.map((g) => (
              <div key={g} className="rounded border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g}</p>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                  {MODULES.filter((m) => m.group === g).map((m) => (
                    <li key={m.id}><Link href={m.route} className="hover:underline"><span className="font-mono text-xs text-muted-foreground">{m.id}</span> {m.title}</Link></li>
                  ))}
                  {g === 'Overview' && <li><Link href="/reports" className="hover:underline"><span className="font-mono text-xs text-muted-foreground">SA01</span> Reports</Link></li>}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Screen inventory" description="Route › section (tab). Customer 360 is the hub for SA02 and links out to every module scoped to one company.">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {MODULES.map((m) => (
              <div key={m.id}>
                <p className="text-sm font-semibold"><span className="font-mono text-xs text-muted-foreground">{m.route}</span> · {m.title}</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {featuresFor(m.id).map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-xs">
                      <FeatureTag id={f.id} />
                      <Link href={featureHref(f)} className="truncate hover:underline">{f.screen}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Main user flows" description="End-to-end workflows from the specification, each mapped to the screens that implement them.">
          <div className="grid grid-cols-2 gap-4">
            {FLOWS.map((fl) => (
              <div key={fl.id} className="rounded border p-3">
                <p className="text-sm font-semibold">Flow {fl.id} · {fl.title}</p>
                <ol className="mt-2 flex flex-col gap-1 text-xs leading-relaxed">
                  {fl.steps.map((s, i) => <li key={s} className="flex gap-2"><span className="font-mono text-muted-foreground">{i + 1}.</span><span>{s}</span></li>)}
                </ol>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fl.screens.map((s) => <Link key={s} href={s} className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline">{s}<ArrowRight className="size-3" /></Link>)}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Roles & access boundaries" description="Switch role in the header to preview server-side restrictions on every screen.">
          <ul className="grid grid-cols-3 gap-3 text-sm">
            {Object.entries(ROLES).map(([id, r]) => (
              <li key={id} className="rounded border p-3"><p className="font-medium">{r.label} <Badge tone="outline">{r.caps.length} caps</Badge></p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.boundary}</p></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
