import { ModulePage } from '@/components/admin/module-page'
import { ByokSection, EnvironmentsSection, KeysSection, WebhooksSection } from '@/components/modules/developer'

export const metadata = { title: 'Developer access — Ledgerline Superadmin' }

export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA16" title="Developer access" searchParams={searchParams} sections={{ keys: KeysSection, webhooks: WebhooksSection, environments: EnvironmentsSection, byok: ByokSection }} />
  )
}
