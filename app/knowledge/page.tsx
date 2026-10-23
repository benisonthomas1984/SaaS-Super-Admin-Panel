import { ModulePage } from '@/components/admin/module-page'
import { ConnectorsSection, RetrievalSection, SourcesSection, StorageSection } from '@/components/modules/knowledge'

export const metadata = { title: 'Knowledge & connectors — Ledgerline Superadmin' }

export default function KnowledgePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA11" title="Knowledge and integrations" searchParams={searchParams} sections={{
      sources: SourcesSection, retrieval: RetrievalSection, connectors: ConnectorsSection, storage: StorageSection,
    }} />
  )
}
