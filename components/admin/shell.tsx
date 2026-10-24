'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileBarChart, Building2, Activity, Wallet, Layers, Receipt, Scale, Megaphone,
  HeartPulse, Cpu, Database, ShieldAlert, Lock, ServerCog, LifeBuoy, KeyRound, Map, Grid3x3, ListChecks, Shapes, ShieldCheck, X, Compass, Settings, Boxes, GitMerge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLES, type RoleId } from '@/lib/rbac'
import { useAdmin, type DemoState, type Environment } from './admin-context'

type NavItem = { href: string; label: string; id?: string; icon: React.ComponentType<{ className?: string }> }

const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Overview', items: [
    { href: '/start', label: 'Start here', id: 'Guide', icon: Compass },
    { href: '/', label: 'Executive dashboard', id: 'SA01', icon: LayoutDashboard },
    { href: '/reports', label: 'Reports & saved views', id: 'SA01', icon: FileBarChart },
  ] },
  { group: 'Products', items: [
    { href: '/products', label: 'Products & packages', id: 'MP01', icon: Boxes },
  ] },
  { group: 'Customers & money', items: [
    { href: '/customers', label: 'Customers', id: 'SA02', icon: Building2 },
    { href: '/usage', label: 'Usage & cost', id: 'SA03', icon: Activity },
    { href: '/credits', label: 'Credits & wallet', id: 'SA04', icon: Wallet },
    { href: '/plans', label: 'Plans & pricing', id: 'SA05', icon: Layers },
    { href: '/billing', label: 'Billing', id: 'SA06', icon: Receipt },
    { href: '/profitability', label: 'Profitability', id: 'SA07', icon: Scale },
  ] },
  { group: 'Growth', items: [
    { href: '/growth', label: 'Acquisition', id: 'SA08', icon: Megaphone },
    { href: '/adoption', label: 'Adoption & retention', id: 'SA09', icon: HeartPulse },
  ] },
  { group: 'AI & data', items: [
    { href: '/ai', label: 'Models & agents', id: 'SA10', icon: Cpu },
    { href: '/knowledge', label: 'Knowledge & connectors', id: 'SA11', icon: Database },
  ] },
  { group: 'Control & trust', items: [
    { href: '/controls', label: 'Budgets & emergency', id: 'SA12', icon: ShieldAlert },
    { href: '/security', label: 'Security & audit', id: 'SA13', icon: Lock },
    { href: '/operations', label: 'Operations', id: 'SA14', icon: ServerCog },
    { href: '/support', label: 'Support & comms', id: 'SA15', icon: LifeBuoy },
    { href: '/developer', label: 'Developer access', id: 'SA16', icon: KeyRound },
  ] },
  { group: 'Setup', items: [
    { href: '/settings', label: 'Platform settings', id: 'GAP-S', icon: Settings },
  ] },
  { group: 'Specification', items: [
    { href: '/spec', label: 'IA, screens & flows', icon: Map },
    { href: '/spec/coverage', label: 'Coverage matrix', icon: Grid3x3 },
    { href: '/spec/decisions', label: 'Open decisions', icon: ListChecks },
    { href: '/spec/states', label: 'State gallery', icon: Shapes },
    { href: '/spec/addendum', label: 'Multi-product addendum', icon: GitMerge },
  ] },
]

const ENV_META: Record<Environment, { label: string; note: string }> = {
  production: { label: 'Production', note: 'Live tenants · live payment mode' },
  staging: { label: 'Staging', note: 'Test payment mode · test keys · cannot alter production wallets' },
  development: { label: 'Development', note: 'Synthetic tenants · no real payments' },
  evaluation: { label: 'Evaluation', note: 'Internal eval traffic · excluded from customer COGS' },
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/spec') return pathname === '/spec'
  return pathname === href || pathname.startsWith(href + '/')
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { role, setRole, demoState, setDemoState, env, setEnv, supportSession, setSupportSession, record } = useAdmin()
  const nonProd = env !== 'production'

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground" aria-label="Primary">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
          <div className="flex size-7 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="size-4" aria-hidden />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-accent-foreground">Ledgerline</p>
            <p className="text-xs text-sidebar-foreground/70">Superadmin · design spec v1.0</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">{g.group}</p>
              <ul className="flex flex-col gap-0.5">
                {g.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                          active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.id && <span className="font-mono text-[10px] text-sidebar-foreground/50">{item.id}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/70">
          Signed in as <span className="text-sidebar-accent-foreground">a.rivera@ledgerline.example</span>
          <br />
          MFA verified · session 7h 12m left
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {nonProd && (
          <div className="stripes-warn border-b border-warn/40 bg-warn-soft px-6 py-1.5 text-xs font-medium text-warn" role="status">
            {ENV_META[env].label.toUpperCase()} ENVIRONMENT — {ENV_META[env].note} <span className="font-mono">[SA16.03]</span>
          </div>
        )}
        {supportSession && (
          <div className="flex items-center gap-3 border-b border-destructive/30 bg-destructive-soft px-6 py-2 text-xs text-destructive" role="alert">
            <span className="font-semibold">Support session active</span>
            <span>
              {supportSession.company} · {supportSession.scope} · reason: “{supportSession.reason}” · expires {supportSession.expiresAt}
            </span>
            <span className="font-mono">[SA13.04]</span>
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1 rounded border border-destructive/40 px-2 py-0.5 font-medium hover:bg-destructive/10"
              onClick={() => {
                record({ action: 'support_session.end', target: supportSession.company, reason: 'Ended by administrator' })
                setSupportSession(null)
              }}
            >
              <X className="size-3" /> End session
            </button>
          </div>
        )}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-card/95 px-6 py-2.5 backdrop-blur">
          <p className="text-xs text-muted-foreground">
            <span className="rounded bg-warn-soft px-1.5 py-0.5 font-medium text-warn">Sample data</span>{' '}
            Illustrative figures only — no real results or live provider prices.
          </p>
          <div className="ml-auto flex items-center gap-3">
            <Switcher label="Environment" value={env} onChange={(v) => setEnv(v as Environment)}
              options={(Object.keys(ENV_META) as Environment[]).map((e) => ({ value: e, label: ENV_META[e].label }))} />
            <Switcher label="View as role" value={role} onChange={(v) => setRole(v as RoleId)}
              options={(Object.keys(ROLES) as RoleId[]).map((r) => ({ value: r, label: ROLES[r].label }))} />
            <Switcher label="Preview state" value={demoState} onChange={(v) => setDemoState(v as DemoState)}
              options={[
                { value: 'live', label: 'Populated' },
                { value: 'loading', label: 'Loading' },
                { value: 'empty', label: 'Empty' },
                { value: 'error', label: 'Error' },
                { value: 'incomplete', label: 'Incomplete data' },
              ]} />
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  )
}

function Switcher({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded border bg-background px-1.5 text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
