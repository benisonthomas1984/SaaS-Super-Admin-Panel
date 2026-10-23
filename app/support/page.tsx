import { ModulePage } from '@/components/admin/module-page'
import { CasesSection, EvidenceSection, GoodwillSection, NotificationsSection } from '@/components/modules/support'

export const metadata = { title: 'Support and communications — Ledgerline Superadmin' }

export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA15" title="Support and communications" searchParams={searchParams} sections={{ cases: CasesSection, notifications: NotificationsSection, evidence: EvidenceSection, goodwill: GoodwillSection }} />
  )
}
