export type Priority = 'P0' | 'P1'
export type StateKind = 'loading' | 'empty' | 'error' | 'restricted' | 'incomplete'
export type Coverage = 'designed' | 'assumption' | 'partial'

export type Module = {
  id: string
  title: string
  route: string
  purpose: string
  group: 'Overview' | 'Customers & money' | 'Growth' | 'AI & data' | 'Control & trust'
}

export const MODULES: Module[] = [
  { id: 'SA01', title: 'Business overview', route: '/', group: 'Overview', purpose: 'One consistent view of business health with a path to underlying evidence.' },
  { id: 'SA02', title: 'Customers and tenancy', route: '/customers', group: 'Customers & money', purpose: 'Manage companies, workspaces and users with clear ownership and isolation.' },
  { id: 'SA03', title: 'Usage and cost attribution', route: '/usage', group: 'Customers & money', purpose: 'Measure every billable resource and tie cost to task, customer and historical price.' },
  { id: 'SA04', title: 'Credits and wallet', route: '/credits', group: 'Customers & money', purpose: 'Enforceable allowances without confusing provider tokens, credits and cash.' },
  { id: 'SA05', title: 'Plans and entitlements', route: '/plans', group: 'Customers & money', purpose: 'Define the commercial offer and enforce exactly what was purchased.' },
  { id: 'SA06', title: 'Billing and collections', route: '/billing', group: 'Customers & money', purpose: 'Connect consumption to invoices and cash with reliable payment processing.' },
  { id: 'SA07', title: 'Profitability', route: '/profitability', group: 'Customers & money', purpose: 'Defensible customer economics and platform operating results.' },
  { id: 'SA08', title: 'Acquisition', route: '/growth', group: 'Growth', purpose: 'Connect acquisition spend to paying companies and their contribution.' },
  { id: 'SA09', title: 'Adoption and retention', route: '/adoption', group: 'Growth', purpose: 'Measure useful outcomes and continued payment.' },
  { id: 'SA10', title: 'Models and agents', route: '/ai', group: 'AI & data', purpose: 'Control AI behavior, resources and quality with operational visibility.' },
  { id: 'SA11', title: 'Knowledge and integrations', route: '/knowledge', group: 'AI & data', purpose: 'Manage ingestion and retrieval that drive quality and cost.' },
  { id: 'SA12', title: 'Budgets and emergency', route: '/controls', group: 'Control & trust', purpose: 'Prevent accidental or malicious spend; enforce bounded execution.' },
  { id: 'SA13', title: 'Security and audit', route: '/security', group: 'Control & trust', purpose: 'Controlled administrator authority with accountable changes.' },
  { id: 'SA14', title: 'Operations and reliability', route: '/operations', group: 'Control & trust', purpose: 'Keep numbers, jobs and business records trustworthy.' },
  { id: 'SA15', title: 'Support and comms', route: '/support', group: 'Control & trust', purpose: 'Give support context while tracking effort and obligations.' },
  { id: 'SA16', title: 'Developer access', route: '/developer', group: 'Control & trust', purpose: 'Control machine access and external event exchange.' },
]

export type Feature = {
  id: string
  title: string
  priority: Priority
  route: string
  tab: string
  screen: string
  interactions: string
  states: StateKind[]
  decisions: string[]
  coverage: Coverage
  note?: string
}

const ALL: StateKind[] = ['loading', 'empty', 'error', 'restricted', 'incomplete']

export const FEATURES: Feature[] = [
  // SA01
  { id: 'SA01.01', title: 'Executive dashboard', priority: 'P0', route: '/', tab: '', screen: 'Executive dashboard', interactions: 'Global scope bar (period, comparison, currency, company, plan, product, region); metric cards with provenance + freshness; card → scoped drill-down; exceptions rail', states: ALL, decisions: ['D08', 'D19'], coverage: 'assumption', note: '"Product" dimension is not defined elsewhere in the spec — modelled as a configurable taxonomy.' },
  { id: 'SA01.02', title: 'Drill-down and saved views', priority: 'P1', route: '/reports', tab: 'views', screen: 'Reports › Saved views', interactions: 'Drill path breadcrumb (platform → company → workspace → user → feature → task → attempt); save / rename / delete personal view; export permitted rows; server-denied fields shown as Restricted', states: ALL, decisions: ['D14'], coverage: 'designed' },
  { id: 'SA01.03', title: 'Forecast and margin monitoring', priority: 'P1', route: '/', tab: '', screen: 'Executive dashboard › Forecast panel', interactions: 'Actual-to-date vs forecast vs budget with method + confidence; insufficient-history state; horizon / min-history / budget / recipients config', states: ALL, decisions: ['D12'], coverage: 'designed' },
  { id: 'SA01.04', title: 'Scheduled reports and exports', priority: 'P1', route: '/reports', tab: 'scheduled', screen: 'Reports › Scheduled & exports', interactions: 'Preview → recipients (allowlist) → schedule → enable; async export jobs with expiry; bounded delivery retries', states: ALL, decisions: ['D13'], coverage: 'designed' },
  // SA02
  { id: 'SA02.01', title: 'Company lifecycle', priority: 'P0', route: '/customers', tab: '', screen: 'Customers list + Customer 360 header', interactions: 'Lifecycle state filter; create company; suspend / restore / schedule closure with reason, effective time and in-flight policy preview', states: ALL, decisions: ['D20'], coverage: 'assumption', note: 'In-flight cancellation rule on suspension is an open policy — exposed as a per-action choice.' },
  { id: 'SA02.02', title: 'Workspace and membership', priority: 'P0', route: '/customers/CO-10482', tab: 'workspaces', screen: 'Customer 360 › Workspaces & members', interactions: 'Invite / revoke / assign role / transfer ownership; paid-seat impact preview before confirm; seat cap; multi-company membership indicator', states: ALL, decisions: ['D03'], coverage: 'designed' },
  { id: 'SA02.03', title: 'Customer account 360', priority: 'P0', route: '/customers/CO-10482', tab: 'overview', screen: 'Customer 360 › Overview', interactions: 'Search by ID / domain / billing ref with stable-ID disambiguation; sections gated by role; last-sync per feed', states: ALL, decisions: ['D14'], coverage: 'designed' },
  { id: 'SA02.04', title: 'Closure and data requests', priority: 'P0', route: '/customers/CO-10482', tab: 'data', screen: 'Customer 360 › Closure & data requests', interactions: 'Scope preview → confirm → queued jobs per store; retained records with reasons; backup expiry dates', states: ALL, decisions: ['D13'], coverage: 'designed' },
  // SA03
  { id: 'SA03.01', title: 'Task and attempt metering', priority: 'P0', route: '/usage', tab: 'tasks', screen: 'Usage › Tasks & task tree', interactions: 'Filters (company, feature, model, status, task, environment); root task tree with attempts, tools, child agents; pending vs rated', states: ALL, decisions: ['D05'], coverage: 'designed' },
  { id: 'SA03.02', title: 'Versioned provider rates', priority: 'P0', route: '/usage', tab: 'rates', screen: 'Usage › Rate catalogue', interactions: 'Effective-dated rate versions; add future rate; contract source; unrated exception queue', states: ALL, decisions: ['D15'], coverage: 'designed' },
  { id: 'SA03.03', title: 'Non-token and shared costs', priority: 'P0', route: '/usage', tab: 'shared', screen: 'Usage › Non-token & shared costs', interactions: 'Direct vs allocated split; allocation driver + version; unallocated remainder; invoice tie-out', states: ALL, decisions: ['D09'], coverage: 'assumption' },
  { id: 'SA03.04', title: 'Provider reconciliation', priority: 'P0', route: '/usage', tab: 'reconcile', screen: 'Usage › Provider reconciliation', interactions: 'Import/sync statement; match keys; variance vs tolerance; linked adjustment with reason; mark reconciled only when clear', states: ALL, decisions: ['D18'], coverage: 'designed' },
  // SA04
  { id: 'SA04.01', title: 'Credit buckets and balance', priority: 'P0', route: '/credits', tab: 'buckets', screen: 'Credits › Buckets & balance', interactions: 'Granted / available / reserved / spent / expired per bucket; spend order; user sublimits ≤ company pool; conversion version', states: ALL, decisions: ['D01', 'D03', 'D06'], coverage: 'assumption' },
  { id: 'SA04.02', title: 'Reservation and settlement', priority: 'P0', route: '/credits', tab: 'reservations', screen: 'Credits › Reservations', interactions: 'Active / pending-unknown / settled reservations; settle-once trace; timeout and recovery policy', states: ALL, decisions: ['D05', 'D12'], coverage: 'assumption' },
  { id: 'SA04.03', title: 'Immutable ledger and adjustments', priority: 'P0', route: '/credits', tab: 'ledger', screen: 'Credits › Ledger', interactions: 'Chronological entries with opening/closing balance; linked correction with reason; max amount + second-review threshold; duplicate-ignored rows', states: ALL, decisions: ['D14'], coverage: 'designed' },
  { id: 'SA04.04', title: 'Top-ups, exhaustion, refunds', priority: 'P0', route: '/credits', tab: 'exhaustion', screen: 'Credits › Exhaustion & top-ups', interactions: 'Stop / approved overage / auto top-up policy; min balance, amount, monthly cap; failed top-up retry log', states: ALL, decisions: ['D04'], coverage: 'assumption' },
  // SA05
  { id: 'SA05.01', title: 'Plan and entitlement catalogue', priority: 'P0', route: '/plans', tab: 'catalogue', screen: 'Plans › Catalogue & versions', interactions: 'Draft → preview → publish version; explicit eligibility / migration choice; overrides with reason + expiry', states: ALL, decisions: ['D07'], coverage: 'designed' },
  { id: 'SA05.02', title: 'Credit pricing and rules', priority: 'P0', route: '/plans', tab: 'pricing', screen: 'Plans › Sell-rate policy', interactions: 'Resource → credit rates; precision + rounding stage; sample-task charge preview; effective-dated publish', states: ALL, decisions: ['D01', 'D02'], coverage: 'assumption' },
  { id: 'SA05.03', title: 'Trials, promotions, contracts', priority: 'P0', route: '/plans', tab: 'offers', screen: 'Plans › Trials, promos & contracts', interactions: 'Offer eligibility, expiry, limits; coupon stacking rule; contract precedence; trial cost tagging', states: ALL, decisions: ['D07'], coverage: 'assumption', note: 'Coupon stacking rule is unspecified — exposed as configurable option.' },
  { id: 'SA05.04', title: 'Subscription lifecycle changes', priority: 'P0', route: '/plans', tab: 'changes', screen: 'Plans › Subscription change preview', interactions: 'Immediate vs next-cycle; proration; allowance reset; seat/storage conflict; payment-gated upgrade', states: ALL, decisions: ['D07'], coverage: 'assumption' },
  // SA06
  { id: 'SA06.01', title: 'Subscription and usage invoicing', priority: 'P0', route: '/billing', tab: 'invoices', screen: 'Billing › Invoices & unbilled usage', interactions: 'Unbilled preview; finalization cutoff; line items linked to meters; late-usage policy; credit/debit notes', states: ALL, decisions: ['D18'], coverage: 'assumption' },
  { id: 'SA06.02', title: 'Payments and webhooks', priority: 'P0', route: '/billing', tab: 'payments', screen: 'Billing › Payment events', interactions: 'Verified / invalid-signature / duplicate / out-of-order events; replay with permission; exception resolution', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA06.03', title: 'Collections and past due', priority: 'P0', route: '/billing', tab: 'collections', screen: 'Billing › Collections', interactions: 'Aging buckets; next collection action; retry schedule; grace period; suspension scope; write-off authority', states: ALL, decisions: ['D20'], coverage: 'assumption' },
  { id: 'SA06.04', title: 'Refunds, disputes, tax handoff', priority: 'P0', route: '/billing', tab: 'refunds', screen: 'Billing › Refunds & disputes', interactions: 'Refund preview (cash, credit reversal, retained provider cost); reason codes; dispute restrictions; accounting export status', states: ALL, decisions: ['D08'], coverage: 'partial', note: 'Tax engine fields depend on the chosen finance/tax provider — shown as integration placeholder.' },
  // SA07
  { id: 'SA07.01', title: 'Revenue and expense classification', priority: 'P0', route: '/profitability', tab: 'classification', screen: 'Profitability › Classification', interactions: 'Chart-of-account mapping; service vs operating (mutually exclusive); recognition schedule; period close status', states: ALL, decisions: ['D08'], coverage: 'assumption' },
  { id: 'SA07.02', title: 'Customer and feature unit economics', priority: 'P0', route: '/profitability', tab: 'unit', screen: 'Profitability › Unit economics', interactions: 'Company / plan / feature / model table; direct vs allocated cost; feature rows show cost only when revenue not attributable; thresholds', states: ALL, decisions: ['D08', 'D09'], coverage: 'designed' },
  { id: 'SA07.03', title: 'Operating result and cash', priority: 'P0', route: '/profitability', tab: 'operating', screen: 'Profitability › Operating result & cash', interactions: 'Accrual P&L beside cash movements; prepaid provider balance; completeness labels per line', states: ALL, decisions: ['D08'], coverage: 'designed' },
  { id: 'SA07.04', title: 'Currency, close, corrections', priority: 'P0', route: '/profitability', tab: 'close', screen: 'Profitability › FX & period close', interactions: 'FX source + rate date; close / reopen (permission); linked corrections; missing FX → unavailable', states: ALL, decisions: ['D19'], coverage: 'assumption' },
  // SA08
  { id: 'SA08.01', title: 'Attribution and identity linkage', priority: 'P0', route: '/growth', tab: 'attribution', screen: 'Acquisition › Attribution', interactions: 'First/last touch with confidence; Unknown preserved; identity links; attribution model + lookback config', states: ALL, decisions: ['D10'], coverage: 'assumption' },
  { id: 'SA08.02', title: 'Spend imports and CAC', priority: 'P0', route: '/growth', tab: 'cac', screen: 'Acquisition › Spend & CAC', interactions: 'Spend import status; channel mapping; ad-only vs fully loaded CAC; n.a. on zero denominators', states: ALL, decisions: ['D10'], coverage: 'assumption' },
  { id: 'SA08.03', title: 'Funnel and activation cohorts', priority: 'P1', route: '/growth', tab: 'funnel', screen: 'Acquisition › Funnel & cohorts', interactions: 'Declared population unit; conversion window; immature cohort labels; drill into progressed / stalled accounts', states: ALL, decisions: ['D10', 'D11'], coverage: 'designed' },
  { id: 'SA08.04', title: 'CAC payback and lifetime contribution', priority: 'P1', route: '/growth', tab: 'payback', screen: 'Acquisition › Payback & LTV', interactions: 'Observed contribution vs modelled projection side-by-side; assumption version + date; unavailable for new cohorts', states: ALL, decisions: ['D10'], coverage: 'designed' },
  // SA09
  { id: 'SA09.01', title: 'Activation and feature adoption', priority: 'P0', route: '/adoption', tab: 'activation', screen: 'Adoption › Activation & features', interactions: 'Eligible vs active populations; activity definition; unused paid seats; staff/test exclusion', states: ALL, decisions: ['D11'], coverage: 'assumption' },
  { id: 'SA09.02', title: 'Task success and feedback', priority: 'P0', route: '/adoption', tab: 'success', screen: 'Adoption › Task success', interactions: 'Technical completion vs accepted vs rejected vs unknown; cost per useful outcome incl. retries', states: ALL, decisions: ['D11'], coverage: 'assumption', note: 'Depends on SA10.04 (P1) for version join — see contradiction C02.' },
  { id: 'SA09.03', title: 'Churn and revenue retention', priority: 'P0', route: '/adoption', tab: 'retention', screen: 'Adoption › Revenue retention', interactions: 'Revenue bridge (opening → expansion → contraction → churn → closing); GRR / NRR; n.a. on zero opening', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA09.04', title: 'Customer health and support burden', priority: 'P1', route: '/adoption', tab: 'health', screen: 'Adoption › Account health', interactions: 'Transparent signals + reasons; missing signals visible; manual override keeps computed values; advisory only', states: ALL, decisions: [], coverage: 'designed' },
  // SA10
  { id: 'SA10.01', title: 'Provider and model registry', priority: 'P0', route: '/ai', tab: 'registry', screen: 'Models › Registry', interactions: 'Register / validate / enable for plans & environments; secrets masked; retired models block new routes', states: ALL, decisions: ['D15'], coverage: 'designed' },
  { id: 'SA10.02', title: 'Routing, fallback, caching', priority: 'P0', route: '/ai', tab: 'routing', screen: 'Models › Routing & fallback', interactions: 'Ordered fallbacks with eligibility checks (region, privacy, plan); route preview with reasons; tenant-scoped cache TTL', states: ALL, decisions: ['D15'], coverage: 'designed' },
  { id: 'SA10.03', title: 'Agent and workflow guardrails', priority: 'P0', route: '/ai', tab: 'guardrails', screen: 'Models › Agent guardrails', interactions: 'Step / spend / duration / retry / tool scope limits; irreversible-action authorization; termination reasons log', states: ALL, decisions: ['D12'], coverage: 'designed' },
  { id: 'SA10.04', title: 'Prompt versions and evaluations', priority: 'P1', route: '/ai', tab: 'evals', screen: 'Models › Prompt versions & evals', interactions: 'Candidate vs current on dataset; quality / safety / latency / cost; release cohort; rollback threshold; approver', states: ALL, decisions: ['D13'], coverage: 'designed' },
  // SA11
  { id: 'SA11.01', title: 'Knowledge sources and sync', priority: 'P0', route: '/knowledge', tab: 'sources', screen: 'Knowledge › Sources & sync', interactions: 'Sync progress, last success, doc counts, failures, ingestion cost; pause / retry failed items only', states: ALL, decisions: [], coverage: 'designed', note: 'Conditional: mandatory before RAG launch.' },
  { id: 'SA11.02', title: 'Retrieval permissions and indexing', priority: 'P0', route: '/knowledge', tab: 'retrieval', screen: 'Knowledge › Retrieval & index', interactions: 'Namespace status; ACL freshness; fail-closed on stale ACL; reindex / cleanup', states: ALL, decisions: ['D17'], coverage: 'assumption' },
  { id: 'SA11.03', title: 'Connector credentials', priority: 'P0', route: '/knowledge', tab: 'connectors', screen: 'Knowledge › Connectors', interactions: 'Scopes, token health, expiry; revoke / reconnect with affected-jobs preview', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA11.04', title: 'Storage and lifecycle costs', priority: 'P0', route: '/knowledge', tab: 'storage', screen: 'Knowledge › Storage lifecycle', interactions: 'By object class vs plan quota; billing basis (current/avg/peak); cleanup preview with remaining derived copies + backup expiry', states: ALL, decisions: ['D09'], coverage: 'assumption' },
  // SA12
  { id: 'SA12.01', title: 'Hierarchical spend and rate limits', priority: 'P0', route: '/controls', tab: 'limits', screen: 'Controls › Limits hierarchy', interactions: 'Platform → provider → company → user → feature → task; most-restrictive wins; denial reason + reset; max in-flight exposure', states: ALL, decisions: ['D12'], coverage: 'assumption' },
  { id: 'SA12.02', title: 'Kill switches', priority: 'P0', route: '/controls', tab: 'kill', screen: 'Controls › Kill switches', interactions: 'Scope + mode (stop-new / cancel-running); impact preview; reason + incident ref; propagation status; uncertainty notice', states: ALL, decisions: ['D17'], coverage: 'designed' },
  { id: 'SA12.03', title: 'Abuse and trial protection', priority: 'P0', route: '/controls', tab: 'abuse', screen: 'Controls › Abuse & trials', interactions: 'Explainable risk events with evidence; temporary throttle with expiry; review path', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA12.04', title: 'Alert routing and escalation', priority: 'P0', route: '/controls', tab: 'alerts', screen: 'Controls › Alerts & incidents', interactions: 'A01–A12 rules; grouped incidents; acknowledge; escalation timer; delivery failures; suppression expiry', states: ALL, decisions: ['D20'], coverage: 'designed' },
  // SA13
  { id: 'SA13.01', title: 'Admin roles, MFA, sessions', priority: 'P0', route: '/security', tab: 'roles', screen: 'Security › Admins, roles & sessions', interactions: 'Role grants with tenant scope; MFA policy; session list + revoke; emergency access with expiry', states: ALL, decisions: ['D14', 'D17'], coverage: 'designed' },
  { id: 'SA13.02', title: 'Audit trail', priority: 'P0', route: '/security', tab: 'audit', screen: 'Security › Audit trail', interactions: 'Append-only search; before/after; reason; reviewer; authorized export; edit denied', states: ALL, decisions: ['D14'], coverage: 'designed' },
  { id: 'SA13.03', title: 'Data handling and retention', priority: 'P0', route: '/security', tab: 'retention', screen: 'Security › Data policies', interactions: 'Per-category retention class; content logging opt-in; redaction; region; training/eval eligibility', states: ALL, decisions: ['D13'], coverage: 'assumption' },
  { id: 'SA13.04', title: 'Controlled support access', priority: 'P0', route: '/security', tab: 'support-access', screen: 'Security › Support sessions + persistent banner', interactions: 'Open session (reason, scope, duration, read-only default, customer approval rule); persistent banner; end / auto-expire', states: ALL, decisions: ['D14'], coverage: 'assumption', note: 'Depends on SA15.01 (P1) — see contradiction C01.' },
  // SA14
  { id: 'SA14.01', title: 'Event pipeline and freshness', priority: 'P0', route: '/operations', tab: 'pipeline', screen: 'Operations › Pipeline & freshness', interactions: 'Ingestion / processing / rejected / reconciliation queues; lag vs freshness target; idempotent replay', states: ALL, decisions: ['D17'], coverage: 'designed' },
  { id: 'SA14.02', title: 'Service health and jobs', priority: 'P0', route: '/operations', tab: 'jobs', screen: 'Operations › Health & jobs', interactions: 'Latency / error / queue by tenant & feature; pause queue; retry eligible (not unknown-outcome); job states incl. Unknown', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA14.03', title: 'Backups, recovery, integrity', priority: 'P0', route: '/operations', tab: 'backups', screen: 'Operations › Backups & recovery', interactions: 'Backup status; RPO/RTO targets; drill results; post-restore reconciliation against external watermark', states: ALL, decisions: ['D17'], coverage: 'assumption' },
  { id: 'SA14.04', title: 'Admin configuration releases', priority: 'P1', route: '/operations', tab: 'releases', screen: 'Operations › Config releases', interactions: 'Version diff; sample impact; target cohort; approval; intended vs observed rollout; rollback (future only)', states: ALL, decisions: ['D07'], coverage: 'designed' },
  // SA15
  { id: 'SA15.01', title: 'Support cases and cost-to-serve', priority: 'P1', route: '/support', tab: 'cases', screen: 'Support › Cases', interactions: 'Assign; link task / invoice / incident; effort + cost rate; SLA target; single cost classification', states: ALL, decisions: ['D09'], coverage: 'designed' },
  { id: 'SA15.02', title: 'Customer notifications', priority: 'P0', route: '/support', tab: 'notifications', screen: 'Support › Notifications & templates', interactions: 'Template versions + language; variable preview; recipient role; cooldown dedupe; delivery status', states: ALL, decisions: ['D20'], coverage: 'partial', note: 'Localized template content beyond English not designed.' },
  { id: 'SA15.03', title: 'Billing explanation and evidence', priority: 'P0', route: '/support', tab: 'evidence', screen: 'Support › Billing evidence', interactions: 'Invoice line → billable tasks → sell-rate version; adjustments; customer-safe export (no provider cost)', states: ALL, decisions: ['D02'], coverage: 'designed' },
  { id: 'SA15.04', title: 'Service credits and goodwill', priority: 'P1', route: '/support', tab: 'goodwill', screen: 'Support › Goodwill grant', interactions: 'Preview recipient, bucket, expiry; approval threshold; idempotent grant; separate from cash refund', states: ALL, decisions: ['D14'], coverage: 'designed' },
  // SA16
  { id: 'SA16.01', title: 'API keys and service accounts', priority: 'P0', route: '/developer', tab: 'keys', screen: 'Developer › API keys', interactions: 'Create (secret shown once) / rotate / revoke; scopes; feature/model allowlist; IP restriction; independent limits', states: ALL, decisions: [], coverage: 'designed', note: 'Conditional: mandatory before public API launch.' },
  { id: 'SA16.02', title: 'Outbound webhooks', priority: 'P1', route: '/developer', tab: 'webhooks', screen: 'Developer › Webhooks', interactions: 'Register endpoint (blocked internal addresses); subscriptions; signing-secret rotation; failures + replay by event ID; pause', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA16.03', title: 'Environment separation', priority: 'P0', route: '/developer', tab: 'environments', screen: 'Developer › Environments + global env indicator', interactions: 'Env switcher in top bar; credential & payment modes; internal-traffic exclusion toggle in reports', states: ALL, decisions: [], coverage: 'designed' },
  { id: 'SA16.04', title: 'Bring-your-own-key policy', priority: 'P1', route: '/developer', tab: 'byok', screen: 'Developer › BYOK', interactions: 'Mark company BYOK; key health; fallback consent (no silent fallback); customer-paid cost shown as estimated external spend', states: ALL, decisions: ['D16'], coverage: 'assumption', note: 'Conditional: required before launch only if BYOK is sold (D16).' },
]

export function featuresFor(moduleId: string) {
  return FEATURES.filter((f) => f.id.startsWith(moduleId + '.'))
}

export function feature(id: string) {
  return FEATURES.find((f) => f.id === id)
}

export function featureHref(f: Feature) {
  return f.tab ? `${f.route}?tab=${f.tab}` : f.route
}

export type Decision = {
  id: string
  title: string
  question: string
  options: string[]
  assumed: number
  affects: string[]
  owner: string
}

export const DECISIONS: Decision[] = [
  { id: 'D01', title: 'Commercial unit', question: 'Credits, raw tokens, successful tasks, seats, or a hybrid?', options: ['Credits + subscription (hybrid)', 'Raw provider tokens', 'Successful tasks', 'Seats only'], assumed: 0, affects: ['SA04.01', 'SA05.02'], owner: 'Founder / Product' },
  { id: 'D02', title: 'Credit conversion and rounding', question: 'How does each model/resource consume credits, and when is rounding applied?', options: ['Round once at task settlement', 'Round per operation', 'Round at invoice aggregation'], assumed: 0, affects: ['SA05.02', 'SA15.03'], owner: 'Product / Finance' },
  { id: 'D03', title: 'Allowance ownership', question: 'Company pool, individual allowance, or both?', options: ['Company pool + optional user sublimits', 'Company pool only', 'Per-user allowance only'], assumed: 0, affects: ['SA04.01', 'SA02.02'], owner: 'Product' },
  { id: 'D04', title: 'Exhaustion and overages', question: 'Stop, degrade, top up, or bill later?', options: ['Stop (default)', 'Bounded auto top-up (opt-in)', 'Approved overage billed later', 'Degrade to cheaper model'], assumed: 0, affects: ['SA04.04'], owner: 'Founder / Product' },
  { id: 'D05', title: 'Failure and cancellation charges', question: 'Which retries, partial results and cancellations are customer billable?', options: ['Bill successful attempts only; absorb retries', 'Bill all incurred usage', 'Bill partial results pro-rata'], assumed: 0, affects: ['SA03.01', 'SA04.02'], owner: 'Product / Finance' },
  { id: 'D06', title: 'Credit expiry and rollover', question: 'When do included and purchased credits expire?', options: ['Included: period end, no rollover · Purchased: 12 months', 'Included: rollover 1 period · Purchased: never', 'Configured per contract'], assumed: 0, affects: ['SA04.01'], owner: 'Product / Finance' },
  { id: 'D07', title: 'Plan migration and proration', question: 'When do upgrades/downgrades change prices, access and allowance?', options: ['Upgrade immediate + prorated; downgrade next cycle', 'All changes next cycle', 'All changes immediate'], assumed: 0, affects: ['SA05.01', 'SA05.03', 'SA05.04', 'SA14.04'], owner: 'Product / Finance' },
  { id: 'D08', title: 'Revenue and cost classification', question: 'Which expenses are service cost, operating expense, or contribution deductions?', options: ['Finance-supplied chart of accounts mapping', 'Default: AI + infra = service cost; rest = opex'], assumed: 1, affects: ['SA01.01', 'SA06.04', 'SA07.01', 'SA07.02', 'SA07.03'], owner: 'Finance' },
  { id: 'D09', title: 'Shared cost allocation', question: 'Which drivers allocate hosting, support and storage?', options: ['Usage-weighted (rated cost share)', 'Equal per active company', 'Storage GB-month / support hours'], assumed: 2, affects: ['SA03.03', 'SA07.02', 'SA11.04', 'SA15.01'], owner: 'Finance / Engineering' },
  { id: 'D10', title: 'Attribution and CAC', question: 'What counts as acquisition, a new customer and the attribution window?', options: ['First paid company · 90-day lookback · first touch', 'First paid company · 30-day · last touch', 'Signed contract · 180-day · position-based'], assumed: 0, affects: ['SA08.01', 'SA08.02', 'SA08.03', 'SA08.04'], owner: 'Marketing / Finance' },
  { id: 'D11', title: 'Activation and success', question: 'Which events prove first value and successful outcome?', options: ['Accepted outcome event per feature', 'Any completed task', 'Customer-defined per contract'], assumed: 0, affects: ['SA08.03', 'SA09.01', 'SA09.02'], owner: 'Product / AI lead' },
  { id: 'D12', title: 'Budget exposure', question: 'Acceptable spend limits, in-flight exposure, wallet-unavailable policy?', options: ['Fail closed when wallet unavailable', 'Capped emergency allowance (configurable)'], assumed: 0, affects: ['SA01.03', 'SA04.02', 'SA10.03', 'SA12.01'], owner: 'Founder / Engineering' },
  { id: 'D13', title: 'Customer data policy', question: 'Are prompts/responses retained or reused for evaluation/training?', options: ['No content logging by default; opt-in per tenant', 'Redacted logging 30 days', 'Full logging with contract consent'], assumed: 0, affects: ['SA01.04', 'SA02.04', 'SA10.04', 'SA13.03'], owner: 'Security / Product' },
  { id: 'D14', title: 'Roles and sensitive approvals', question: 'Who can see margins, refund, grant credits, access tenant data?', options: ['Second reviewer above threshold', 'Second reviewer always', 'Single authorized role'], assumed: 0, affects: ['SA01.02', 'SA02.03', 'SA04.03', 'SA13.01', 'SA13.02', 'SA13.04', 'SA15.04'], owner: 'Founder / Security' },
  { id: 'D15', title: 'Provider / model / region support', question: 'Which models, tools, regions and fallbacks at launch?', options: ['Only priced + instrumented routes', 'Allow unpriced routes in staging only'], assumed: 0, affects: ['SA03.02', 'SA10.01', 'SA10.02'], owner: 'AI lead / Engineering' },
  { id: 'D16', title: 'BYOK', question: 'Will customers supply their own upstream credentials?', options: ['Deferred (feature flag off)', 'Enterprise only', 'All paid plans'], assumed: 0, affects: ['SA16.04'], owner: 'Founder / Product' },
  { id: 'D17', title: 'Recovery and propagation targets', question: 'Wallet recovery, access revocation and kill-switch delay targets?', options: ['Placeholder targets shown as "TBD"', 'Proposed: revocation ≤ 60 s, kill switch ≤ 30 s, RPO 5 min'], assumed: 0, affects: ['SA11.02', 'SA12.02', 'SA13.01', 'SA14.01', 'SA14.03'], owner: 'Engineering / Security' },
  { id: 'D18', title: 'Billing boundaries and late events', question: 'Billing timezone, cutoff and late usage rules?', options: ['Customer billing TZ · late usage → next invoice', 'UTC · late usage → adjustment note'], assumed: 0, affects: ['SA03.04', 'SA06.01'], owner: 'Finance / Engineering' },
  { id: 'D19', title: 'Currencies and close', question: 'Reporting currency, FX source and close/reopen policy?', options: ['USD reporting · daily ECB ref rate · reopen by Finance + Owner', 'Per-entity currency · monthly average rate'], assumed: 0, affects: ['SA01.01', 'SA07.04'], owner: 'Finance' },
  { id: 'D20', title: 'Notification and collection policy', question: 'Recipients, retry, grace and escalation rules?', options: ['Role-based contacts · 4 retries / 14 days · 7-day grace', 'Billing contact only · 3 retries / 7 days · no grace'], assumed: 0, affects: ['SA02.01', 'SA06.03', 'SA12.04', 'SA15.02'], owner: 'Operations / Finance' },
]

export const CONTRADICTIONS = [
  { id: 'C01', title: 'P0 depends on P1: support access → support cases', detail: 'SA13.04 (P0) lists SA15.01 (P1) as a dependency. Design: support sessions require a free-text case reference at P0; linking to a SA15.01 case record becomes mandatory once SA15.01 ships.', features: ['SA13.04', 'SA15.01'] },
  { id: 'C02', title: 'P0 depends on P1: task success → prompt versions', detail: 'SA09.02 (P0) depends on SA10.04 (P1) to join feedback to model/prompt version. Design: capture model ID and prompt version ID on every task at P0 (SA03.01); evaluation releases remain P1.', features: ['SA09.02', 'SA10.04'] },
  { id: 'C03', title: 'Overlapping versioning: P0 plan/pricing publish vs P1 config releases', detail: 'SA05.01/05.02 (P0) require draft → preview → publish with effective dates, but staged rollout, cohort targeting and rollback evidence are owned by SA14.04 (P1). Design: P0 publish is all-or-nothing with explicit migration; cohort rollout controls render disabled with a "P1 · SA14.04" tag.', features: ['SA05.01', 'SA05.02', 'SA14.04'] },
  { id: 'C04', title: 'Role matrix grants a P1 capability', detail: 'Roles table gives Support "approved goodwill grants", but SA15.04 is P1. Design: goodwill action hidden behind P1 flag; at P0 support can only request a credit adjustment through SA04.03 (Finance approves).', features: ['SA15.04', 'SA04.03', 'SA13.01'] },
  { id: 'C05', title: 'Support labor counted in two places', detail: 'D09 lists support as a shared-cost driver (SA03.03) while SA15.01 records support effort for contribution (SA07.02). Design: a single "Support labor classification" setting — service cost OR contribution deduction — enforced as mutually exclusive.', features: ['SA03.03', 'SA07.02', 'SA15.01'] },
  { id: 'C06', title: 'Customer-facing alert vs notification ownership', detail: 'Alert A01 routes to the "account billing contact", which is customer communication owned by SA15.02 rather than internal alert routing (SA12.04). Design: internal alerts route to admin groups; customer messages are emitted only via SA15.02 templates.', features: ['SA12.04', 'SA15.02'] },
  { id: 'C07', title: 'Deletion requests vs retained financial / audit records', detail: 'SA02.04 deletion and SA13.02 append-only audit / financial retention pull in opposite directions. Not a true conflict: design shows per-store outcomes with retention class and legal reason, never "fully deleted".', features: ['SA02.04', 'SA13.02', 'SA13.03'] },
]

export const GAPS = [
  { id: 'G01', title: 'Customer-facing surfaces not designed', detail: 'SA05.02 acceptance requires the same charge in "customer usage history"; SA04.04 says the customer "sees balance and charge consequences". Only the admin mirror of these views is designed.', features: ['SA05.02', 'SA04.04'] },
  { id: 'G02', title: 'Server-side guarantees cannot be proven in UI', detail: 'Atomic reservation, idempotency, server authorization and propagation targets are represented by indicators and states; they need API/integration tests.', features: ['SA04.02', 'SA13.01', 'SA14.01', 'SA06.02'] },
  { id: 'G03', title: '"Product" dimension undefined', detail: 'SA01.01 filters by "product" but no module defines a product taxonomy distinct from features. Modelled as a configurable taxonomy pending definition.', features: ['SA01.01'] },
  { id: 'G04', title: 'Tax and payment provider specifics', detail: 'Tax result fields and payment-provider mappings depend on the chosen provider; screens show integration placeholders.', features: ['SA06.01', 'SA06.04'] },
  { id: 'G05', title: 'Localized templates', detail: 'Language selector exists; non-English template content and RTL layouts are not designed.', features: ['SA15.02'] },
  { id: 'G06', title: 'Propagation & recovery targets are TBD', detail: 'D17 open: revocation delay, kill-switch propagation and RPO/RTO render as "Target: TBD" rather than invented numbers.', features: ['SA12.02', 'SA13.01', 'SA14.03', 'SA11.02'] },
  { id: 'G07', title: 'Metric dictionary not reproduced', detail: 'Each metric links to a definition version ID; the full dictionary (spec §Metric dictionary) is referenced, not re-rendered.', features: ['SA01.01', 'SA01.02'] },
  { id: 'G08', title: 'Responsive / mobile layouts', detail: 'Designs are desktop-first (≥1280 px). Tablet and mobile breakpoints are not designed.', features: [] },
]

export const FLOWS = [
  { id: 'A', title: 'One AI task: request → final charge', steps: ['Authenticate & resolve tenant/env (SA16.03)', 'Load entitlements + pricing versions (SA05.01, SA05.02)', 'Atomic reservation or deny (SA04.02, SA12.01)', 'Route to approved model (SA10.02)', 'Execute within guardrails (SA10.03)', 'Persist usage, rate cost (SA03.01, SA03.02)', 'Settle once, release remainder (SA04.02)', 'Emit meters, invoice (SA06.01)', 'Reconcile provider statements (SA03.04)'], screens: ['/usage?tab=tasks', '/credits?tab=reservations', '/usage?tab=reconcile'] },
  { id: 'B', title: 'Plan change', steps: ['Open company 360 › Subscription', 'Preview effective date, proration, seat/storage conflicts, credit effect (SA05.04)', 'Confirm with reason (SA13.02)', 'Entitlement change scheduled; payment-gated if upgrade (SA06.02)'], screens: ['/plans?tab=changes', '/customers/CO-10482'] },
  { id: 'C', title: 'Refund or support correction', steps: ['Locate invoice line / task (SA15.03)', 'Preview cash, credit reversal, retained provider cost (SA06.04)', 'Confirm within role limits (SA13.01)', 'Idempotent external refund + linked ledger entries (SA04.03)', 'Goodwill as a separate transaction (SA15.04)'], screens: ['/support?tab=evidence', '/billing?tab=refunds', '/credits?tab=ledger'] },
  { id: 'D', title: 'Provider outage or runaway agent', steps: ['Alert grouped into incident (SA12.04)', 'Check fallback eligibility (SA10.02)', 'Activate kill switch with impact preview (SA12.02)', 'Track incurred cost of started calls (SA03.01)', 'Audited restoration (SA13.02)'], screens: ['/controls?tab=alerts', '/controls?tab=kill', '/ai?tab=routing'] },
  { id: 'E', title: 'Month-end profitability review', steps: ['Reconcile provider statements (SA03.04)', 'Resolve unrated / unmatched (SA03.02, SA14.01)', 'Verify shared allocations (SA03.03)', 'Check FX (SA07.04)', 'Close period (SA07.04)', 'Post later corrections as linked entries'], screens: ['/usage?tab=reconcile', '/profitability?tab=close', '/profitability?tab=unit'] },
  { id: 'F', title: 'Suspend a past-due company', steps: ['Collections shows aging past grace (SA06.03)', 'Open company 360 → Suspend (SA02.01)', 'Choose in-flight policy; preview queued jobs', 'Customer notified via template (SA15.02)', 'Verified payment restores eligible entitlements only'], screens: ['/billing?tab=collections', '/customers/CO-10482', '/support?tab=notifications'] },
]
