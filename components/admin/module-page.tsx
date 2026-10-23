import { MODULES, featuresFor } from '@/lib/spec'
import { PageHeader, Tabs } from './ui'

export type SectionMap = Record<string, () => React.ReactNode>

export async function ModulePage({ moduleId, title, searchParams, sections, actions }: {
  moduleId: string
  title?: string
  searchParams: Promise<{ tab?: string }>
  sections: SectionMap
  actions?: React.ReactNode
}) {
  const { tab } = await searchParams
  const m = MODULES.find((x) => x.id === moduleId)!
  const tabs = featuresFor(moduleId).map((f) => ({ id: f.tab, label: f.title, featureId: f.id })).filter((t) => t.id && sections[t.id])
  const active = tabs.find((t) => t.id === tab)?.id ?? tabs[0]?.id
  const render = sections[active]

  return (
    <>
      <PageHeader moduleId={`${m.id} · ${m.title}`} title={title ?? m.title} description={m.purpose} actions={actions} />
      <Tabs basePath={m.route} active={active} tabs={tabs} />
      {render?.()}
    </>
  )
}
