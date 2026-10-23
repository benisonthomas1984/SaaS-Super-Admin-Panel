import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, CircleHelp } from 'lucide-react'
import { GLOSSARY } from '@/lib/help'
import { ROLES, type RoleId } from '@/lib/rbac'
import { Badge, PageHeader, Panel, Prov } from '@/components/admin/ui'

export const metadata = { title: 'Start here — Ledgerline Superadmin' }

const FLOW = [
  { step: 'Customer signs up', detail: 'A company creates an account, usually on a free trial.', href: '/customers', where: 'Customers' },
  { step: 'Buys a plan', detail: 'Picks a package: price per seat + included credits + features.', href: '/plans', where: 'Plans & pricing' },
  { step: 'Gets credits', detail: 'Credits land in their wallet — the currency they spend on AI.', href: '/credits', where: 'Credits & wallet' },
  { step: 'Uses AI features', detail: 'Each task calls AI models (OpenAI, Anthropic…) and spends credits.', href: '/usage', where: 'Usage & cost' },
  { step: 'You pay providers', detail: 'Providers bill you per token. Estimated live, confirmed by invoice.', href: '/usage?tab=reconcile', where: 'Provider reconciliation' },
  { step: 'Customer is invoiced', detail: 'Subscription + any extra usage is invoiced and collected.', href: '/billing', where: 'Billing' },
  { step: 'You see profit', detail: 'Revenue − provider and hosting cost = margin.', href: '/profitability', where: 'Profitability' },
]

const CHECKLIST: { label: string; detail: string; href: string; done: boolean }[] = [
  { label: 'Set legal details, currency and timezone', detail: 'Shown on invoices and used for all reports.', href: '/settings?tab=general', done: true },
  { label: 'Upload brand assets', detail: 'Logo, colours and email sender for customer-facing pages.', href: '/settings?tab=brand', done: true },
  { label: 'Invite your admin team and require MFA', detail: 'Give each person the narrowest role they need.', href: '/settings?tab=team', done: true },
  { label: 'Connect AI providers and store their keys', detail: 'OpenAI, Anthropic, Google, OpenRouter… keys go into the encrypted vault.', href: '/settings?tab=integrations', done: true },
  { label: 'Register models and set routing', detail: 'Which models are allowed, for which plans, and what to fall back to.', href: '/ai', done: true },
  { label: 'Enter provider rate cards', detail: 'So every AI call can be costed.', href: '/usage?tab=rates', done: true },
  { label: 'Connect payments (Stripe)', detail: 'Needed to charge cards and receive payment events.', href: '/settings?tab=integrations', done: true },
  { label: 'Create and publish plans', detail: 'Your packages and their credit prices.', href: '/plans', done: false },
  { label: 'Set spend limits and kill switches', detail: 'Protects you from runaway AI bills.', href: '/controls', done: false },
  { label: 'Map costs to your chart of accounts', detail: 'So finance reports match your accountant\'s books.', href: '/profitability?tab=classification', done: false },
  { label: 'Decide the open business rules', detail: '20 rules the specification left open (e.g. do credits roll over?).', href: '/spec/decisions', done: false },
]

const WHERE: [string, string, string][] = [
  ['How is the business doing today?', 'Executive dashboard', '/'],
  ['Why was this customer charged X?', 'Support › Billing evidence', '/support?tab=evidence'],
  ['Where are my OpenAI / Anthropic / OpenRouter keys?', 'Settings › Integrations & keys', '/settings?tab=integrations'],
  ['How do I connect Google Drive or another service?', 'Settings › Integrations & keys › Add integration', '/settings?tab=integrations'],
  ['Who can sign in to this panel? How do I reset a password?', 'Settings › Admin team', '/settings?tab=team'],
  ['Where do I change our logo and colours?', 'Settings › Brand', '/settings?tab=brand'],
  ['How do I create or publish a package?', 'Plans & pricing › Catalogue', '/plans'],
  ['A provider is down / an agent is overspending', 'Budgets & emergency › Kill switches', '/controls?tab=kill'],
  ['Is this customer profitable?', 'Profitability › Unit economics', '/profitability?tab=unit'],
  ['Who changed this setting?', 'Security › Audit trail', '/security?tab=audit'],
  ['Give a customer free credits', 'Support › Goodwill credits', '/support?tab=goodwill'],
  ['Add hosting, storage or OCR costs', 'Usage › Non-token & shared costs', '/usage?tab=shared'],
]

export default function StartPage() {
  return (
    <>
      <PageHeader title="Start here: how the platform works" description="A plain-language tour for administrators. Read it once, then use the help buttons on every section whenever something is unclear." />

      <div className="flex flex-col gap-5">
        <Panel title="How money flows through the platform" description="Every screen in this panel covers one step of this chain. Click a step to open its screen.">
          <ol className="grid grid-cols-7 gap-2">
            {FLOW.map((f, i) => (
              <li key={f.step} className="flex">
                <Link href={f.href} className="group flex flex-1 flex-col gap-1.5 rounded border bg-background p-3 transition-colors hover:border-primary/50">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
                  <span className="text-sm font-semibold leading-snug">{f.step}</span>
                  <span className="text-pretty text-xs leading-relaxed text-muted-foreground">{f.detail}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[11px] font-medium text-primary group-hover:underline">{f.where} <ArrowRight className="size-3" /></span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="grid grid-cols-3 gap-5">
          <Panel title="Setup checklist" className="col-span-2" description="What has to be configured before real customers can use the platform. Sample progress shown.">
            <ul className="flex flex-col divide-y">
              {CHECKLIST.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="flex items-start gap-3 py-2.5 hover:bg-muted/40">
                    {c.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Done" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label="Not done" />}
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{c.label}</span>
                      <span className="block text-xs text-muted-foreground">{c.detail}</span>
                    </span>
                    <ArrowRight className="mt-1 size-3.5 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="flex flex-col gap-5">
            <Panel title="Reading the numbers" description="Every figure carries a badge telling you how final it is.">
              <ul className="flex flex-col gap-2.5 text-xs leading-relaxed">
                <li className="flex flex-col gap-1"><Prov kind="reconciled" /><span className="text-muted-foreground">Confirmed against the source (provider invoice, bank). Final.</span></li>
                <li className="flex flex-col gap-1"><Prov kind="estimated" /><span className="text-muted-foreground">Live figure shown with ≈. Can still change.</span></li>
                <li className="flex flex-col gap-1"><Prov kind="incomplete" /><span className="text-muted-foreground">Some data is missing. Never counted as zero — the real figure is higher.</span></li>
                <li className="flex flex-col gap-1"><Prov kind="forecast" /><span className="text-muted-foreground">A projection, not a booked number.</span></li>
                <li className="flex flex-col gap-1"><Prov kind="closed" /><span className="text-muted-foreground">Month is locked. Corrections go into the next month.</span></li>
              </ul>
            </Panel>
            <Panel title="Getting help on any screen">
              <ul className="flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
                <li className="flex gap-2"><CircleHelp className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden /><span>Click the help button next to any section title for what it is, how it is calculated and what you can do.</span></li>
                <li className="flex gap-2"><span className="shrink-0 rounded border border-primary/30 bg-primary-soft px-1 text-[10px] font-medium text-primary">How this page works</span><span>Top-right of every page: a full guide with step-by-step tasks.</span></li>
                <li className="flex gap-2"><span className="shrink-0 font-mono text-[10px]">SA05.01</span><span>Feature IDs link each section back to the specification. You can ignore them day to day.</span></li>
              </ul>
            </Panel>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Panel title="Where do I find…?">
            <ul className="flex flex-col divide-y text-sm">
              {WHERE.map(([q, w, href]) => (
                <li key={q}>
                  <Link href={href} className="flex items-center justify-between gap-4 py-2 hover:bg-muted/40">
                    <span>{q}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">{w} <ArrowRight className="size-3" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Administrator roles" description="Every person gets one role. The server enforces it — restricted data is never even sent to their browser.">
            <ul className="flex flex-col gap-2.5 text-sm">
              {(Object.keys(ROLES) as RoleId[]).map((r) => (
                <li key={r} className="rounded border p-2.5">
                  <div className="flex items-center justify-between"><span className="font-medium">{ROLES[r].label}</span><Badge tone="outline">{ROLES[r].caps.length} permissions</Badge></div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Limit: {ROLES[r].boundary}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Glossary" description="Every term used in the panel, in plain English.">
          <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
            {GLOSSARY.map(([t, d]) => (
              <div key={t} className="border-l-2 border-primary/20 pl-3">
                <dt className="text-sm font-semibold">{t}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">{d}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  )
}
