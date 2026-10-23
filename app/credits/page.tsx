import { ModulePage } from '@/components/admin/module-page'
import { BucketsSection, ExhaustionSection, LedgerSection, ReservationsSection } from '@/components/modules/credits'

export const metadata = { title: 'Credits & wallet — Ledgerline Superadmin' }

export default function CreditsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <ModulePage moduleId="SA04" title="Credits and wallet" searchParams={searchParams} sections={{
      buckets: BucketsSection, reservations: ReservationsSection, ledger: LedgerSection, exhaustion: ExhaustionSection,
    }} />
  )
}
