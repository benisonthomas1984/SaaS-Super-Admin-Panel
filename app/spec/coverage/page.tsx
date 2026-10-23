import Link from 'next/link'
import { CONTRADICTIONS, FEATURES, GAPS, MODULES, PLATFORM_GAPS, featureHref, featuresFor, type StateKind } from '@/lib/spec'
import { Badge, FeatureTag, KV, PageHeader, Panel } from '@/components/admin/ui'

export const metadata = { title: 'Coverage matrix — Ledgerline Superadmin' }

const STATES: StateKind[] = ['loading', 'empty', 'error', 'restricted', 'incomplete']
const COV = { designed: { tone: 'good', label: 'Designed' }, assumption: { tone: 'warn', label: 'Designed · assumption' }, partial: { tone: 'bad', label: 'Partial' } } as const

export default function CoveragePage() {
  const count = (k: keyof typeof COV) => FEATURES.filter((f) => f.coverage === k).length
  const p0 = FEATURES.filter((f) => f.priority === 'P0')
  return (
    <>
      <PageHeader moduleId="Design spec" title="Screen-to-feature coverage matrix" description="Every subfeature ID mapped to its screen, interactions, designed states and open decisions. Click an ID row link to open the screen." />
      <div className="mb-5 grid grid-cols-3 gap-5">
        <Panel title="Totals" className="col-span-2">
          <KV cols={4} items={[['Subfeatures', `${FEATURES.length} / 64`], ['P0 / P1', `${p0.length} / ${FEATURES.length - p0.length}`], ['Fully designed', String(count('designed'))], ['Designed on assumption', String(count('assumption'))], ['Partial', String(count('partial'))], ['Contradictions flagged', String(CONTRADICTIONS.length)], ['Gaps flagged', String(GAPS.length)], ['Not mapped', String(64 - FEATURES.length)]]} />
        </Panel>
        <Panel title="Legend">
          <ul className="flex flex-col gap-1.5 text-xs">
            <li className="flex items-center gap-2"><Badge tone="good">Designed</Badge> Screen + interactions + 5 states</li>
            <li className="flex items-center gap-2"><Badge tone="warn">Designed · assumption</Badge> Depends on an open decision; configurable</li>
            <li className="flex items-center gap-2"><Badge tone="bad">Partial</Badge> Admin side only, or relies on non-UI guarantee</li>
          </ul>
        </Panel>
      </div>

      <div className="flex flex-col gap-5">
        {MODULES.map((m) => (
          <Panel key={m.id} title={`${m.id} · ${m.title}`}>
            <div className="overflow-x-auto rounded border">
              <table className="w-full text-xs">
                <caption className="sr-only">{m.id} coverage</caption>
                <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Feature</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Screen</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Key interactions</th>
                    <th scope="col" className="px-3 py-2 font-semibold">States</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Decisions</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {featuresFor(m.id).map((f) => (
                    <tr key={f.id} id={f.id} className="scroll-mt-20 border-t align-top target:bg-primary-soft">
                      <td className="w-56 px-3 py-2"><div className="flex flex-col gap-1"><FeatureTag id={f.id} className="self-start" /><span className="font-medium text-foreground">{f.title}</span></div></td>
                      <td className="w-52 px-3 py-2"><Link href={featureHref(f)} className="text-primary hover:underline">{f.screen}</Link></td>
                      <td className="px-3 py-2 leading-relaxed text-muted-foreground">{f.interactions}{f.note && <p className="mt-1 text-warn">Note: {f.note}</p>}</td>
                      <td className="w-40 px-3 py-2"><div className="flex flex-wrap gap-1">{STATES.map((s) => <span key={s} className={`rounded-sm border px-1 text-[10px] ${f.states.includes(s) ? 'border-primary/30 bg-primary-soft text-primary' : 'border-dashed text-muted-foreground line-through'}`}>{s}</span>)}</div></td>
                      <td className="w-24 px-3 py-2"><div className="flex flex-wrap gap-1">{f.decisions.length ? f.decisions.map((d) => <Link key={d} href={`/spec/decisions#${d}`} className="font-mono text-warn hover:underline">{d}</Link>) : <span className="text-muted-foreground">—</span>}</div></td>
                      <td className="w-40 px-3 py-2"><Badge tone={COV[f.coverage].tone}>{COV[f.coverage].label}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        ))}

        <Panel title="Contradictions in the specification" description="Each resolved in design as stated; confirm or override.">
          <ul className="flex flex-col gap-3">
            {CONTRADICTIONS.map((c) => (
              <li key={c.id} id={c.id} className="rounded border border-warn/40 p-3">
                <p className="text-sm font-semibold"><span className="font-mono text-warn">{c.id}</span> · {c.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
                <div className="mt-2 flex gap-1">{c.features.map((f) => <FeatureTag key={f} id={f} />)}</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Requirements the designs do not yet fully cover" description="Explicit gaps — nothing here is silently assumed complete.">
          <ul className="flex flex-col gap-3">
            {GAPS.map((g) => (
              <li key={g.id} id={g.id} className="rounded border border-destructive/30 p-3">
                <p className="text-sm font-semibold"><span className="font-mono text-destructive">{g.id}</span> · {g.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.detail}</p>
                {g.features.length > 0 && <div className="mt-2 flex gap-1">{g.features.map((f) => <FeatureTag key={f} id={f} />)}</div>}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Gaps beyond the source specification" description="Found on re-review: what a non-technical owner needs to actually run the platform. Proposed IDs (GAP-S…) — not in the original 64.">
          <ul className="flex flex-col gap-3">
            {PLATFORM_GAPS.map((g) => (
              <li key={g.id} id={g.id} className={g.status === 'open' ? 'rounded border border-destructive/30 p-3' : 'rounded border p-3'}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold"><span className="font-mono text-primary">{g.id}</span> · {g.title}</p>
                  <Badge tone={g.status === 'open' ? 'bad' : 'good'}>{g.status === 'open' ? 'Open' : 'Designed'}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.detail}</p>
                {g.where.startsWith('/') && <Link href={g.where} className="mt-1 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline">Open {g.where}</Link>}
                {!g.where.startsWith('/') && g.where !== '—' && <p className="mt-1 text-xs text-muted-foreground">{g.where}</p>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
