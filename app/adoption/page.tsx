import { ModulePage } from '@/components/admin/module-page'
import { ActivationSection, HealthSection, RetentionSection, SuccessSection } from '@/components/modules/adoption'

export const metadata = { title: 'Adoption & retention — Ledgerline Superadmin' }

export default function AdoptionPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA09" title="Adoption and retention" searchParams={searchParams} sections={{
      activation: ActivationSection, success: SuccessSection, retention: RetentionSection, health: HealthSection,
    }} />
  )
}
