import { StateFrame } from '@/components/admin/state'
import { DataTable, PageHeader, Panel, Prov, Stat } from '@/components/admin/ui'

export const metadata = { title: 'State gallery — Ledgerline Superadmin' }

const SAMPLE = <DataTable dense columns={[{ key: 'a', label: 'Company' }, { key: 'b', label: 'Revenue', align: 'right' }]} rows={[{ a: 'Northwind Logistics', b: '$18,400.00' }]} />

export default function StatesPage() {
  return (
    <>
      <PageHeader moduleId="Design spec" title="State gallery" description="Canonical treatments used by every section. Use the header Data state control to preview them on any live screen; restricted state follows the selected role." />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-5">
          <Panel title="Loading"><StateFrame features={['SA01.01']} forceState="loading">{SAMPLE}</StateFrame></Panel>
          <Panel title="Empty (not zero)"><StateFrame features={['SA01.01']} forceState="empty">{SAMPLE}</StateFrame></Panel>
          <Panel title="Error"><StateFrame features={['SA01.01']} forceState="error">{SAMPLE}</StateFrame></Panel>
          <Panel title="Restricted (server 403)"><StateFrame features={['SA07.02']} cap="view.content" forceState="restricted">{SAMPLE}</StateFrame></Panel>
          <Panel title="Incomplete data"><StateFrame features={['SA03.04']} forceState="incomplete" incomplete="Provider B statement missing for 22 Oct">{SAMPLE}</StateFrame></Panel>
          <Panel title="Live">{SAMPLE}</Panel>
        </div>
        <Panel title="Figure provenance" description="Estimated and reconciled figures are never visually interchangeable.">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="AI cost MTD" value="$41,902" kind="estimated" meta="Live rating · 38 s old" />
            <Stat label="AI cost September" value="$118,240.55" kind="reconciled" meta="Statements matched 03 Oct" />
            <Stat label="Margin October" value="61.4%" kind="incomplete" meta="Provider B missing" />
            <Stat label="Revenue Q4" value="$1.21M" kind="forecast" meta="Linear · 80% CI ±6%" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['reconciled', 'closed', 'estimated', 'provisional', 'forecast', 'incomplete', 'unrated', 'pending', 'allocated', 'direct', 'na', 'unknown'] as const).map((k) => <Prov key={k} kind={k} />)}
          </div>
        </Panel>
      </div>
    </>
  )
}
