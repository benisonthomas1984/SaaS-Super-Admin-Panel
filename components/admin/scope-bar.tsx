'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdmin } from './admin-context'
import { FeatureTag } from './ui'

const FILTERS = {
  period: ['Oct 2026 MTD (1–23 Oct)', 'Sep 2026 (closed)', 'Q3 2026 (closed)', 'Last 30 days'],
  comparison: ['Prior period (Sep 1–23)', 'Same period last year', 'None'],
  currency: ['USD (reporting)', 'EUR', 'GBP'],
  company: ['All companies', 'CO-10482 Northwind Logistics', 'CO-10019 Halcyon Legal LLP', 'CO-10233 Atlas Freight Inc.', 'CO-11807 Atlas Freight Ltd'],
  plan: ['All plans', 'Starter', 'Growth', 'Scale', 'Enterprise (custom)'],
  product: ['All products', 'Document agent', 'Support copilot', 'Data extraction API'],
  region: ['All regions', 'US-East', 'US-West', 'EU-West', 'EU-Central', 'UK-South'],
} as const

type Key = keyof typeof FILTERS

export function ScopeBar({ features = ['SA01.01'], saveable = true }: { features?: string[]; saveable?: boolean }) {
  const { record } = useAdmin()
  const [scope, setScope] = useState<Record<Key, string>>(() =>
    Object.fromEntries((Object.keys(FILTERS) as Key[]).map((k) => [k, FILTERS[k][0]])) as Record<Key, string>,
  )
  const [saved, setSaved] = useState<string | null>(null)

  return (
    <div className="mb-5 rounded-md border bg-card px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        {(Object.keys(FILTERS) as Key[]).map((k) => (
          <label key={k} className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {k}
            <select
              value={scope[k]}
              onChange={(e) => setScope((s) => ({ ...s, [k]: e.target.value }))}
              className="h-8 rounded border border-input bg-background px-2 text-sm font-normal normal-case tracking-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {FILTERS[k].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        {saveable && (
          <Button variant="outline" className="ml-auto" onClick={() => {
            const id = record({ action: 'saved_view.create', target: 'Exec — ' + scope.period, reason: 'Personal view' })
            setSaved(id)
          }}>
            <Bookmark /> Save view
          </Button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {features.map((f) => <FeatureTag key={f} id={f} />)}
        <span>All compatible cards use this scope. Drill-downs inherit it. Billing timezone: per customer; reporting boundary: UTC (D18 assumption).</span>
        {saved && <span className="text-primary">Saved as personal view · {saved} · <FeatureTag id="SA01.02" /></span>}
      </div>
    </div>
  )
}
