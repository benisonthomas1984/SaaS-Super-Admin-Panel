# Multi-Product & Integration API — Functional Build Guide

Audience: the development agent / engineering team implementing the backend and wiring the existing UI.
Companion to `docs/FUNCTIONAL_BUILD_GUIDE.md` (baseline SA01–SA16). This document covers **only the multi-product addendum (MP01–MP28)** and the changes it forces on the baseline.

**Rule zero: do not change the design.** Every screen, tab, label, table column, state and confirmation described here already exists in the prototype. Your job is to replace sample data and simulated actions with real, permission-checked, audited server behaviour.

---

## 1. What changed in the prototype (commit `2b666bb`)

| File | Purpose | What you replace |
|---|---|---|
| `lib/products.ts` | Types (`Product`, `ProductPackage`, `PackageVersion`), seed data, status/connection/execution metadata, MP requirement map, screen map S01–S18, decisions PD01–PD08, contradictions PC01–PC04, endpoint route map | `SEED_PRODUCTS` → database queries. Keep the types and `*_META` maps as the UI vocabulary. |
| `components/products/products-context.tsx` | Client store so products/packages created in a session survive tab changes | Replace with SWR hooks over the real API (`useProducts`, `useProduct(id)`), keep the same function names so components don't change. |
| `components/products/hub.tsx` | Portfolio (S01), Product registry + create/suspend/archive (S02), Cross-product identity (S09/MP23), Migration (MP27) | Server data + server actions. |
| `components/products/catalogue.tsx` | Packages list (S03), Package builder (S04), Versions & publish (S05) | Package/version/price/feature/meter APIs. |
| `components/products/integration.tsx` | Connect wizard (S06), Readiness (S07), Credentials & product admin access (S08), Webhooks (S16) | Connection, credential and webhook services. |
| `components/products/runtime.tsx` | Accounts & identity map (S09), Subscriptions + entitlement resolver (S10), Wallet + reservation simulator (S11), Usage & task explorer (S12) | Runtime integration services. |
| `components/products/operations.tsx` | Overview, Acquisition (S13), Billing & profit (S14/S15), Health & jobs (S17), Audit (S18) | Analytics, import and job services. |
| `components/products/detail.tsx` | 16-tab product detail shell, 404 state for unknown `product_id` | Fetch product server-side; return real 404. |
| `app/products/page.tsx` | `/products` tabs: `portfolio`, `list`, `identity`, `migration` | — |
| `app/products/[id]/page.tsx` | `/products/{product_id}?tab=…` | — |
| `app/spec/addendum/page.tsx` | Traceability: MP coverage, S01–S18, decisions, contradictions, API map, baseline preservation | Keep as living documentation. |
| `app/plans/page.tsx` | Added PC01 "Legacy platform plans" banner | See §9. |
| `components/admin/shell.tsx` | New nav group **Products** and spec link **Multi-product addendum** | — |
| `lib/rbac.ts` | New capabilities `act.products`, `act.integration` | Enforce server-side (§4). |

---

## 2. Core concepts (explain these to yourself before coding)

- **Product** — a separately built AI application (e.g. *Document agent*, *Support copilot*, *Data extraction API*) that connects to this panel. Product is now a **first-class resource**, not a filter tag.
- **Package** — what a customer buys **inside one product** (Starter / Pro / Business). Packages never span products.
- **Package version** — immutable snapshot of features, limits, meters, prices and credit rules. Editing = creating a new draft version.
- **Product account** — a customer's account inside one product, identified by `(product_id, external_company_id)`.
- **Canonical company** — the single real-world customer that may own accounts in several products. Linking is a reviewed action.
- **Execution mode** — how usage reaches us; determines whether hard caps are possible:
  - `instrumented_direct` — product reserves credits before every provider call → **hard cap**.
  - `central_gateway` — calls go through our gateway, which creates operation IDs → **hard cap**.
  - `telemetry_only` — product reports after the fact → **observational only, no real-time guarantee**.
- **Billing owner** — `central` (this panel creates charges) or `external` (imported; this panel **never** charges).
- **Estimated vs reconciled** — unchanged from baseline: every money figure carries its quality badge.

---

## 3. Data model

All tables carry `id` (ULID, prefixed), `created_at`, `updated_at`, `created_by`, and are **scoped by `product_id`** where applicable. Every query on product data must filter by `product_id` **and** the caller's product grants.

```
products(id 'prd_', name, slug UNIQUE, owner_user_id NULL, app_url, status, execution_mode,
         billing_owner, credit_unit_label, environments[], suspended_reason NULL, archived_at NULL)

product_packages(id 'pkg_', product_id FK, name, slug, status ['draft','active','archived'],
                 current_version_id NULL)                       UNIQUE(product_id, slug)
package_versions(id 'pkv_', package_id FK, version_no, status ['draft','published','retired'],
                 effective_from NULL, published_at NULL, published_by NULL, snapshot JSONB)  -- immutable once published
package_prices(id, package_version_id FK, interval ['month','year','metered'], amount_minor, currency,
               unit ['seat','agent','account','unit'], archived_at)
product_features(id, product_id FK, key, type ['boolean','limit','enum'], description)  UNIQUE(product_id,key)
version_feature_values(package_version_id, feature_id, value JSONB)
product_meters(id, product_id FK, key, unit, aggregation ['sum','max','unique','last'], current_version)
meter_versions(id, meter_id, version_no, source_mapping JSONB, credit_rate NUMERIC NULL)

product_connections(id, product_id FK, environment ['production','sandbox'], state
                    ['not_connected','testing','connected','degraded'], last_heartbeat_at, verified_at,
                    source_ownership JSONB)    -- per data-domain "source of truth"
product_credentials(id 'pcr_', product_id, environment, scopes[], key_hash, key_prefix, last_used_at,
                    expires_at, status ['active','rotating','revoked'], rotated_from NULL)
product_admin_grants(user_id, product_id, product_role ['product_manager','product_viewer','integration_engineer'])

canonical_companies(id 'cmp_', display_name)
product_accounts(id 'pac_', product_id, external_company_id, canonical_company_id NULL, state)
                 UNIQUE(product_id, external_company_id)
product_account_users(product_account_id, external_user_id, platform_user_id NULL)
company_link_proposals(id, product_account_id, canonical_company_id, evidence JSONB, status
                       ['proposed','approved','rejected'], proposed_by, reviewed_by NULL)

product_subscriptions(id 'psub_', product_account_id, package_version_id, status, effective_from,
                      effective_to NULL, source ['central','imported'])           -- history rows, never overwrite
wallets(id, product_account_id, balance_credits, reserved_credits)               -- one per product account (PD01)
wallet_ledger(id, wallet_id, kind ['grant','reserve','settle','release','adjust','expire'],
              credits, reservation_id NULL, idempotency_key UNIQUE, actor)
reservations(id 'rsv_', wallet_id, task_id, credits, status ['held','settled','released','expired'], expires_at)

tasks(id 'tsk_', product_id, product_account_id, feature_key, outcome, credits, provider_cost_minor,
      cost_quality ['estimated','reconciled'], started_at, finished_at)
usage_batches(id, product_id, received_at, records, accepted, rejected, idempotency_key UNIQUE)
product_events(id 'evt_', product_id, type, payload JSONB, occurred_at, received_at)

billing_imports / cost_imports / marketing_spend_imports (id, product_id, source, period, amount_minor,
                 status ['pending','matched','unmatched','rejected'])
webhook_subscriptions(id, product_id, event_type, url, signing_key_id, status)
webhook_deliveries(id, subscription_id, event_id, attempt, http_status, latency_ms, next_retry_at)
integration_jobs(id 'job_', product_id, type ['import','replay','correction','migration'], state
                 ['queued','running','succeeded','failed','cancelled'], records, error NULL)
product_budgets(id, product_id, scope, limit, enforcement ['hard','observational'])
product_audit(id, product_id, actor, action, before JSONB, after JSONB, reason, at)   -- append-only
```

---

## 4. Permissions

New capabilities in `lib/rbac.ts`:

| Capability | Meaning | Roles (current) |
|---|---|---|
| `act.products` | Register, suspend, archive products; create packages/versions; publish | Platform owner |
| `act.integration` | Connect product backends, issue/rotate/revoke product credentials, replay jobs | Platform owner, Operations |

Required server behaviour:
1. **Check on the server for every mutation** — the UI disables buttons but that is cosmetic. Return `403` with `{ code: 'forbidden', required: 'act.products' }`; the UI already renders the 403 callout.
2. **Product-level grants (MP24)** — after the global capability, check `product_admin_grants` for the target `product_id`. A product manager of *Document agent* must get `403` on *Support copilot*. (Gap: the global role switcher has no "Product manager" role yet; add it in `rbac.ts` as `product_manager` with `view.*` + `act.products` scoped to granted products.)
3. **Two-person rules** — publishing a version that reduces allowances, linking companies across products (PD02 default), and revoking production credentials require a second approver (reuse the baseline approval pattern).
4. **Read isolation** — list endpoints must only return products the caller is granted. Portfolio totals are computed over the visible set and say so.

---

## 5. Lifecycle state machines

**Product status** (`draft → testing → active ⇄ suspended → archived`)
- `draft → testing`: allowed once a sandbox connection exists.
- `testing → active`: only when all **blocking** readiness checks pass (§6.S07) and ≥1 package version is published.
- `active → suspended`: requires reason. Effect per **PD05** (default: running tasks finish within their reservation, new reservations return `423 product_suspended`).
- `suspended → active`: requires reason; resumes reservations.
- `* → archived`: only when no active subscriptions remain; irreversible; slug stays reserved.

**Package version** (`draft → published → retired`)
- Only drafts are editable. Publish freezes `snapshot`; any later change creates `vN+1` as draft.
- **Guard (PC04)**: a paid package with hard-cap budgets **cannot be published** on a `telemetry_only` product → `409 enforcement_unavailable`.

**Connection** (`not_connected → testing → connected ⇄ degraded`)
- `degraded` when heartbeat older than threshold (assumption: 5 min, make configurable) or error rate breaches; returns to `connected` automatically.

**Reservation** (`held → settled | released | expired`) — see §6.S11.

---

## 6. Screen-by-screen functionality

Routes: hub = `/products?tab=…`; detail = `/products/{product_id}?tab=…`. Every screen keeps the baseline state contract: loading skeleton, empty, error with retry, restricted (403), incomplete-data banner.

### S01 · Portfolio dashboard — `/products?tab=portfolio` (MP01 MP18 MP22 MP23)
- **Shows**: headline stats, *Product comparison* table (status, connection, product accounts, revenue, cost, gross margin, coverage), *Integration exceptions*, *New-to-platform vs product adoption*.
- **Build**: `GET /admin/products?include=metrics&period=…`. Margin = (recognized revenue − cost) / revenue, labelled Estimated unless both sides are reconciled.
- **Rule**: the callout "Product account counts cannot be summed into unique companies" is a real rule — the platform total must be `COUNT(DISTINCT canonical_company_id)` plus unlinked accounts, never a sum of product counts.
- Exceptions list = connections `degraded`/`not_connected`, failed jobs, unmatched imports. Each row links to the relevant product tab.

### S02 · Product registry — `/products?tab=list` (MP01 MP18 MP26)
- **Create product** dialog → `POST /admin/products` (EP001). Fields: name, slug (validate `^[a-z0-9-]{3,40}$`, unique), owner, app URL (https only), execution mode, billing owner, credit unit label. Created as `draft`; success callout "Product created as draft" with link to Connect.
- **Suspend / Resume** → `POST /admin/products/{id}/suspend|resume` with reason; confirmation shows active accounts and running tasks affected.
- **Archive** → `POST /admin/products/{id}/archive` (EP005). Reject `409` if active subscriptions exist; UI shows the count.
- Columns: execution mode shows its enforcement text from `EXECUTION_META`; billing owner from `BILLING_META`.

### Product detail shell — `/products/{product_id}` (16 tabs)
- Unknown id → real `notFound()`; UI shows "404 · Unknown product_id".
- **Overview** tab: product profile + "Next step" callout. Compute next step from state: not connected → Connect; readiness blocking → Readiness; no published version → Versions; else none.

### S03 · Packages — `?tab=packages` (MP02)
- Table of the product's packages. **Add package** → `POST /admin/products/{product_id}/packages` (EP006). Creates package + `v1` draft. Slug unique within product only.
- **Archive package** (EP010): only when no active subscriptions on any version.

### S04 · Package builder — `?tab=builder` (MP02–MP06)
- Edits the **current draft version** only; if none exists show "No package to edit" empty state with "Create draft from vN" action (`POST …/versions` copying the published snapshot).
- **Features and limits**: rows from `product_features` with values per version (EP021–EP022). Feature keys are product-scoped; adding a new key creates it in the catalogue.
- **Meters and units**: `product_meters` + `meter_versions` (EP023–EP025). Changing a source mapping creates a new meter version; it never rewrites historical usage.
- **Prices and credit rules** (EP017–EP020): monthly/annual/metered prices, included credits, overage rate. **Assumption D02**: rounding mode and conversion are configurable; do not hard-code provider prices.
- Save = `PATCH` the draft. Validation errors render inline.

### S05 · Versions & publish — `?tab=versions` (MP03 MP04 MP10)
- **Version history** per package. **Diff** table (Field / Current / Draft) computed server-side from snapshots.
- **Publish** → `POST …/versions/{version_id}/publish` (EP015) with `effective_from`. Server freezes the snapshot and writes audit.
- **Schedule subscriber migration**: options *new subscribers only* / *migrate existing at renewal* / *migrate on date*. If the draft gives a smaller allowance, show the "Smaller allowance" warning and require a second approver + customer notice lead time (assumption: configurable, default 30 days).
- Existing subscribers keep their version until their migration takes effect (rows in `product_subscriptions`, never in-place edits).

### S06 · Connect wizard — `?tab=connect` (MP07 MP25)
- Steps: environment → **source ownership** (for each data domain — accounts, subscriptions, usage, billing, costs, marketing — choose *this panel* or *product* as source of truth) → field mapping (App field → Maps to, status) → issue sandbox credential → verify.
- **Isolation** callout is a hard rule: sandbox credentials can never write production data; enforce by environment column on credentials and on every ingested record.
- **Verify** → `POST /admin/products/{id}/connections/verify` (EP027): server calls the product's bootstrap handshake (`/integration/bootstrap`), checks signature, clock skew, scopes; result sets state `testing` or `connected`.
- Users without `act.integration` see the wizard read-only with the 403 callout.

### S07 · Readiness — `?tab=readiness` (MP06 MP07 MP21)
- **Readiness checklist**: each check has `blocking: boolean`, status, last run, fix link. Minimum blocking set: credential verified, heartbeat < threshold, ≥1 published version, entitlement resolve test passes, reservation round-trip passes (if hard-cap mode), webhook signature verified.
- **Data coverage by domain**: last received, coverage %, state. Coverage % = records received / records expected for the period; when expected is unknown show "Incomplete" not 0%.
- Recompute on demand (`POST …/readiness/run`) and on a schedule.

### S08 · Credentials & access — `?tab=credentials` (MP08 MP24)
- **Not the same as customer API keys** (PC03): store in `product_credentials`, separate from SA16.01 developer keys; different prefix (`pcr_live_` / `pcr_test_`).
- **Issue** (EP030): show the secret **once**; store only hash + prefix.
- **Rotate** (EP031): new key active immediately, old key `rotating` until overlap ends (**PD07**: TBD; proposed 24 h then auto-revoke). **Revoke** (EP032): immediate; production revoke needs second approver.
- **Product admin access** table → `product_admin_grants` CRUD; grant/remove writes audit.

### S09 · Accounts & identity — `?tab=accounts` and `/products?tab=identity` (MP09 MP23)
- Accounts are created/updated by the product via `PUT /integration/customer-links/{external_company_id}` (EP036) and users via `…/users/{external_user_id}` (EP037–EP039). Idempotent upserts.
- **Link proposals**: generated by matching rules (email domain, billing entity, tax id). Approve/reject per **PD02** (default: Security or Owner, two-person). Approval sets `canonical_company_id` and recomputes roll-ups.
- **Churn bridge**: per period, counts of new / expanded / cross-sold / downgraded / churned **at company level** vs product level — a customer leaving one product but staying on another is product churn, not platform churn.

### S10 · Subscriptions & entitlements — `?tab=subscriptions` (MP10 MP11)
- Table from `product_subscriptions` with source badge. If `billing_owner = external`, show "Billing owned externally" callout and **disable** all charge-creating actions; changes arrive via `/billing-connectors/subscription-imports`.
- Central billing: change preview (EP043), change (EP044), cancel (EP045) — proration follows baseline billing rules.
- **Entitlement resolver** panel: test form (account + feature) → `POST /integration/entitlements/resolve` (EP047) returns `{ allowed, limit, remaining, version_id, ttl }`.
- **When the resolver is unreachable**: implement **PD04** (default fail-closed for paid hard-cap packages; bounded grace optional) and **PD03** cache TTL (TBD; proposed 60 s with signed invalidation webhook). Make both configurable per product.

### S11 · Wallet & task authorization — `?tab=wallet` (MP11 MP12 MP26)
- One wallet **per product account** (PD01 default). Shows balance, reserved, available = balance − reserved.
- Reservation API (EP050–EP053), all **idempotent** via `Idempotency-Key`:
  - `POST /reservations` → in one transaction: `SELECT … FOR UPDATE` wallet, check `available ≥ credits` and budgets, insert `reservations(held)` + ledger `reserve`. Insufficient → `402 insufficient_credits`; suspended → `423`.
  - `POST /reservations/{id}/settle {actual_credits}` → ledger `settle` (≤ held), release the remainder.
  - `POST /reservations/{id}/release` → ledger `release`.
  - Sweeper expires `held` past `expires_at` (assumption: 15 min, configurable).
- **Telemetry-only** products show "Observational only" and skip reservations; usage is debited after the fact and budgets are alerts only (PC04).
- The **Reservation simulator** is sandbox-only; wire it to the sandbox environment's real endpoints.
- **Ledger** table = `wallet_ledger`, newest first, paginated.

### S12 · Usage & task explorer — `?tab=usage` (MP13 MP14)
- Ingest via `POST /integration/usage-batches` and events endpoint; validate schema, dedupe by idempotency key, reject unknown meters with per-record errors.
- **Task explorer** columns: task_id, account, feature, outcome, credits, provider cost (with Estimated/Reconciled badge). Filters: date, account, feature, outcome. Row click → task detail drawer (baseline drill-down pattern).

### S13 · Acquisition — `?tab=growth` (MP14 MP17)
- Spend from `marketing_spend_imports`; new product accounts split into **new-to-platform** vs **cross-sell** (account's canonical company already had another product).
- "Cross-sell is not new-customer acquisition": CAC = spend / new-to-platform only. Attribution window per **D10** (configurable).
- **Package adoption funnel**: visited → trial → paid → expanded, per package.

### S14/S15 · Billing & profit — `?tab=finance` (MP15 MP16 MP18 MP23)
- Invoices (central or imported), **Cost imports** (provider bills, shared expenses) with match status.
- Shared costs allocated by driver per **D09**; multi-product invoice lines per **PD06** (assumed: contract line mapping).
- **Package profitability**: per package·version, recognized revenue, cost, gross margin, quality badge. Never mix estimated and reconciled in one total without labelling.

### S16 · Webhooks — `?tab=webhooks` (MP19)
- **Outbound subscriptions**: event type, URL, signing key, 24 h delivery stats. Sign with HMAC-SHA256 over `timestamp.body`, header `X-Signature`, reject replays older than 5 min.
- Retry with exponential backoff (assumption: 8 attempts over ~24 h), then dead-letter → appears in Health.
- **Delivery log** with manual **Redeliver** (needs `act.integration`).
- Inbound calls from products must carry the same signature scheme.

### S17 · Health & jobs — `?tab=health` (MP20 MP21 MP26 MP27)
- Heartbeat, error rate, latency; "Degraded" callout when state is degraded.
- **Jobs** table (`integration_jobs`) with **Replay** / **Cancel**. Replays and corrections must be idempotent and produce correction ledger rows — never mutate history.
- **Emergency controls**: pause product reservations, freeze credential, stop webhooks. Each needs reason + confirmation, writes audit, and is reflected in the global kill-switch screen (SA10.03).

### S18 · Audit & API — `?tab=audit` and `/spec/addendum` (MP22 MP24 MP25 MP27 MP28)
- **Product audit trail** from `product_audit` filtered by product: actor, action, before/after diff, reason. Append-only; no delete endpoint.
- **API contract (MP25)**: produce an executable OpenAPI 3.1 file at `docs/openapi/integration.yaml` covering every group in `ROUTE_MAP`. Version via URL prefix `/v1`; additive changes only within a major version.

### Migration — `/products?tab=migration` (MP27)
- Job that maps legacy SA05 plans (Starter/Growth/Scale) and their subscriptions, credits, usage and invoices into products and packages. Per **PD08** default, create a "Legacy platform" product only for records with a known owner; everything else is listed as *unmapped* for manual review.
- Steps: dry run (counts + conflicts) → approve → run as `integration_jobs(type='migration')` → verify totals match before/after → mark legacy plan read-only.

---

## 7. Integration API (endpoint groups)

| Group | EP | Routes | Screen |
|---|---|---|---|
| Products | EP001–005 | `POST/GET/PATCH /admin/products`, `/{product_id}`, `/archive` | S02 |
| Packages | EP006–010 | `/admin/products/{product_id}/packages[/{package_id}][/archive]` | S03 |
| Package versions | EP011–016 | `…/packages/{package_id}/versions[/{version_id}][/publish\|/archive]` | S05 |
| Prices | EP017–020 | `…/packages/{package_id}/prices[/{price_id}][/archive]` | S04 |
| Features & meters | EP021–025 | `/admin/products/{product_id}/features`, `/meters[/versions]` | S04 |
| Connections & credentials | EP026–034 | `/admin/products/{product_id}/connections[/verify\|/credentials\|/rotate\|/revoke]` | S06–S08 |
| Bootstrap & customer links | EP035–039 | `/integration/bootstrap`, `/customer-links/{external_company_id}[/users/…]` | S09 |
| Subscriptions | EP040–046 | `/integration/subscriptions[…/change-preview\|/changes\|/cancel]`, `/billing-connectors/subscription-imports` | S10 |
| Entitlements & wallet | EP047–053 | `/integration/entitlements/resolve`, `/customers/{id}/wallet[/ledger]`, `/reservations[/settle\|/release]` | S10 S11 |
| Usage, events & imports | EP054+ | `/integration/usage-batches`, events, cost/billing/marketing imports, jobs | S12 S14 S17 |

Conventions for all `/integration/*` endpoints: authenticated by product credential (scopes checked), `product_id` derived from the credential (never from the body), `Idempotency-Key` required on writes, standard error body `{ code, message, details[] }`, cursor pagination, rate limits per credential.

---

## 8. Open decisions — build as configuration, not code

Store in a `product_settings` table (per product, with platform default). The UI shows the assumed option; do not hard-code.

| ID | Decision | Assumed default |
|---|---|---|
| PD01 | Wallet scope | Separate wallet per product |
| PD02 | Who links companies across products | Security or Owner, two-person review |
| PD03 | Entitlement cache TTL | TBD (proposed 60 s + signed invalidation) |
| PD04 | Resolver outage policy | Fail closed for paid hard-cap packages |
| PD05 | Running jobs on suspend | Finish within reservation; block new |
| PD06 | Multi-product invoice allocation | Contract line mapping |
| PD07 | Credential rotation overlap | TBD (proposed 24 h then auto-revoke) |
| PD08 | Legacy product for existing plans | "Legacy platform" only for records with known owner |

Additional engineering assumptions introduced in this guide (also make configurable): heartbeat degraded threshold 5 min; reservation expiry 15 min; webhook retries 8 over ~24 h; downgrade notice 30 days.

---

## 9. Changes required to the existing (baseline) modules

| Area | Change |
|---|---|
| **Global scope bar** (PC02) | "Product" filter must list registered products from `products`, and the "Package" filter must depend on the selected product. All baseline queries accept optional `product_id`. |
| **Plans `/plans`** (PC01) | Becomes the legacy view. Keep read-only after migration (MP27). Block creating new platform-wide plans once any product is `active`. |
| **Customers SA02** | Customer = canonical company. Customer detail gains a "Products" section listing product accounts (data from `product_accounts`). Unlinked accounts appear as separate customers flagged "Unlinked". |
| **Usage SA03 / Credits SA04** | Add `product_id` dimension to usage and ledger; credit balances shown per product wallet (PD01). |
| **Billing SA06 / Profitability SA07** | Add product and package·version dimensions; respect `billing_owner = external` (no charge actions). |
| **Acquisition SA08 / Adoption SA09** | Separate new-to-platform vs cross-sell everywhere CAC appears. |
| **Controls SA12 / Kill switches SA10.03** | Budgets show enforcement level (hard / observational). Product emergency controls appear in the global kill-switch list. |
| **Security SA13** | Product credentials listed in the security inventory, distinct from customer API keys (PC03). Product grants included in access reviews. |
| **Developer SA16** | Leave customer keys/webhooks as is; product integration lives under `/products/{id}`. |
| **Settings → Integrations** | Unchanged (AI providers, Google Drive etc. are platform integrations, not products). |
| **RBAC** | Add `product_manager` role (gap MP24) and per-product grant checks. |

---

## 10. Suggested build order

1. Schema + `products`, `product_packages`, `package_versions` CRUD; replace `products-context` with SWR. (S02, S03)
2. Builder: features, meters, prices; publish with immutability + PC04 guard. (S04, S05)
3. Connections, credentials, bootstrap handshake, readiness. (S06–S08)
4. Customer links, canonical companies, link proposals. (S09)
5. Subscriptions + entitlement resolver + wallet/reservations (transactional, idempotent). (S10, S11)
6. Usage/event ingestion, task explorer. (S12)
7. Imports (billing, cost, marketing), profitability, acquisition. (S13–S15)
8. Webhooks out/in, jobs, replay, health, emergency controls. (S16, S17)
9. Audit, OpenAPI file, baseline module changes (§9), legacy migration. (S18, MP27)

---

## 11. Acceptance checks (MP28 walkthrough)

1. Create product *Data extraction API* → appears as `draft` in registry; slug collision returns inline error.
2. Add package *Pay as you go*, edit draft, publish → v1 published, snapshot immutable (PATCH returns `409`).
3. Try to publish a paid hard-cap package on a telemetry-only product → blocked with PC04 message.
4. Connect sandbox, verify → state `connected`; sandbox credential writing to production → `403`.
5. Readiness: all blocking checks green → product can move to `active`; otherwise transition rejected.
6. Upsert customer link twice with same key → one account. Approve a link proposal → portfolio unique-company count updates, product counts don't change.
7. Reserve 100 credits on a wallet with 80 available → `402`. Reserve 50 → held; settle 30 → ledger shows reserve 50, settle 30, release 20; replay same idempotency key → same result, no duplicate rows.
8. Suspend product → new reservation returns `423`; running task can settle.
9. External-billing product: no charge buttons enabled; imported invoice appears with "Imported" source.
10. Webhook to failing URL → retries, then dead-letter shown in Health; manual redeliver succeeds.
11. Product manager for *Document agent* opens *Support copilot* → `403` restricted state.
12. Every action above has a `product_audit` row with actor, before/after and reason.
13. Migration dry run lists unmapped legacy records; after run, before/after totals match.

---

## 12. Known gaps (carry forward)

- **MP24 partial** — `product_manager` role not yet in the role switcher; per-product grants designed only as a table.
- **MP25 backend** — endpoint map shown; executable OpenAPI must be produced by engineering.
- **PD03 / PD07** — values are TBD; ship with proposed defaults behind configuration and confirm with the business.
- Atomicity of reservations (MP12) is a backend guarantee; the UI only simulates outcomes.
