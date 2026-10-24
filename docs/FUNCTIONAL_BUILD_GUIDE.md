# Superadmin Panel — Functional Build Guide (for the implementing agent)

> **Scope of this document.** The visual design in this repository is final. **Do not change layout, colours, typography, components or copy** unless a section below explicitly says so. Your job is to replace the sample data and simulated behaviour with real data, real persistence, real permission checks and real side effects, page by page.
>
> Every section of every screen is tagged with a feature ID (`SA01.01` … `SA16.04`). Keep those tags. They are the traceability link to the original specification, the coverage matrix (`/spec/coverage`) and this guide.

---

## 0. How to read this guide

For each page you get:

| Heading | Meaning |
|---|---|
| **Route / file** | Where the page lives and which component renders it. |
| **Purpose (plain language)** | What a non-technical superadmin uses the page for. |
| **Sections** | Each panel on the page, its feature ID, and what it must do. |
| **Data** | Entities and fields to read. |
| **Actions** | Buttons/forms, the server operation behind them, who can run them, what is audited. |
| **Rules** | Business logic. Rules that depend on an open decision are marked `⚙ Dxx` and must be **configurable**, never hard-coded. |
| **States** | Specific loading / empty / error / restricted / incomplete behaviour beyond the global defaults. |
| **Done when** | Acceptance criteria. |

Global conventions (section 1) apply to every page and are not repeated.

---

## 1. Platform-wide foundations (build these first)

### 1.1 Current architecture

| Piece | File | Today | Must become |
|---|---|---|---|
| Admin context (environment, role, data-state preview) | `components/admin/admin-context.tsx` | Client state switcher in the header | Environment comes from the deployment + an explicit switch; **role comes from the signed-in session**, never from a dropdown. Keep the data-state switcher only in a dev/demo build. |
| Shell + navigation | `components/admin/shell.tsx` | Static nav | Hide nav items the user has no `view.*` capability for (but the server must still enforce — see 1.3). |
| Scope bar (period, currency, segment, compare) | `components/admin/scope-bar.tsx` | Visual only | Serialise to URL query params (`?from=&to=&ccy=&segment=&cmp=`) so views are shareable and saved views (SA01.02) can restore them. Every data endpoint accepts the same params. |
| Shared UI (Panel, Stat, Badge, FigureTag, Table, ActionButton, ConfirmDialog, Tabs) | `components/admin/ui.tsx` | Renders sample data | Unchanged visually. Accept real data via props. |
| Page states | `components/admin/state.tsx` | Simulated via context | Drive from real fetch status (see 1.4). |
| Help system | `components/admin/help.tsx`, `lib/help.ts` | Plain-language explanations keyed by panel title | Keep. When you rename a panel title, update its key in `lib/help.ts`. |
| RBAC | `lib/rbac.ts` | Role → capability map | Becomes the **server-side** source of truth (see 1.3). |
| Spec registry | `lib/spec.ts` | Modules, features, decisions, contradictions, gaps | Keep as documentation data; the coverage page reads it. |
| Sample data | `lib/sample-data.ts` + inline arrays in `components/modules/*` | Hard-coded | Replace with data-access functions. Remove the "Sample data" label only when a section is fully live. |

### 1.2 Recommended stack (assumption — confirm before building)

- **Database:** Postgres (Neon recommended). Money stored as integer **minor units** (`bigint`) plus `currency char(3)`; credits stored as `numeric(20,6)` (⚙ D02 rounding precision).
- **Admin auth:** Better Auth with email + password, **mandatory MFA (TOTP)**, session timeout from Settings › Sign-in rules. Admin users live in a separate `admin_user` table, **never** mixed with customer users.
- **Secrets:** Never store provider keys in plain Postgres. Use an envelope-encrypted vault (KMS-backed key, or a managed secret store). The DB stores only `secret_ref`, `last4`, `created_at`, `rotated_at`, `expires_at`.
- **Jobs:** A durable queue/workflow runner for imports, reconciliation, period close, exports, retries and webhooks.
- **Data fetching:** Server Components for first render, SWR for live/refreshing panels. No fetching inside `useEffect`.
- **Mutations:** Server Actions or Route Handlers. Every mutation goes through one `runAdminAction()` wrapper (1.5).

### 1.3 Permissions (RBAC) — enforced on the server

Capabilities (from `lib/rbac.ts`):

| Capability | Meaning |
|---|---|
| `view.finance` | Revenue, invoices, cash |
| `view.margin` | Provider cost, margin, contribution |
| `view.usage` | Usage metadata (no content) |
| `view.customer` | Identifiable customer records |
| `view.security` | Audit, admin list, security config |
| `view.content` | Raw prompts/responses (granted to **no role by default**; only via SA13.04 support session) |
| `act.finance` | Refunds, adjustments, period close |
| `act.pricing` | Draft/publish plans and rates |
| `act.ops` | Pause jobs, change limits |
| `act.killswitch` | Activate/restore kill switches |
| `act.support` | Support sessions, cases, goodwill credits |
| `act.security` | Revoke credentials, security policy |
| `act.roles` | Grant/revoke admin roles |
| `act.export` | Export permitted rows |
| `act.settings` | Integrations, key vault, brand, platform defaults |

Default role matrix:

| Role | Capabilities |
|---|---|
| Platform owner | view.finance, view.margin, view.usage, view.customer, view.security, act.pricing, act.ops, act.killswitch, act.roles, act.export, act.security, act.settings |
| Finance administrator | view.finance, view.margin, view.usage, view.customer, act.finance, act.pricing, act.export |
| Operations administrator | view.usage, view.customer, act.ops, act.killswitch, act.export |
| Support administrator | view.customer, view.usage, act.support |
| Security administrator | view.security, view.usage, view.customer, act.security, act.roles |
| Read-only analyst | view.finance, view.usage, act.export (aggregates only, de-identified) |

Rules:
1. **Every** data endpoint checks a `view.*` capability; **every** mutation checks an `act.*` capability. UI hiding is a convenience, not security.
2. Denied requests return `403` with `{ code: 'forbidden', requiredCapability, rolesWith }`. The UI shows the existing *Restricted* state, which names the roles that have access (`rolesWith()`).
3. Field-level redaction: when a user lacks `view.margin`, cost/margin columns are **removed from the response**, not just hidden in the UI.
4. ⚙ **D14** — the role matrix itself must be editable (Security › Role → capability matrix) by `act.roles`, with an audit entry for each change. The table above is the default seed.
5. Separation of duties: the person who *requests* a refund above a threshold, a role grant, or a kill-switch restore cannot also *approve* it (⚙ D14 threshold).
6. Known contradiction **C04**: the matrix grants a P1 capability (support cases) to a P0 role. Seed it as shown and leave it configurable.

### 1.4 Standard page states (apply everywhere)

| State | Trigger | Behaviour |
|---|---|---|
| Loading | Request in flight | Skeletons in the same layout as the loaded panel (no layout shift). |
| Empty | Successful response, zero rows | Explain *why* it's empty and give the next action (e.g. "No provider statements yet — Import statement"). |
| Error | Non-2xx / network | Message, `requestId`, **Retry** button. Never show stack traces. Other panels keep working (errors are per panel, not per page). |
| Restricted | 403 | Restricted card naming the missing capability and the roles that have it. Never render partial sensitive data. |
| Incomplete | Data present but `coverage < 100%` or a feed is late | Show the figure **and** a coverage badge ("91.4% cost coverage", "Feed missing 21–23 Oct"). Never silently present a partial total as complete. |

API shape every list/aggregate endpoint returns:

```ts
type Envelope<T> = {
  data: T
  meta: {
    asOf: string            // ISO timestamp of freshest source row
    basis: 'estimated' | 'reconciled' | 'forecast' | 'mixed'
    coverage?: number       // 0..1 share of rows rated / matched
    gaps?: { source: string; from: string; to: string }[]
    periodStatus?: 'open' | 'closing' | 'closed' | 'reopened'
  }
}
```

### 1.5 Estimated vs reconciled (the most important rule in the product)

- **Estimated:** computed live from metered events × our rate catalogue. Available instantly, may change.
- **Reconciled:** matched against the provider's invoice / payment processor settlement for a period that has been reconciled. Changes only through an audited correction.
- **Forecast:** a projection; never added to actuals.
- **Mixed:** a total containing both — must show the split.

Every money/credit figure on screen already carries a `FigureTag`. The backend must return the `basis` for every figure; the frontend maps it to the tag. **Never sum estimated and reconciled figures into a single number without the "mixed" tag and split.**

### 1.6 The admin action wrapper (audit + confirmation)

All mutations go through one server function:

```ts
runAdminAction({
  capability,          // e.g. 'act.killswitch'
  action,              // 'killswitch.activate'
  target,              // { type: 'provider', id: 'prov_a' }
  reason,              // required for every risky action
  caseRef?,            // required for support / goodwill actions
  idempotencyKey,      // from the client; prevents double posting
  preview: () => Impact,   // computed BEFORE the confirm dialog
  execute: () => Result,
})
```

Behaviour:
1. Check capability (403 if missing).
2. For risky actions, the client first calls the **preview** endpoint; the `ConfirmDialog` shows that impact (affected customers, money, in-flight work). The confirm call must send a `previewHash`; if the impact changed in between, reject with `409 impact_changed` and re-show the dialog.
3. Execute inside a DB transaction.
4. Write an **append-only audit row**: actor, role, action, target, before/after snapshot, reason, caseRef, IP, userAgent, requestId, timestamp. Audit rows are hash-chained (each row stores the hash of the previous) — the Security › Audit trail "Integrity" column verifies this chain.
5. Return the new state; SWR revalidates the affected keys.

Nobody can edit or delete audit rows, including the Platform owner.

### 1.7 Core data model (minimum)

```
company(id, legal_name, primary_domain, region, lifecycle_state, owner_user_id, created_at)
workspace(id, company_id, name, status)
customer_user(id, company_id, email, role, status)
membership(user_id, workspace_id, role)

plan(id, name, version, status[draft|published|retired], billing_model, price_minor, currency,
     included_credits, entitlements jsonb, effective_from)
subscription(id, company_id, plan_id, plan_version, status, period_start, period_end, contract_id?)
contract(id, company_id, terms jsonb, start, end)
override(id, company_id, key, value, reason, expires_at)

provider(id, name, kind, status)
model(id, provider_id, name, region, status, capabilities jsonb)
rate(id, model_id, unit, input_per_1m, output_per_1m, other jsonb, effective_from, effective_to)
sell_rate_policy(id, version, rules jsonb, effective_from)

task(id, company_id, workspace_id, user_id, agent_id, parent_task_id, status, started_at, ended_at, correlation_id)
attempt(id, task_id, model_id, provider_request_id, input_tokens, output_tokens, other_units jsonb,
        status, rate_id?, est_cost_minor, billable bool, reason)

credit_bucket(id, company_id, kind[included|purchased|promo|goodwill], amount, remaining, expires_at, priority)
reservation(id, company_id, task_id, amount, status[held|settled|released|expired], expires_at)
ledger_entry(id, company_id, bucket_id?, kind, amount, balance_after, ref_type, ref_id, reason, actor_id, created_at)  -- append-only

invoice(id, company_id, number, period, status, subtotal_minor, tax_minor, total_minor, currency, finalized_at)
invoice_line(id, invoice_id, kind, description, qty, unit_minor, amount_minor, source_ref)
payment_event(id, provider, external_id unique, type, payload jsonb, status, processed_at)
refund / credit_note / dispute (...)

provider_statement(id, provider_id, period, total_minor, currency, imported_at, status)
statement_line(id, statement_id, external_ref, amount_minor, matched_attempt_ids[], status)
shared_cost(id, kind, period, amount_minor, driver, allocation_version)

period(id, month, status[open|closing|closed|reopened], closed_by, closed_at)
correction(id, period_id, kind, amount_minor, reason, actor_id)
fx_rate(date, from, to, rate, source)

acquisition_touch(id, anonymous_id, company_id?, channel, campaign, at)
spend_import(id, channel, period, amount_minor, source)

knowledge_source(id, company_id, connector, status, last_sync_at, acl_freshness_at, docs, bytes)
connector_credential(id, company_id, connector, status, scopes, expires_at, secret_ref)

limit(id, scope_type[platform|company|workspace|user|agent|key], scope_id, metric, window, value, action)
kill_switch(id, target_type, target_id, state, activated_by, reason, activated_at, restore_requires)
alert_rule(id, metric, condition, severity, recipients, escalation)
alert(id, rule_id, state, opened_at, ack_by, resolved_at)

admin_user(id, email, name, role, status, mfa_enrolled, last_login_at)
admin_session(id, admin_user_id, ip, ua, created_at, expires_at)
audit_event(id, prev_hash, hash, actor_id, role, action, target_type, target_id, before jsonb, after jsonb, reason, case_ref, request_id, ip, created_at)
support_session(id, admin_user_id, company_id, case_ref, scope, starts_at, ends_at, ended_reason)
support_case(id, company_id, subject, status, minutes, cost_minor)

integration(id, category, service, environment, status, spend_cap_minor, config jsonb)
secret(id, integration_id, label, secret_ref, last4, rotate_every_days, rotated_at, expires_at, status)
brand(id, product_name, logo_url, colors jsonb, email_from_name, email_from_address, sender_status, support_email, urls jsonb)
platform_settings(legal_entity, address, tax_id, reporting_ccy, reporting_tz, fy_start, close_day)

api_key(id, owner_type, owner_id, prefix, hash, scopes, environment, last_used_at, expires_at, status)
webhook_endpoint(id, company_id, url, events[], secret_ref, status)
webhook_delivery(id, endpoint_id, event_id, attempt, status, response_code, at)
config_release(id, kind, version, diff jsonb, status, released_by, released_at)
```

### 1.8 Build order

1. Auth, admin users, MFA, sessions, RBAC, audit wrapper (Settings › Admin team, Security).
2. Settings: integrations + key vault, brand, general (everything else depends on providers and currency).
3. Companies, workspaces, members (Customers, Customer 360).
4. Metering → rates → task/attempt costing (Usage).
5. Credits ledger, reservations (Credits).
6. Plans, subscriptions (Plans).
7. Invoicing, payments, collections (Billing).
8. Controls: limits, kill switches, alerts.
9. Profitability, period close, FX.
10. Dashboard (aggregates of everything above).
11. Models & agents, Knowledge, Operations, Support, Developer.
12. Growth, Adoption, Reports.

---

## 2. Page-by-page specification

### 2.1 Start here — `/start` (`app/start/page.tsx`)

**Purpose.** Orientation for a non-technical superadmin: how the money flows, a setup checklist, and "where do I go to…" answers.

**Sections**
- **How the platform makes money** — fixed explainer; each step links to the screen that controls it. No data.
- **Setup checklist** — each item's `done` flag must be **computed**, not stored:

| Item | Done when |
|---|---|
| Legal details, currency, timezone | `platform_settings` has legal_entity, reporting_ccy, reporting_tz |
| Brand assets | `brand.logo_url` and `product_name` set and sender domain verified |
| Admin team + MFA | ≥ 2 active admins, all with `mfa_enrolled = true`, break-glass account configured |
| AI providers + keys | ≥ 1 provider integration `status = connected` with a valid secret |
| Provider rate cards | every active model has a rate effective today |
| Payments (Stripe) | payments integration connected and webhook verified (last event < 24 h) |
| Chart of accounts mapping | every cost category mapped (SA07.01) |
| (others in the file) | define the same way: a query that returns true/false |

- **Where do I go to…** — static links; keep.

**Done when** the checklist reflects live state and each item deep-links to the right tab.

---

### 2.2 Executive dashboard — `/` (`components/modules/dashboard.tsx`) · SA01.01, SA01.03

**Purpose.** "How is the business doing right now?" in one screen.

**Sections**
- **Headline cards (SA01.01):** Recurring revenue (MRR), Recognized revenue, Cash collected, Service cost, Gross profit, Paying companies, Platform budget (Oct).
  - MRR = Σ active subscription monthly-normalised price (annual ÷ 12) + committed contract minimums. Basis: *reconciled* for invoiced, *estimated* for current month usage.
  - Recognized revenue follows SA07.01 recognition rules (⚙ D08).
  - Cash collected = Σ succeeded payments − refunds in period (from payment events). Basis: *reconciled* once settled.
  - Service cost = Σ attempt est_cost (estimated) replaced per provider by statement totals once that provider-period is reconciled → typically *mixed*; show split.
  - Gross profit = recognized revenue − service cost. If either side is incomplete, the card shows **Incomplete** + coverage.
  - Platform budget = platform-level spend limit (SA12.01) vs. MTD service cost.
- **Daily revenue vs service cost chart:** one bar pair per day; days with missing feeds are hatched and labelled (already in the design). Data from a daily rollup table.
- **Major exceptions:** union query of open high-severity items: unrated attempts, past-due accounts above threshold, provider variance > tolerance, stale ACLs, failed webhooks, active kill switches, open incidents. Each row links to its screen.
- **Closed-period band:** last closed month's reconciled figures, never merged with the live month.
- **Forecast and margin monitoring (SA01.03):** settings for Forecast horizon, Minimum history, Alert recipients. If history < minimum → "Insufficient data" state, no forecast line. Forecast = simple trend/seasonal model; tagged *forecast*. Margin alerts create `alert` rows via SA12.04.

**Actions:** Save forecast settings (`act.finance` or owner) → audited.

**Done when** each card returns `basis` and `coverage`, the chart flags gap days, and every exception row deep-links.

---

### 2.3 Customers list — `/customers` (`components/modules/customers-list.tsx`) · SA02.01

**Purpose.** Find any customer company and create new ones.

**Sections:** search, *Lifecycle filter* (trial, active, past_due, suspended, closing, closed), table (company, plan, MRR, usage, health, region, lifecycle).

**Actions**
- **Create company** — fields: Legal name, Primary domain, Data region, Owner email. Server: create `company` + owner invite; reject duplicate domain (409). Capability: owner/support (⚙ D14). Audited.

**Rules:** lifecycle transitions are a state machine — `trial → active | closed`, `active → past_due | suspended | closing`, `past_due → active | suspended`, `suspended → active | closing`, `closing → closed`. Invalid transitions return 422.

**Data:** paginated (cursor), sortable server-side; MRR column redacted without `view.finance`.

---

### 2.4 Customer 360 — `/customers/[id]` (`components/modules/customer-detail.tsx`) · SA02.01–SA02.04 (+ links to every module)

**Purpose.** Everything about one company on one page.

**Sections**
- **Identity & tenancy (SA02.01):** legal name, domain, region, IDs, lifecycle. Actions: **Suspend**, **Restore**, **Schedule closure**, **Transfer ownership**.
  - *Suspend* preview: active users, in-flight tasks (*In-flight work* field: let finish / cancel), outstanding reservations. Choosing "cancel" releases reservations per ⚙ D05.
  - *Schedule closure*: sets effective time, triggers SA02.04 data workflow.
- **Workspaces & Members (SA02.02):** list; **Invite member** (Email, Role), **Revoke**. Revoke ends sessions and API keys for that user.
- **Plan & contract:** current plan/version, overrides, contract terms → links to `/plans`.
- **Usage & cost (Oct MTD):** "Included allowance consumed", settled vs estimated; cost hidden without `view.margin`.
- **Wallet:** bucket balances, reservations → `/credits?company=`.
- **Billing:** open invoices, past-due → `/billing?company=`.
- **Acquisition:** first-touch / last-touch channel; "Signal missing" if unknown.
- **Health signals:** activation, usage trend, support burden, payment risk (SA09.04). Missing inputs show "Signal missing", not zero.
- **Support & recent audit:** last cases, last 10 audit events for this company. **Open support session** → SA13.04 flow.
- **Closure and data requests (SA02.04):** **New request** form (Request type: export / delete / rectify; Scope; Reason; Case reference) → **Preview scope & submit** lists every data store affected and retention exceptions (financial records retained ⚙ D13). Request detail (e.g. *DSR-0091 · Delete company data*) shows per-store progress.

**Done when** each panel loads independently (one failing does not blank the page) and every action is previewed, confirmed and audited.

---

### 2.5 Usage & cost — `/usage` (`components/modules/usage.tsx`) · SA03.01–SA03.04

**Purpose.** Every AI call, what it cost us, and whether provider invoices agree.

**Sections**
- **Root tasks / Task tree (SA03.01):** search by *Task / correlation ID*. Tree shows parent task → child tasks → attempts (model, tokens, status, rate version, est. cost, billable flag + reason). Retries/fallbacks/cancellations billable per ⚙ D05.
- **Unrated exception queue:** attempts with no matching rate. Actions: **Map to rate** (choose rate version) → re-rates the attempt and writes a correction if the period is closed.
- **Provider rate catalogue (SA03.02):** versioned rates (Input / 1M tok, Output / 1M tok, other units). **Add future rate** with *Effective from* (must be in the future; past changes only through correction). Never mutate an existing rate row.
- **Non-token and shared costs (SA03.03):** hosting, storage, OCR, support labour. **Import statement** / manual entry. *Allocation policy* with *Hosting driver* (⚙ D09: tokens, tasks, seats, revenue) and *Support labor classification* (contradiction **C05** — must be counted in only one place; enforce mutual exclusion with SA15.01). **Publish alloc_v4** creates a new allocation version.
- **Provider reconciliation (SA03.04):** import provider statement → auto-match lines to attempts by provider_request_id, then by day/model totals. Show variance, *Unmatched statement lines*. Actions: **Post adjustment** (Reason code), **Mark Provider A Sep reconciled** (only when variance ≤ tolerance or adjustment posted). Marking reconciled flips the basis of that provider-period to *reconciled*.

**Capabilities:** view.usage for tasks; view.margin for costs; act.finance for adjustments/reconcile; act.pricing for rates.

**States:** "Feed missing 21–23 Oct" when the metering pipeline (SA14.01) reports a gap.

---

### 2.6 Credits & wallet — `/credits` (`components/modules/credits.tsx`) · SA04.01–SA04.04

**Purpose.** Each company's prepaid credit balance, exactly how it moved.

**Sections**
- **Credit buckets (SA04.01):** included / purchased / promo / goodwill with expiry and consumption priority (⚙ D06 expiry, ⚙ D03 company pool vs user allowance). **User sublimits** table.
- **Reservations / Settlement trace (SA04.02):** before a task runs, reserve estimated credits; on completion settle actual and release the rest. *Reservation timeout* setting releases stuck holds. Trace view shows hold → settle → release with ledger links.
- **Immutable ledger (SA04.03):** append-only `ledger_entry`; header shows **Opening + entries = closing (verified)** — compute on read; if it doesn't balance, show an error state and raise an alert. **Post adjustment** (Amount, Reason, Linked record) — never edit rows.
- **Top-ups, exhaustion, refunds (SA04.04):** *Exhaustion policy* (⚙ D04: stop / degrade / auto top-up / overage) with *Minimum balance trigger*, *Top-up amount*, *Monthly top-up cap*, *Consent*, *Emergency allowance cap*. *Recovery policy* and *Wallet unavailable* behaviour (⚙ D12: fail open with cap / fail closed). **Top-up attempts** table from payment events.

**Rules:** all balance changes in one transaction with row lock on the company wallet; idempotency key per settlement. Credit precision/rounding ⚙ D02.

**Capabilities:** act.finance for adjustments; owner for policy.

---

### 2.7 Plans & pricing — `/plans` (`components/modules/plans.tsx`, `plan-builder.tsx`) · SA05.01–SA05.04

**Purpose.** What we sell and at what price.

**Sections**
- **Plan catalogue (SA05.01):** plans with version and status. **Create plan** opens the guided builder: Plan name, Short description, Who can buy it, billing model (flat / seat / usage ⚙ D01), Price, Included credits, Unused credits at month end (⚙ D06), Free trial, Annual discount, Max requests per minute, Storage limit. Saves as **draft**; "Nothing changes yet" until published.
- **Publish (e.g. Publish Scale v4):** **Preview & publish** shows *Existing customers* handling (stay on old version / migrate at renewal / migrate now), *Effective from*, *Rollout cohort*. Publishing creates a new immutable version; old versions keep serving existing subscribers.
- **Sell-rate policy (SA05.02):** credits per model unit, *Precision*, *Rounding mode*, *Rounding stage* (per attempt / per task / per invoice — ⚙ D02). **Sample task preview** computes a real task's credits under the draft policy.
- **Trials, promotions, contracts (SA05.03):** *Eligibility*, *Coupon stacking*, *Trial cost tagging* (so trial cost lands in acquisition, SA08). Enterprise contracts and **Customer overrides** (always with reason + expiry).
- **Subscription lifecycle (SA05.04):** *Subscription change preview* for a company: Change type, Timing (now / period end), proration result (⚙ D07). **Downgrade conflict check** lists entitlements the customer currently exceeds; block or require confirmation.

**Contradiction C03:** plan publish and config releases (SA14.04) both version things. Implement plan publish as a `config_release` of `kind = 'plan'` so there is one release history.

**Capabilities:** act.pricing (Finance, Owner). Audited.

---

### 2.8 Billing & collections — `/billing` (`components/modules/billing.tsx`) · SA06.01–SA06.04

**Purpose.** Invoices, payments, chasing late payers, refunds.

**Sections**
- **Invoices (SA06.01):** list with status (draft, open, paid, past_due, void). **Unbilled usage preview** for a company. **Late usage policy** — *Usage arriving after finalization*: next invoice / credit note / ignore below threshold (⚙ D18). Billing timezone & cutoff from Settings › General.
- **Payment provider events (SA06.02):** webhook log; verify signatures; dedupe on `external_id`; **Replay** for failed processing. Banner rule: **Paid access is granted only after verified payment** (never on client redirect).
- **Past-due & Collection policy (SA06.03):** retry schedule, grace days, then *Restrict* (⚙ D20). Actions per account: **Restrict**, **Write off**.
- **Refunds, disputes, tax (SA06.04):** **Refund preview** (Amount, *Credit treatment*: claw back credits / keep, Reason code) → **Issue refund** / **Issue credit note**. *Disputes & accounting export*. "Tax provider TBD" — keep as a configurable integration slot.

**Capabilities:** view.finance; act.finance for refunds/write-off. Refunds above threshold need second approver (⚙ D14).

---

### 2.9 Profitability — `/profitability` (`components/modules/profitability.tsx`) · SA07.01–SA07.04

**Purpose.** Are we making money, per customer, feature and model?

**Sections**
- **Revenue recognition / Chart-of-accounts mapping (SA07.01):** map every revenue and cost category to an account and a class (service cost / opex / contribution deduction — ⚙ D08). Unmapped categories show "Missing".
- **Customer unit economics (SA07.02):** per company revenue, allocated cost, contribution, margin %, cost coverage %. "n.a. · no revenue" for zero-revenue rows. **Feature & model cost** breakdown; "Not attributable" bucket for unallocated cost (never hidden).
- **Operating result (accrual) & Cash movement (SA07.03).**
- **Thresholds:** *Low-margin alert*, *Negative contribution alert* → create alerts.
- **FX rates, Period close, Later corrections (SA07.04):** FX source and daily rates (⚙ D19, "Awaiting import" when missing). **Close period** precondition checklist (all providers reconciled or accepted, no unrated attempts above tolerance, FX present). **Reopen** requires reason + second approver; corrections after close are logged and shown separately.

**Capabilities:** view.margin; act.finance for close/reopen.

---

### 2.10 Acquisition — `/growth` (`components/modules/growth.tsx`) · SA08.01–SA08.04

**Purpose.** Where customers come from and whether they pay back.

**Sections**
- **Identity linkage (SA08.01):** anonymous touches → user → company. *Attribution model* (first / last / linear ⚙ D10), *Lookback window*. **Link manually** for unmatched signups (audited).
- **Spend imports & CAC (SA08.02):** **Import spend** per channel/month (CSV or ad-platform integration). CAC = spend ÷ new paying companies by channel.
- **Signup cohort funnel (SA08.03):** signup → activation (*Activation event per feature*, ⚙ D11) → first payment.
- **CAC payback & lifetime contribution (SA08.04):** uses **contribution, not revenue** (banner). Cohorts with < N months show "Insufficient history" / "Projected".

---

### 2.11 Adoption & retention — `/adoption` (`components/modules/adoption.tsx`) · SA09.01–SA09.04

- **Feature adoption (SA09.01):** % of active companies using each feature; "No seat model" where seat-based metrics don't apply.
- **Task success by model & prompt version (SA09.02):** success = ⚙ D11 definition + explicit feedback. Contradiction **C02** handled: depends on SA10.04 prompt versions; if prompt versioning is disabled, group by model only and show the note.
- **Revenue retention (SA09.03):** gross & net revenue retention, logo churn, trailing 12 months.
- **Customer health & support burden (SA09.04):** weighted score; inputs listed in *Definitions*; "Not scored" / "Sparse" when inputs missing.

All read-only. Capability view.usage (+ view.finance for revenue retention).

---

### 2.12 Models & agents — `/ai` (`components/modules/ai.tsx`) · SA10.01–SA10.04

**Purpose.** Which AI models we use, how requests are routed, and guardrails on agents.

- **Provider & model registry (SA10.01):** **Register model** (provider from Settings › Integrations, model name, region, capabilities, status). Model can't be enabled without an effective rate (SA03.02) — enforce.
- **Routing policy (SA10.02):** ordered primary → fallbacks, *Price ceiling*, *Retry limit*, *Prompt cache* / *Response cache* toggles. **Cache & fallback effect · 7 d** shows savings and fallback rate.
- **Agent execution limits (SA10.03):** max steps, max tool calls, max runtime, max credits per run. **Recently stopped runs** with reason.
- **Prompt versions & evaluations (SA10.04):** versions, eval scores, **Promote**, **Roll back** (each a `config_release`). *Eval data source* respects ⚙ D13 (no customer content unless allowed).

Capabilities: act.ops (routing/limits), act.pricing not required. Audited.

---

### 2.13 Knowledge & integrations — `/knowledge` (`components/modules/knowledge.tsx`) · SA11.01–SA11.04

**Purpose.** Customers' connected document sources (Google Drive, Notion, etc.) used for retrieval.

- **Knowledge sources (SA11.01):** per tenant connector, status, last sync, docs, errors. **Retry failed**.
- **Permission-aware retrieval (SA11.02):** ACL freshness per namespace; alert banner when stale beyond target (e.g. *ns_10019 ACLs stale beyond target*). Retrieval must filter by the end user's source permissions — fail closed when ACLs are stale beyond the hard limit (⚙ D17).
- **Chunking & embedding:** versioned settings; re-index job on change.
- **Connector credentials (SA11.03):** status, scopes, expiry, "Owner unknown". **Request re-auth** (emails tenant owner), **Revoke**. Tokens stored in the vault, never shown.
- **Storage by tenant / Lifecycle (SA11.04):** bytes, cost, retention; feeds shared cost allocation.

> Distinction: **customer** connectors live here; **platform** integrations (our own OpenAI/Anthropic/OpenRouter/Stripe keys, our Google Drive) live in Settings › Integrations & keys (2.20).

---

### 2.14 Budgets & emergency — `/controls` (`components/modules/controls.tsx`) · SA12.01–SA12.04

- **Spend & rate limit hierarchy (SA12.01):** platform → company → workspace → user → agent → API key; the *tightest* applies. Each limit: metric (cost, credits, requests), window, value, action (alert / throttle / block). *Per run* limits. *When limit service is unavailable* (⚙ D12). **Edit** opens form; changes audited.
- **Kill switches (SA12.02):** targets: provider, model, agent, feature, company, integration. **Activate** (reason required, preview of affected traffic/customers) → propagate to the request gateway; target delay ⚙ D17 ("TBD · D17"). **Restore** requires a second admin (or reason + cooldown, configurable). Banner: **Never blocks admin access**.
- **Abuse & trial-farming signals (SA12.03):** signals (shared payment fingerprint, disposable domains, burst signups, IP clusters). **Review** → suspend / allow / dismiss (audited).
- **Alert catalogue & routing (SA12.04):** rules, severity, recipients (email, Slack, pager), escalation. **Active incidents** list with acknowledge/resolve.

Capabilities: act.ops, act.killswitch.

---

### 2.15 Security & audit — `/security` (`components/modules/security.tsx`, `support-access.tsx`) · SA13.01–SA13.04

- **Administrators (SA13.01):** list, role, MFA status, last login, sessions. **Revoke** session/admin.
- **Role → capability matrix:** editable by act.roles (⚙ D14); shows *granted* / *not granted*.
- **Audit trail (SA13.02):** filter by *Actor*, *Action*, *Target*, date. *Integrity* column verifies the hash chain (green = chain intact). **Export** (act.export) — exports are themselves audited.
- **Data handling & retention (SA13.03):** *Content logging policy* (⚙ D13: none / metadata only / redacted / full with TTL), **Retention classes** per data type.
- **Controlled support access (SA13.04):** **Start support session** form: Company, *Case reference (required)*, Scope (metadata / read content / act as admin-of-tenant), Duration (max ⚙ D14). Banner **No impersonation** — sessions act under the admin's own identity, every request in-session carries `support_session_id` and is audited; auto-expire; tenant owner notified (⚙ D20). Contradiction **C01**: P0 support access depends on P1 support cases — if cases module is off, accept a free-text external ticket reference.

Capability: act.support to open sessions; view.security to view.

---

### 2.16 Operations — `/operations` (`components/modules/operations.tsx`) · SA14.01–SA14.04

- **Event pipeline freshness (SA14.01):** per source lag and last event; drives the "Incomplete" flags across the app.
- **Unmatched & duplicate events:** dedupe by idempotency key; **Retry** reprocessing.
- **Service health & Background jobs (SA14.02):** status per service; jobs with **Pause**, **Retry**.
- **Backups & integrity checks (SA14.03):** last backup, restore test date, ledger/audit integrity check results. RPO/RTO "Not defined" until ⚙ D17 set.
- **Admin configuration releases (SA14.04):** history of every config change (plans, routing, prompts, limits) with diff; **Roll back** creates a new release reverting to the previous version (contradiction **C03**).

Capability: act.ops.

---

### 2.17 Support & comms — `/support` (`components/modules/support.tsx`) · SA15.01–SA15.04

- **Support cases (SA15.01):** list with minutes and cost-to-serve. *Support labor classification (C05)*: if support cost is allocated here, exclude it from SA03.03 shared costs (enforce one or the other via a single setting).
- **Customer notification templates & Delivery log (SA15.02):** templates (low balance, payment failed, suspension, kill-switch impact) using Brand settings; **Send test**; delivery log 24 h with bounces.
- **Billing explanation and evidence (SA15.03):** *Charge explanation* for a task: attempts → rate version → credits → invoice line. **Customer-facing mirror (G01)**: the same explanation the customer sees (no margin).
- **Goodwill & service credits (SA15.04):** form: Company, Bucket, Type, Amount, Expiry, Linked case → posts a ledger entry. Above threshold → **Request grant** (approval by Finance/Owner). Contradiction **C04** noted.

Capability: act.support (+ approval act.finance above threshold).

---

### 2.18 Developer access — `/developer` (`components/modules/developer.tsx`) · SA16.01–SA16.04

- **API keys & service accounts (SA16.01):** prefix, scopes, environment, last used, expiry. Store only a hash. **Rotate** (show new key once), **Revoke**.
- **Outbound webhooks (SA16.02):** endpoints per tenant, event types, signing secret in vault, retry with backoff, delivery log.
- **Environment separation (SA16.03) / Environment switcher:** production vs sandbox data, keys and webhooks never cross. The header environment badge must come from this.
- **Bring-your-own-key (SA16.04):** *BYOK availability* per plan, *Platform fee on BYOK*, *On customer key failure* (fail / fall back to platform key with charge) — all ⚙ D16. Customer keys encrypted in vault; admins can never view them.

---

### 2.19 Reports — `/reports` (`components/modules/reports.tsx`) · SA01.02, SA01.04

- **Drill path / Saved views (SA01.02):** drill-down path platform → segment → company → workspace → user → task. **Save current view** stores the scope-bar params + filters. Each saved view shows *Snapshot labelling* (live vs snapshot at date; estimated/reconciled).
- **Scheduled reports & export jobs (SA01.04):** **New schedule** (report, cadence, recipients restricted by *Recipient domain allowlist*), **Export** (CSV) as a background job; exports respect the requester's capabilities (rows/fields redacted accordingly). Labels like "Rated", "Allocated by seats" appear in the export header.

Capability: act.export.

---

### 2.20 Platform settings — `/settings` (`components/modules/settings-integrations.tsx`, `settings-other.tsx`) · new requirements G-series (see `/spec/coverage` → gaps beyond source spec)

**Purpose.** The answers to "Where are my keys? Where are admin logins? Where is the logo?"

**Tab: Integrations & keys**
- **Connected integrations:** grouped by *Integration category* (AI providers: OpenAI, Anthropic, Google, OpenRouter…; Payments: Stripe; Storage: Google Drive, S3; Email; Analytics; Tax). Each row: environment, status, monthly spend cap, last check. Actions **Disable**.
- **Add integration** wizard: choose service → Name, Environment, Secret value, *Monthly spend cap (USD)*, *Spending account label*, *Rotate every*, *Next step after saving*. On save: store secret in vault, run a **live test call** (e.g. list models), store `last4`, set status connected/failed. For AI providers, *Next step* offers "Register models" (2.12) and "Add rate card" (2.5). Panel "Before customers use it" lists what is still required (rates, routing).
- **Key vault:** label, integration, last4, created, rotated, expires, status. **Add secret**, **Rotate** (New secret value — old kept active for an overlap window, then revoked), **Revoke**. Values are write-only — **never** returned by any API.
- Capability: act.settings (Owner). Every vault action audited without the secret value.

**Tab: Admin team**
- Explainer "Where admin user IDs and passwords are kept": passwords are hashed by the auth system; nobody (including the owner) can read them.
- **Admin team** table; **Invite admin** (Full name, Work email, Role, *Access expires*). **Reset access** sends a reset link and revokes sessions (never sets a password). **Remove**.
- **Sign-in rules:** *Sign-in method*, *Second factor (MFA)* required, *Sign out after inactivity*, *Allowed networks* (IP allowlist).
- **Emergency (break-glass) account:** sealed credentials, use triggers alert to all owners and is audited.
- Capability: act.roles.

**Tab: Brand**
- **Brand identity:** Product name, logo upload (blob storage, PNG/SVG, max size), *Primary colour* (*Pick colour*), favicon.
- **Email sender & domain:** From name, From address, *Sent through* (email integration); show DNS records and verification status.
- Support email shown to customers, Help centre URL, Terms & privacy URLs.
- **Customer preview** renders an email/login with the draft brand; "What brand settings change" explains impact. Publishing brand creates a `config_release`.
- Capability: act.settings.

**Tab: General**
- **Company & legal details:** Legal entity, Registered address, Tax / VAT number (printed on invoices).
- **Money & time defaults:** *Reporting currency*, *Reporting time zone*, *Financial year starts*, *Period close day* (⚙ D18, D19). Changing currency after the first closed period is blocked (requires a migration).
- **Environments:** production / sandbox list.

---

### 2.21 Specification pages — `/spec`, `/spec/coverage`, `/spec/decisions`, `/spec/states`

Internal documentation screens driven by `lib/spec.ts`. Keep them; restrict to Owner in production (or remove from the production nav). When a section goes live, update its coverage status in `lib/spec.ts`.

---

## 3. Open business decisions → configuration keys

Store each in a `platform_policy` table (`key`, `value jsonb`, `version`, `updated_by`). Seed with the assumed default shown in `/spec/decisions`. Changing a policy is a `config_release` and is audited.

| ID | Decision | Config key(s) | Used by |
|---|---|---|---|
| D01 | Commercial unit | `pricing.unit` | Plans, Credits, Billing |
| D02 | Credit conversion & rounding | `pricing.precision`, `pricing.rounding_mode`, `pricing.rounding_stage` | Plans, Credits, Usage |
| D03 | Allowance ownership | `credits.allowance_scope` | Credits |
| D04 | Exhaustion & overages | `credits.exhaustion_action`, `credits.topup.*` | Credits, Controls |
| D05 | Failure/cancellation charges | `metering.billable_rules` | Usage, Support evidence |
| D06 | Credit expiry & rollover | `credits.expiry.*`, `plans.rollover` | Credits, Plans |
| D07 | Plan migration & proration | `subscriptions.proration`, `subscriptions.change_timing` | Plans |
| D08 | Revenue/cost classification | `finance.classification` | Profitability |
| D09 | Shared cost allocation | `costs.allocation_drivers` | Usage, Profitability |
| D10 | Attribution & CAC | `growth.attribution_model`, `growth.lookback_days` | Growth |
| D11 | Activation & success | `adoption.activation_events`, `adoption.success_definition` | Adoption, Growth |
| D12 | Budget exposure | `limits.unavailable_policy`, `limits.inflight_cap` | Controls, Credits |
| D13 | Customer data policy | `data.content_logging`, `data.retention.*`, `data.eval_use` | Security, AI |
| D14 | Roles & approvals | `rbac.matrix`, `approvals.thresholds` | Everywhere |
| D15 | Provider/model/region support | `ai.allowed_regions`, registry | AI, Settings |
| D16 | BYOK | `byok.*` | Developer |
| D17 | Recovery/propagation targets | `ops.rpo`, `ops.rto`, `ops.killswitch_target_ms` | Controls, Operations |
| D18 | Billing boundaries & late events | `billing.timezone`, `billing.cutoff`, `billing.late_usage` | Billing |
| D19 | Currencies & close | `finance.reporting_ccy`, `finance.fx_source`, `finance.reopen_policy` | Profitability, Settings |
| D20 | Notification & collection policy | `billing.dunning.*`, `notify.recipients` | Billing, Support |

Rule: **code reads policy; code never contains the answer.** If a policy is unset, the dependent feature shows the incomplete/"TBD" state already in the design rather than guessing.

## 4. Known contradictions (implement as stated)

| ID | Issue | Resolution in build |
|---|---|---|
| C01 | P0 support access depends on P1 support cases | Case reference is a free-text field when cases module is disabled. |
| C02 | P0 task success depends on P1 prompt versions | Group by model only when prompt versioning is off. |
| C03 | Plan publish vs config releases both version | Single `config_release` table with `kind`. |
| C04 | Role matrix grants a P1 capability | Seed as shown; configurable in matrix. |
| C05 | Support labour counted twice | One setting `costs.support_labor_location ∈ {shared_costs, support_cases}`; the other side shows it as excluded. |

## 5. Cross-cutting acceptance checklist

- [ ] No page renders sample data in production; "Sample data" labels removed only where live.
- [ ] Every endpoint enforces capability on the server; field redaction for `view.margin`.
- [ ] Every figure carries `basis`; mixed totals show split; forecasts never added to actuals.
- [ ] Every mutation: preview → confirm (with `previewHash`) → transaction → hash-chained audit row → revalidate.
- [ ] Ledgers (credits, audit) are append-only; balance equation verified on read.
- [ ] Rates, plans, policies, prompts, routing are versioned; history immutable; rollback = new version.
- [ ] Secrets write-only; only `last4` ever leaves the vault.
- [ ] Per-panel loading / empty / error / restricted / incomplete states wired to real responses.
- [ ] Production and sandbox fully separated (data, keys, webhooks).
- [ ] Help text in `lib/help.ts` still matches each panel's behaviour after implementation.
- [ ] Feature ID tags preserved on every section; `/spec/coverage` updated.
