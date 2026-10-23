import { ModulePage } from '@/components/admin/module-page'
import { BackupsSection, JobsSection, PipelineSection, ReleasesSection } from '@/components/modules/operations'

export const metadata = { title: 'Operations and reliability — Ledgerline Superadmin' }

export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA14" title="Operations and reliability" searchParams={searchParams} sections={{ pipeline: PipelineSection, jobs: JobsSection, backups: BackupsSection, releases: ReleasesSection }} />
  )
}
