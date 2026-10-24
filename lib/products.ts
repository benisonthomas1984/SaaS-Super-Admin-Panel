export type ProductStatus = 'draft' | 'testing' | 'active' | 'suspended' | 'archived'
export type ConnectionState = 'not_connected' | 'testing' | 'connected' | 'degraded'
export type ExecutionMode = 'instrumented_direct' | 'central_gateway' | 'telemetry_only'
export type BillingOwner = 'central' | 'external'

export type PackageVersion = {
  id: string
  label: string
  status: 'draft' | 'published' | 'retired'
  effectiveFrom: string
  credits: string
  subscribers: number
}

export type ProductPackage = {
  id: string
  name: string
  slug: string
  status: 'draft' | 'active' | 'archived'
  currentVersion: string
  monthly: string
  annual: string
  subscribers: number
  versions: PackageVersion[]
}

export type Product = {
  id: string
  name: string
  slug: string
  owner: string
  appUrl: string
  status: ProductStatus
  connection: ConnectionState
  execution: ExecutionMode
  billingOwner: BillingOwner
  creditUnit: string
  environments: ('production' | 'sandbox')[]
  packages: ProductPackage[]
  accounts: number
  revenue: number
  cost: number
  lastHeartbeat: string
}

const v = (id: string, label: string, status: PackageVersion['status'], effectiveFrom: string, credits: string, subscribers: number): PackageVersion =>
  ({ id, label, status, effectiveFrom, credits, subscribers })

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prd_01HQ7DOCAG', name: 'Document agent', slug: 'doc-agent', owner: 'A. Rivera', appUrl: 'https://docs.example-ai.app',
    status: 'active', connection: 'connected', execution: 'instrumented_direct', billingOwner: 'central', creditUnit: 'doc credit',
    environments: ['production', 'sandbox'], accounts: 214, revenue: 61840, cost: 18210, lastHeartbeat: '14 s ago',
    packages: [
      { id: 'pkg_A_starter', name: 'Starter', slug: 'starter', status: 'active', currentVersion: 'v2', monthly: '$29 / seat', annual: '$290 / seat', subscribers: 121,
        versions: [v('pkv_A_s_2', 'v2', 'published', '2026-08-01', '20,000', 109), v('pkv_A_s_1', 'v1', 'retired', '2026-01-01', '25,000', 12)] },
      { id: 'pkg_A_pro', name: 'Pro', slug: 'pro', status: 'active', currentVersion: 'v3', monthly: '$80 / seat', annual: '$800 / seat', subscribers: 71,
        versions: [v('pkv_A_p_3', 'v3', 'published', '2026-07-01', '120,000', 71), v('pkv_A_p_4', 'v4', 'draft', '2026-11-01', '100,000', 0)] },
      { id: 'pkg_A_biz', name: 'Business', slug: 'business', status: 'active', currentVersion: 'v1', monthly: '$96 / seat', annual: '$960 / seat', subscribers: 22,
        versions: [v('pkv_A_b_1', 'v1', 'published', '2026-03-01', '500,000', 22)] },
    ],
  },
  {
    id: 'prd_01HQ9SUPCO', name: 'Support copilot', slug: 'support-copilot', owner: 'M. Okafor', appUrl: 'https://copilot.example-ai.app',
    status: 'active', connection: 'degraded', execution: 'central_gateway', billingOwner: 'external', creditUnit: 'reply credit',
    environments: ['production', 'sandbox'], accounts: 138, revenue: 37420, cost: 13980, lastHeartbeat: '6 min ago',
    packages: [
      { id: 'pkg_B_starter', name: 'Starter', slug: 'starter', status: 'active', currentVersion: 'v1', monthly: '$19 / agent', annual: '$190 / agent', subscribers: 84,
        versions: [v('pkv_B_s_1', 'v1', 'published', '2026-04-01', '5,000', 84)] },
      { id: 'pkg_B_pro', name: 'Pro', slug: 'pro', status: 'active', currentVersion: 'v1', monthly: '$49 / agent', annual: '$490 / agent', subscribers: 41,
        versions: [v('pkv_B_p_1', 'v1', 'published', '2026-04-01', '25,000', 41)] },
      { id: 'pkg_B_biz', name: 'Business', slug: 'business', status: 'active', currentVersion: 'v1', monthly: '$89 / agent', annual: '$890 / agent', subscribers: 13,
        versions: [v('pkv_B_b_1', 'v1', 'published', '2026-04-01', '80,000', 13)] },
    ],
  },
  {
    id: 'prd_01HR2EXTRA', name: 'Data extraction API', slug: 'extraction-api', owner: 'Unassigned', appUrl: 'https://extract.example-ai.app',
    status: 'testing', connection: 'not_connected', execution: 'telemetry_only', billingOwner: 'central', creditUnit: 'page credit',
    environments: ['sandbox'], accounts: 0, revenue: 0, cost: 0, lastHeartbeat: 'never',
    packages: [
      { id: 'pkg_C_payg', name: 'Pay as you go', slug: 'payg', status: 'draft', currentVersion: 'v1 (draft)', monthly: 'Metered', annual: '—', subscribers: 0,
        versions: [v('pkv_C_pg_1', 'v1', 'draft', '—', 'Metered per page', 0)] },
    ],
  },
]

export const STATUS_TONE: Record<ProductStatus, 'good' | 'warn' | 'bad' | 'neutral' | 'outline'> = {
  draft: 'outline', testing: 'warn', active: 'good', suspended: 'bad', archived: 'neutral',
}

export const CONNECTION_META: Record<ConnectionState, { label: string; tone: 'good' | 'warn' | 'bad' | 'neutral' }> = {
  not_connected: { label: 'Not connected', tone: 'neutral' },
  testing: { label: 'Testing', tone: 'warn' },
  connected: { label: 'Connected', tone: 'good' },
  degraded: { label: 'Degraded', tone: 'bad' },
}

export const EXECUTION_META: Record<ExecutionMode, { label: string; enforcement: string }> = {
  instrumented_direct: { label: 'Instrumented direct', enforcement: 'Hard cap · reserves before every provider call' },
  central_gateway: { label: 'Central gateway', enforcement: 'Hard cap · gateway creates operation IDs' },
  telemetry_only: { label: 'Telemetry only', enforcement: 'Observational · cannot guarantee real-time limits' },
}

export const BILLING_META: Record<BillingOwner, string> = {
  central: 'Central billing — this panel creates charges',
  external: 'External billing — imported; this panel never charges',
}

export type MPRequirement = {
  id: string
  title: string
  screens: string[]
  where: string
  baseline: string
  coverage: 'designed' | 'assumption' | 'partial' | 'backend'
  note?: string
}

export const MP_REQUIREMENTS: MPRequirement[] = [
  { id: 'MP01', title: 'Product registry and lifecycle', screens: ['S01', 'S02'], where: '/products', baseline: 'SA01 SA02 SA16', coverage: 'designed' },
  { id: 'MP02', title: 'Packages belong to a product', screens: ['S03', 'S04'], where: '/products/prd_01HQ7DOCAG?tab=packages', baseline: 'SA05.01 SA05.04', coverage: 'designed' },
  { id: 'MP03', title: 'Immutable package versions and publishing', screens: ['S04', 'S05'], where: '/products/prd_01HQ7DOCAG?tab=versions', baseline: 'SA05.01 SA05.04 SA14.04', coverage: 'designed' },
  { id: 'MP04', title: 'Package prices and credit rules', screens: ['S04', 'S05'], where: '/products/prd_01HQ7DOCAG?tab=builder', baseline: 'SA03.02 SA05.02 SA06 SA07', coverage: 'assumption', note: 'Rounding and conversion follow D02; no provider prices assumed.' },
  { id: 'MP05', title: 'Feature and entitlement catalogue', screens: ['S04', 'S10'], where: '/products/prd_01HQ7DOCAG?tab=builder', baseline: 'SA05 SA10 SA12 SA13', coverage: 'designed' },
  { id: 'MP06', title: 'Meters, units and source mappings', screens: ['S04', 'S07'], where: '/products/prd_01HQ7DOCAG?tab=builder', baseline: 'SA03 SA05.02 SA11', coverage: 'designed' },
  { id: 'MP07', title: 'Connection wizard and source ownership', screens: ['S06', 'S07'], where: '/products/prd_01HR2EXTRA?tab=connect', baseline: 'SA16 SA14 SA13', coverage: 'designed' },
  { id: 'MP08', title: 'Scoped credentials and environment isolation', screens: ['S08'], where: '/products/prd_01HQ7DOCAG?tab=credentials', baseline: 'SA13 SA16.01 SA16.03', coverage: 'designed' },
  { id: 'MP09', title: 'External account and user mapping', screens: ['S09'], where: '/products/prd_01HQ7DOCAG?tab=accounts', baseline: 'SA02 SA08.01 SA13', coverage: 'designed' },
  { id: 'MP10', title: 'Product subscriptions and effective history', screens: ['S10'], where: '/products/prd_01HQ7DOCAG?tab=subscriptions', baseline: 'SA05.04 SA06 SA09.03', coverage: 'designed' },
  { id: 'MP11', title: 'Runtime entitlement resolution', screens: ['S10', 'S11'], where: '/products/prd_01HQ7DOCAG?tab=subscriptions', baseline: 'SA05 SA12 SA16', coverage: 'assumption', note: 'Cache TTL and outage policy are open (PD03, PD04).' },
  { id: 'MP12', title: 'Product wallets and reservations', screens: ['S11'], where: '/products/prd_01HQ7DOCAG?tab=wallet', baseline: 'SA04 SA12.01', coverage: 'designed', note: 'Atomicity is a backend guarantee; UI simulates the outcome.' },
  { id: 'MP13', title: 'Task, usage and outcome ingestion', screens: ['S12'], where: '/products/prd_01HQ7DOCAG?tab=usage', baseline: 'SA03 SA09.02 SA14.01', coverage: 'designed' },
  { id: 'MP14', title: 'Product and business event ingestion', screens: ['S12', 'S13'], where: '/products/prd_01HQ7DOCAG?tab=usage', baseline: 'SA08 SA09 SA15', coverage: 'designed' },
  { id: 'MP15', title: 'External billing and accounting ingestion', screens: ['S14'], where: '/products/prd_01HQ9SUPCO?tab=finance', baseline: 'SA06 SA07', coverage: 'designed' },
  { id: 'MP16', title: 'Provider costs and shared expense imports', screens: ['S14', 'S15'], where: '/products/prd_01HQ9SUPCO?tab=finance', baseline: 'SA03 SA07 SA16.04', coverage: 'assumption', note: 'Shared allocation driver follows D09.' },
  { id: 'MP17', title: 'Acquisition spend and cross-sell attribution', screens: ['S13'], where: '/products/prd_01HQ7DOCAG?tab=growth', baseline: 'SA08 SA07', coverage: 'assumption', note: 'Attribution window follows D10.' },
  { id: 'MP18', title: 'Product and package analytics', screens: ['S01', 'S02', 'S15'], where: '/products', baseline: 'SA01 SA07 SA08 SA09', coverage: 'designed' },
  { id: 'MP19', title: 'Signed two-way synchronization', screens: ['S16'], where: '/products/prd_01HQ7DOCAG?tab=webhooks', baseline: 'SA16.02 SA06.02 SA13', coverage: 'designed' },
  { id: 'MP20', title: 'Asynchronous jobs, replay and corrections', screens: ['S17'], where: '/products/prd_01HQ7DOCAG?tab=health', baseline: 'SA14.01 SA03.04 SA06', coverage: 'designed' },
  { id: 'MP21', title: 'Readiness, health and coverage', screens: ['S07', 'S17'], where: '/products/prd_01HQ7DOCAG?tab=readiness', baseline: 'SA01 SA14 SA12.04', coverage: 'designed' },
  { id: 'MP22', title: 'Baseline feature preservation and product context', screens: ['S01–S18'], where: '/spec/addendum?tab=baseline', baseline: 'SA01–SA16', coverage: 'designed' },
  { id: 'MP23', title: 'Cross-product identity and financial roll-up', screens: ['S09', 'S14', 'S15'], where: '/products?tab=identity', baseline: 'SA02 SA06 SA07 SA08 SA09', coverage: 'designed' },
  { id: 'MP24', title: 'Product permissions, audit and isolation', screens: ['S08', 'S18'], where: '/products/prd_01HQ7DOCAG?tab=audit', baseline: 'SA13 SA16', coverage: 'partial', note: 'Per-product admin grants designed as a table; product-manager role not yet in the global role switcher.' },
  { id: 'MP25', title: 'API contract and compatibility', screens: ['S06', 'S07', 'S18'], where: '/spec/addendum?tab=api', baseline: 'SA16 SA14', coverage: 'backend', note: 'Endpoint map shown; executable OpenAPI must be produced by engineering.' },
  { id: 'MP26', title: 'Product budgets and emergency controls', screens: ['S02', 'S11', 'S17'], where: '/products/prd_01HQ7DOCAG?tab=wallet', baseline: 'SA12 SA04 SA10.03', coverage: 'designed' },
  { id: 'MP27', title: 'Migration from current implementation', screens: ['S17', 'S18'], where: '/products?tab=migration', baseline: 'SA02–SA07 SA14', coverage: 'designed' },
  { id: 'MP28', title: 'Complete design and integration handoff', screens: ['S01–S18'], where: '/spec/addendum', baseline: 'SA01–SA16', coverage: 'designed' },
]

export const SCREENS = [
  { id: 'S01', title: 'Portfolio dashboard', route: '/products?tab=portfolio', mp: 'MP01 MP18 MP22 MP23' },
  { id: 'S02', title: 'Products list and detail', route: '/products?tab=list', mp: 'MP01 MP18 MP26' },
  { id: 'S03', title: 'Product packages list', route: '/products/[id]?tab=packages', mp: 'MP02' },
  { id: 'S04', title: 'Package builder', route: '/products/[id]?tab=builder', mp: 'MP02–MP06' },
  { id: 'S05', title: 'Version publish and migration', route: '/products/[id]?tab=versions', mp: 'MP03 MP04 MP10' },
  { id: 'S06', title: 'Connect product wizard', route: '/products/[id]?tab=connect', mp: 'MP07 MP25' },
  { id: 'S07', title: 'Connection tests and readiness', route: '/products/[id]?tab=readiness', mp: 'MP06 MP07 MP21' },
  { id: 'S08', title: 'Integration credentials and access', route: '/products/[id]?tab=credentials', mp: 'MP08 MP24' },
  { id: 'S09', title: 'Customer and identity map', route: '/products/[id]?tab=accounts · /products?tab=identity', mp: 'MP09 MP23' },
  { id: 'S10', title: 'Subscription and entitlement detail', route: '/products/[id]?tab=subscriptions', mp: 'MP10 MP11' },
  { id: 'S11', title: 'Product wallet and task authorization', route: '/products/[id]?tab=wallet', mp: 'MP11 MP12 MP26' },
  { id: 'S12', title: 'Usage and task explorer', route: '/products/[id]?tab=usage', mp: 'MP13 MP14' },
  { id: 'S13', title: 'Acquisition and adoption', route: '/products/[id]?tab=growth', mp: 'MP14 MP17' },
  { id: 'S14', title: 'Billing, cost imports and reconciliation', route: '/products/[id]?tab=finance', mp: 'MP15 MP16 MP23' },
  { id: 'S15', title: 'Product and package profitability', route: '/products/[id]?tab=finance', mp: 'MP16 MP18 MP23' },
  { id: 'S16', title: 'Webhooks and synchronization', route: '/products/[id]?tab=webhooks', mp: 'MP19' },
  { id: 'S17', title: 'Integration health and jobs', route: '/products/[id]?tab=health', mp: 'MP20 MP21 MP26 MP27' },
  { id: 'S18', title: 'Audit, compatibility and handoff', route: '/products/[id]?tab=audit · /spec/addendum', mp: 'MP22 MP24 MP25 MP27 MP28' },
]

export const PRODUCT_DECISIONS = [
  { id: 'PD01', title: 'Wallet scope across products', options: ['Separate wallet per product (default in addendum)', 'Optional shared cross-product wallet with conversion'], assumed: 0, affects: 'MP12 MP23' },
  { id: 'PD02', title: 'Who may link companies across products', options: ['Security or Owner after review (two-person)', 'Owner alone'], assumed: 0, affects: 'MP09 MP23' },
  { id: 'PD03', title: 'Entitlement cache TTL', options: ['TTL: TBD (shown as placeholder)', 'Proposed 60 s with signed invalidation'], assumed: 0, affects: 'MP11' },
  { id: 'PD04', title: 'Entitlement outage policy', options: ['Fail closed for paid hard-cap packages', 'Bounded grace using last snapshot'], assumed: 0, affects: 'MP11 MP26' },
  { id: 'PD05', title: 'Running jobs when a product is suspended', options: ['Let running tasks finish within reservation; block new', 'Cancel running tasks immediately'], assumed: 0, affects: 'MP01 MP26' },
  { id: 'PD06', title: 'Multi-product invoice line allocation', options: ['Allocate by list price share', 'Allocate by contract line mapping'], assumed: 1, affects: 'MP15 MP23' },
  { id: 'PD07', title: 'Credential rotation overlap', options: ['Overlap window: TBD', 'Proposed 24 h overlap then auto-revoke'], assumed: 0, affects: 'MP08' },
  { id: 'PD08', title: 'Legacy product for existing plans', options: ['Create "Legacy platform" product only for records with known owner', 'Map all history to Document agent'], assumed: 0, affects: 'MP27' },
]

export const PRODUCT_CONTRADICTIONS = [
  { id: 'PC01', title: 'Existing Plans module vs product-owned Packages', detail: 'SA05 Plans (Starter/Growth/Scale) are platform-wide; MP02 requires packages owned by a product and forbids a competing catalogue. Design: /plans now shows a banner and is treated as the legacy-product view until MP27 migration maps each plan to a product package.' },
  { id: 'PC02', title: '"Product" scope filter existed before products were defined', detail: 'Gap G03 modelled product as a feature taxonomy. MP01 makes product a first-class resource. Design: the global product filter now lists registered products, and package options depend on the selected product.' },
  { id: 'PC03', title: 'Developer API keys (SA16.01) vs product runtime credentials (MP08)', detail: 'SA16.01 keys belong to customers; MP08 credentials belong to a connected product backend. They are kept as separate screens with separate scopes to avoid confusing them.' },
  { id: 'PC04', title: 'Hard caps vs telemetry-only products', detail: 'SA12 budgets promise pre-spend enforcement; MP26 allows telemetry-only products that cannot honour hard caps. Design: every budget shows its enforcement level, and paid hard-cap packages cannot be published on a telemetry-only product.' },
]

export const ROUTE_MAP = [
  { group: 'Products', admin: true, eps: 'EP001–EP005', routes: 'POST/GET/PATCH /admin/products · /{product_id} · /archive', screen: 'S02' },
  { group: 'Packages', admin: true, eps: 'EP006–EP010', routes: '/admin/products/{product_id}/packages[/{package_id}][/archive]', screen: 'S03' },
  { group: 'Package versions', admin: true, eps: 'EP011–EP016', routes: '…/packages/{package_id}/versions[/{version_id}][/publish|/archive]', screen: 'S05' },
  { group: 'Prices', admin: true, eps: 'EP017–EP020', routes: '…/packages/{package_id}/prices[/{price_id}][/archive]', screen: 'S04' },
  { group: 'Features & meters', admin: true, eps: 'EP021–EP025', routes: '/admin/products/{product_id}/features · /meters[/versions]', screen: 'S04' },
  { group: 'Connections & credentials', admin: true, eps: 'EP026–EP034', routes: '/admin/products/{product_id}/connections[/verify|/credentials|/rotate|/revoke]', screen: 'S06 S07 S08' },
  { group: 'Bootstrap & customer links', admin: false, eps: 'EP035–EP039', routes: '/integration/bootstrap · /customer-links/{external_company_id}[/users/…]', screen: 'S09' },
  { group: 'Subscriptions', admin: false, eps: 'EP040–EP046', routes: '/integration/subscriptions[…/change-preview|/changes|/cancel] · /billing-connectors/subscription-imports', screen: 'S10' },
  { group: 'Entitlements & wallet', admin: false, eps: 'EP047–EP053', routes: '/integration/entitlements/resolve · /customers/{id}/wallet[/ledger] · /reservations[/settle|/release]', screen: 'S10 S11' },
  { group: 'Usage, events & imports', admin: false, eps: 'EP054+', routes: '/integration/usage-batches · events · cost/billing/marketing imports · jobs', screen: 'S12 S14 S17' },
]
