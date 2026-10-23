import { DECISIONS } from '@/lib/spec'
import { FeatureTag, PageHeader, Panel } from '@/components/admin/ui'

export const metadata = { title: 'Open decisions — Ledgerline Superadmin' }

export default function DecisionsPage() {
  return (
    <>
      <PageHeader moduleId="Design spec" title="Open business decisions" description="Every unresolved rule is a configurable option. The highlighted option is the design assumption used in screens; it is labelled wherever it appears and must be confirmed by the owner." />
      <div className="grid grid-cols-2 gap-5">
        {DECISIONS.map((d) => (
          <div key={d.id} id={d.id} className="scroll-mt-20">
            <Panel title={`${d.id} · ${d.title}`} description={`${d.question} Owner: ${d.owner}.`}>
              <fieldset>
                <legend className="sr-only">{d.title} options</legend>
                <div className="flex flex-col gap-1.5">
                  {d.options.map((o, i) => (
                    <label key={o} className={`flex items-center gap-2 rounded border px-2.5 py-1.5 text-sm ${i === d.assumed ? 'border-warn/60 bg-warn-soft' : ''}`}>
                      <input type="radio" name={d.id} defaultChecked={i === d.assumed} className="accent-primary" />
                      <span className="flex-1">{o}</span>
                      {i === d.assumed && <span className="text-[10px] font-semibold uppercase tracking-wide text-warn">Assumed</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-3 flex flex-wrap items-center gap-1"><span className="text-[11px] text-muted-foreground">Affects:</span>{d.affects.map((f) => <FeatureTag key={f} id={f} />)}</div>
            </Panel>
          </div>
        ))}
      </div>
    </>
  )
}
