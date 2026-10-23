import { ModulePage } from '@/components/admin/module-page'
import { EvalsSection, GuardrailsSection, RegistrySection, RoutingSection } from '@/components/modules/ai'

export const metadata = { title: 'Models & agents — Ledgerline Superadmin' }

export default function AiPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA10" title="Models and agents" searchParams={searchParams} sections={{
      registry: RegistrySection, routing: RoutingSection, guardrails: GuardrailsSection, evals: EvalsSection,
    }} />
  )
}
