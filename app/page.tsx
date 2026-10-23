import { PageHeader } from '@/components/admin/ui'
import { ScopeBar } from '@/components/admin/scope-bar'
import { CoverageStrip, DashboardAssumptions, ExceptionsPanel, ForecastPanel, HeadlineCards, TrendPanel } from '@/components/modules/dashboard'

export default function ExecutiveDashboardPage() {
  return (
    <>
      <PageHeader
        moduleId="SA01 · Business overview"
        title="Executive dashboard"
        description="For each paying company: what we earn, consume, spend to deliver, how it was acquired and what contribution remains. Every card names its period, currency and freshness."
      />
      <ScopeBar />
      <CoverageStrip />
      <HeadlineCards />
      <div className="mt-5 grid grid-cols-3 gap-5">
        <div className="col-span-2"><TrendPanel /></div>
        <ExceptionsPanel />
      </div>
      <div className="mt-5"><ForecastPanel /></div>
      <div className="mt-5"><DashboardAssumptions /></div>
    </>
  )
}
