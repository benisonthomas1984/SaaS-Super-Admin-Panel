import { PageHeader, Tabs } from '@/components/admin/ui'
import { IntegrationsSection } from '@/components/modules/settings-integrations'
import { BrandSection, GeneralSection, TeamSection } from '@/components/modules/settings-other'

export const metadata = { title: 'Platform settings · Superadmin' }

const TABS = [
  { id: 'integrations', label: 'Integrations & keys', featureId: 'GAP-S01/S02', render: () => <IntegrationsSection /> },
  { id: 'team', label: 'Admin team & sign-in', featureId: 'GAP-S03', render: () => <TeamSection /> },
  { id: 'brand', label: 'Brand & email', featureId: 'GAP-S04', render: () => <BrandSection /> },
  { id: 'general', label: 'Company & defaults', featureId: 'GAP-S05', render: () => <GeneralSection /> },
]

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const active = TABS.find((t) => t.id === tab) ?? TABS[0]
  return (
    <>
      <PageHeader moduleId="GAP-S · Platform settings (proposed, not in source spec)" title="Platform settings"
        description="Everything the platform is plugged into and branded with: outside services and their keys, who can sign in to this panel, how customers see your brand, and company-wide defaults." />
      <Tabs basePath="/settings" active={active.id} tabs={TABS} />
      {active.render()}
    </>
  )
}
