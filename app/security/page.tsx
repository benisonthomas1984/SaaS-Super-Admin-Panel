import { ModulePage } from '@/components/admin/module-page'
import { AuditSection, RetentionSection, RolesSection, SupportAccessSection } from '@/components/modules/security'

export const metadata = { title: 'Security & audit — Ledgerline Superadmin' }

export default function SecurityPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA13" title="Security and audit" searchParams={searchParams} sections={{
      roles: RolesSection, audit: AuditSection, retention: RetentionSection, 'support-access': SupportAccessSection,
    }} />
  )
}
