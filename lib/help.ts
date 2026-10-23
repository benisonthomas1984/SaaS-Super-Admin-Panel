// Plain-language explanations for every section of the superadmin panel.
// Written for a non-technical administrator. Section help is matched by panel title
// (text before " · "), falling back to a prefix match, then to the feature ID.

export type Help = {
  what: string
  how?: string
  actions?: string[]
  example?: string
  watch?: string
}

export const STAT_HELP: Record<string, Help> = {
  'Recognized revenue': {
    what: 'The money you have actually earned in this period by delivering the service — not the money that arrived in the bank.',
    how: 'Subscription fees are spread evenly across the days they cover, plus usage charges for work already done. Example: a $1,200 annual prepayment counts as $100 per month, not $1,200 in the month it was paid.',
    example: '$184,212 earned so far in October. It is marked "Estimated" because some October usage has not been finalized on invoices yet.',
    watch: 'An "Estimated" badge with ≈ means the figure can still change. Only "Reconciled" or "Period closed" figures are final.',
  },
  'Cash collected': {
    what: 'Money that actually reached your bank account through the payment provider (for example Stripe) in this period.',
    how: 'Sum of successful, settled payments minus refunds, taken from verified payment-provider events. Failed or pending payments are not included.',
    example: '$201,870 collected in October — higher than revenue because one customer prepaid a full year ($38,400) that will be earned over 12 months.',
    watch: 'Cash and revenue are different on purpose. A big gap is normal when customers prepay.',
  },
  'Service cost': {
    what: 'What it cost you to deliver the AI service: model provider bills (OpenAI, Anthropic, etc.), hosting, vector database, OCR and other usage-driven costs.',
    how: 'Every AI call is priced using the provider rate that was valid on that date (see Usage › Rate catalogue). Shared costs like hosting are split across customers by an allocation rule. Later, provider invoices are compared to this estimate (reconciliation).',
    example: '$71,904 so far, with 91.4% data coverage — Provider B has not sent usage for 21–23 Oct yet.',
    watch: '"Incomplete" means data is missing. Missing data is never treated as zero, so the true cost will be higher.',
  },
  'Gross profit': {
    what: 'Revenue minus service cost — how much you keep after paying for the AI and infrastructure that delivered the service.',
    how: 'Recognized revenue − service cost. Because service cost is incomplete, this is provisional and probably slightly overstated.',
    example: '$112,308 provisional gross profit (about 61% margin).',
    watch: 'Only roles allowed to see margin (Owner, Finance) can view this. Others see "Restricted".',
  },
  'Recurring revenue (MRR)': {
    what: 'Monthly recurring revenue: the predictable subscription income you would receive each month if nothing changed.',
    how: 'Sum of all active subscriptions converted to a monthly amount (annual plans divided by 12). One-off top-ups and usage overages are excluded.',
    example: '$196,540 per month, up 2.4% from last month.',
  },
  'Paying companies': {
    what: 'The number of customer companies currently on a paid plan.',
    how: 'Counts companies, not users. Free trials, your own staff accounts and test accounts are excluded.',
    example: '412 paying companies, 9 more than last month. A company adding 10 seats is still one company.',
  },
}

export const SECTION_HELP: Record<string, Help> = {
  // ─── Executive dashboard (SA01) ───
  'Daily revenue vs service cost': {
    what: 'A day-by-day chart comparing what you earned with what it cost to deliver.',
    how: 'Each day shows recognized revenue next to service cost. Striped bars mean that day\'s cost data is incomplete (a provider has not sent full usage yet).',
    actions: ['Hover a bar to see exact values', 'Click through to Usage › Provider reconciliation to see what is missing'],
    watch: 'If cost bars are striped, the gap between revenue and cost looks better than it really is.',
  },
  'Major exceptions': {
    what: 'A short list of problems that need attention — things like a provider feed being late, a payment webhook failing, or a customer burning credits unusually fast.',
    how: 'Alerts from across the platform (SA12.04) are grouped so one incident shows once, even if it triggered 50 alerts.',
    actions: ['Click an exception to open the evidence', 'Acknowledge or assign it from Budgets & emergency › Alerts'],
    example: '"Provider B usage feed delayed 52h" — that is why service cost is incomplete.',
  },
  'Forecast and margin monitoring': {
    what: 'A projection of where revenue, cost and margin will end up by month end, compared with your budget.',
    how: 'Uses the run-rate of complete days (incomplete days are excluded) and shows the method and confidence level. With less than the minimum history, it shows "Insufficient history" instead of guessing.',
    actions: ['Set the forecast horizon, minimum history and budget', 'Choose who receives alerts when a forecast crosses the budget'],
    watch: 'A forecast is a planning estimate, never a booked number.',
  },
  'Drill path': {
    what: 'The breadcrumb showing how deep you have drilled: Platform → Company → Workspace → User → Feature → Task → Attempt.',
    how: 'Every number in the panel can be clicked to see the records it is made of. The filters you had stay applied as you drill down.',
    actions: ['Click any level to jump back up', 'Fields your role cannot see show as "Restricted"'],
  },
  'Saved views': {
    what: 'Bookmarks of a report with its filters (period, plan, region, etc.) so you can reopen it in one click.',
    how: 'A saved view stores filters, not data — when you open it, it shows current figures.',
    actions: ['Save the current filters as a view', 'Rename or delete your views', 'Export the rows you are allowed to see'],
    example: '"EU Scale customers · margin < 40%" reopened every Monday.',
  },
  'Scheduled reports & export jobs': {
    what: 'Reports emailed automatically on a schedule, and large downloads prepared in the background.',
    how: 'You preview a report, pick recipients from an approved list, set a schedule (e.g. every Monday 08:00), then enable it. Large exports run as jobs and the download link expires after a set time for security.',
    actions: ['Create a schedule: Preview → Recipients → Schedule → Enable', 'Pause or delete a schedule', 'Download a finished export before it expires'],
    watch: 'Recipients must be on the allowlist so financial data cannot be emailed to anyone outside the company.',
  },

  // ─── Customers (SA02) ───
  'Identity & tenancy': {
    what: 'Who this customer is and where their data lives. "Tenancy" means each customer is a separate, isolated tenant — their data never mixes with another customer\'s.',
    how: 'Shows the permanent company ID (never changes, use it when talking to engineering), web domain, billing reference in the payment system, the region where data is stored (e.g. EU or US), and the internal account owner.',
    example: 'CO-10482 · northwind-logistics.example · data stored in EU-West.',
  },
  'Plan & contract': {
    what: 'What this customer has bought: plan, version, billing cycle, seats and any special terms.',
    how: '"Version" matters: if you change a plan later, existing customers stay on the version they bought unless you migrate them. "Overrides" are one-off exceptions for this customer only (e.g. +20% storage).',
    example: 'Scale v3 · monthly · 46 of 50 paid seats used · 1 override expiring 31 Dec.',
  },
  'Wallet': {
    what: 'The customer\'s credit balance. Credits are the internal currency customers spend when they use AI features.',
    how: 'Available = granted − spent − reserved − expired. "Reserved" credits are held for tasks still running and are released or charged when the task finishes.',
    actions: ['Open the full ledger to see every credit movement'],
    example: '182,400 credits available · 4,120 reserved for running tasks.',
  },
  'Usage & cost': {
    what: 'How much this customer used the product this month and what that cost you.',
    how: 'Root tasks are the jobs a user started; attempts include retries. Provider cost is first estimated from rate cards, then confirmed against the provider invoice (Reconciled).',
    watch: 'Compare "Provider cost (rated)" with last month\'s reconciled figure to spot unusual growth.',
  },
  'Billing': {
    what: 'The customer\'s money status: open invoice, usage not yet invoiced, any overdue amount, and the payment method on file.',
    how: '"Unbilled usage" is usage this cycle that will appear on the next invoice — it is shown with ≈ because it can still change.',
  },
  'Acquisition': {
    what: 'How this customer found you (marketing channel / campaign) and what it cost to acquire them.',
    how: 'First touch = the first marketing interaction recorded. Confidence shows how sure we are (High when the signup carried campaign tags). CAC = customer acquisition cost.',
  },
  'Health signals': {
    what: 'Early-warning indicators of whether this customer is happy and likely to stay.',
    how: 'Seat utilization (are they using what they pay for), accepted outcome rate (are AI results useful), failed payments, and survey scores. Missing signals are shown as missing, not as good.',
    watch: 'Advisory only — health signals never change billing or access automatically.',
  },
  'Support & recent audit': {
    what: 'Open support cases for this customer and the latest administrative changes made to their account.',
    how: 'Every admin change (overrides, seat caps, credits) is written to the audit trail with who did it, when, and why.',
  },
  'Workspaces': {
    what: 'Workspaces are teams or departments inside a customer company (e.g. Operations, Finance, Claims). Each has its own members and data.',
    how: 'The bar shows members per workspace. Seats are counted across the whole company: "46 used of 50 paid" means the company pays for 50 seats and 46 people hold one.',
    watch: 'Adding people beyond paid seats adds paid seats (prorated) — the system always shows the cost before you confirm.',
  },
  'Members': {
    what: 'Everyone with access to this company, their workspace, role and status.',
    how: 'Roles inside a customer company:\n• Workspace owner — full control of the workspace, including billing and deleting it. Exactly one per workspace.\n• Admin — can invite/remove members and change settings, but cannot delete the workspace or change ownership.\n• Member — uses the product; cannot manage people or settings.',
    actions: [
      'Invite member — enter email and role; shows seat impact before sending. Invites expire in 7 days.',
      'Revoke — removes access immediately and ends their sessions. The paid seat stays until the next billing cycle.',
      'Transfer ownership — makes another active member the owner. The previous owner becomes an Admin. Use this when the owner leaves the customer\'s company. Steps: click Transfer ownership → choose the new owner → enter a reason → confirm.',
    ],
    watch: 'A user may belong to several companies — access is always separate per company.',
  },
  'Request DSR': {
    what: 'A data subject request (DSR) — a legal request to export or delete a company\'s data (e.g. under GDPR).',
    how: 'Deletion runs as separate jobs for every place data is stored (database, files, search index, logs). Some records must be kept by law (invoices, audit) — these are listed with the reason. Backups expire on their own schedule, shown with dates.',
    watch: 'Deletion cannot be undone. The preview lists every store before you confirm.',
  },
  'New request': {
    what: 'Start a new data export, deletion or account closure for this company.',
    how: 'Choose the type and scope → review the preview of what will be affected → confirm with a reason. The request is queued and tracked above.',
  },

  // ─── Usage (SA03) ───
  'Root tasks': {
    what: 'Every job a customer started (e.g. "summarize this contract"), with its status, cost and credits charged.',
    how: 'A root task can trigger many steps: model calls, tool calls, retries and child agents. "Pending" means the cost has not been priced yet; "Rated" means it has.',
    actions: ['Filter by company, feature, model, status or environment', 'Click a task to open its full tree'],
  },
  'Task tree': {
    what: 'A breakdown of one task into every step it took, so you can see exactly where time and money went.',
    how: 'Each line is an attempt, tool call or sub-agent with its tokens, cost and credits. Failed attempts are shown because they still cost money.',
  },
  'Provider rate catalogue': {
    what: 'The price list from each AI provider (OpenAI, Anthropic, Google, OpenRouter…) — what you pay per 1,000 tokens or per call.',
    how: 'Rates are "effective-dated": when a provider changes prices you add a new version with a start date. Old usage keeps the old price, so history never changes.',
    actions: ['Add a future rate when a provider announces a price change', 'Note the source (public price list or your negotiated contract)'],
    example: 'Provider A large model: $3.00 per 1M input tokens from 1 Jul, $2.50 from 1 Nov.',
  },
  'Unrated exception queue': {
    what: 'Usage that could not be priced because no rate exists for that model or date.',
    how: 'These items are kept aside (not priced at $0) until someone adds the missing rate, then they are priced automatically.',
    actions: ['Add the missing rate, then re-rate the queue'],
  },
  'Non-token and shared costs': {
    what: 'Costs that are not AI tokens: vector database, file storage, hosting, OCR, monitoring tools, etc.',
    how: '• Direct costs can be tied to a specific customer or task (e.g. OCR pages for one customer).\n• Shared costs serve everyone (e.g. hosting) and are split using an "allocation driver" — a rule such as "share of usage" or "equal per company".\n• Unallocated is anything not yet split; it stays visible instead of being hidden.\nThe total must equal the supplier invoice ("tie-out").',
    actions: ['Add cost entry — enter the supplier invoice, amount, period and whether it is direct or shared', 'Change the allocation driver in Allocation policy'],
  },
  'Allocation policy': {
    what: 'The rules for splitting shared costs (like hosting) across customers.',
    how: 'Pick a driver for each cost type. Publishing creates a new version that applies from next month; closed months keep the old version so reports never change retroactively.',
    example: 'Hosting split by each customer\'s share of rated usage; monitoring split equally per active company.',
  },
  'Provider reconciliation': {
    what: 'Checking our own cost estimate against the actual invoice from each AI provider.',
    how: '1. Import or sync the provider statement.\n2. The system matches lines by account, project, API key, model and date.\n3. The difference (variance) is compared with your tolerance (e.g. ±0.5%).\n4. If within tolerance → Reconciled. If not, post an adjustment explaining the gap, then mark reconciled.',
    actions: ['Import statement', 'Post adjustment with a reason code', 'Mark reconciled (blocked while variance is unexplained)'],
    watch: 'Statement lines that match no customer are shown as unmatched — never assigned to a customer by guesswork.',
  },

  // ─── Credits (SA04) ───
  'Credit buckets': {
    what: 'Credits come in "buckets" by source: included with the plan, purchased top-ups, promotional, goodwill. Each bucket can have its own expiry.',
    how: 'For each bucket: granted, available, reserved (held for running tasks), spent and expired. Spend order decides which bucket is used first (usually the one expiring soonest).',
    watch: 'Credits are not cash and not tokens. 1 credit has a fixed sell rate set in Plans › Credit pricing.',
  },
  'User sublimits': {
    what: 'Optional caps on how many credits an individual user can spend from the company pool.',
    how: 'A user\'s limit can never be larger than the company balance. Useful to stop one person using the whole allowance.',
  },
  'Reservations': {
    what: 'Credits put on hold while a task is running, so a customer cannot overspend by starting many tasks at once.',
    how: 'When a task starts, an estimate is reserved. When it finishes, the real amount is charged and the rest released ("settled"). If the outcome is unknown (e.g. a crash), it waits for the recovery policy.',
  },
  'Settlement trace': {
    what: 'A step-by-step record of how one reservation was settled — proof that it was charged exactly once.',
  },
  'Recovery policy': {
    what: 'What to do with reservations stuck in an unknown state (for example, the AI provider timed out).',
    how: 'Set the timeout and whether to release or charge after it. This is an open business decision, so it is configurable.',
  },
  'Immutable ledger': {
    what: 'The complete history of every credit movement for a customer — like a bank statement.',
    how: '"Immutable" means entries are never edited or deleted. Mistakes are fixed by adding a new correcting entry linked to the original, with a reason. Large corrections need a second administrator to approve.',
    actions: ['Post correction (with reason)', 'Filter by type or date'],
  },
  'Exhaustion policy': {
    what: 'What happens when a customer runs out of credits.',
    how: 'Choose one: Stop (block new tasks), Approved overage (keep going and bill extra), or Auto top-up (buy more automatically when the balance drops below a minimum, up to a monthly cap).',
  },
  'Top-up attempts': {
    what: 'A log of automatic or manual credit purchases, including failed card charges and retries.',
  },

  // ─── Plans (SA05) ───
  'Plan catalogue': {
    what: 'The list of all packages you sell (e.g. Starter, Growth, Scale, Enterprise) with price, included credits, seats and features. A "plan" and a "package" mean the same thing here.',
    how: 'Each plan has versions. Draft = being edited, not visible to customers. Published = available to buy. Legacy = old version still used by existing customers but no longer sold.',
    actions: ['Create plan — opens a step-by-step builder (name → price → credits & seats → features & models → review)', 'Duplicate a plan as a new draft version', 'Open a draft to publish it'],
  },
  'Publish': {
    what: 'Make a draft plan version live so customers can buy it.',
    how: '1. Pick the draft to publish.\n2. Effective from — the date it goes live.\n3. Eligibility — "New customers only" or "New + existing customers who choose to upgrade".\n4. Existing customers — stay on their current version, or move at their next renewal.\n5. Rollout — everyone at once, or a percentage first (staged rollout).\n6. Preview the impact, then Publish with a reason.',
    watch: 'Publishing never silently changes what existing customers pay — migration is always an explicit choice.',
  },
  'Customer overrides': {
    what: 'One-off exceptions for a single customer, e.g. extra storage or access to a model their plan does not include.',
    how: 'Every override needs a reason and should have an expiry date so exceptions do not last forever.',
  },
  'Sell-rate policy': {
    what: 'How many credits each AI action costs the customer — your price list in credits.',
    how: 'This is separate from what providers charge you. The difference between the two is your margin. You also set precision (e.g. 0.01 credit) and when rounding happens.',
    example: 'Large model output: 1.60 credits per 1,000 tokens.',
  },
  'Sample task preview': {
    what: 'A worked example showing how a real task would be charged under the current rules.',
    how: 'Adds up each resource × its credit rate, then applies rounding. The same number appears in the customer\'s usage history, invoice and wallet.',
  },
  'Trials & promotions': {
    what: 'Free trials, discount coupons and bonus credits used to win customers.',
    how: 'Each offer has eligibility (who can use it), limits (how much), and expiry. "Stacking" decides whether a customer can combine offers.',
    actions: ['Create offer', 'Pause or end an offer'],
  },
  'Enterprise contracts': {
    what: 'Custom deals negotiated with large customers — special prices, committed spend, regions.',
    how: 'Precedence: contract terms override the standard plan; promotions only apply if the contract allows.',
  },
  'Subscription change preview': {
    what: 'Shows exactly what happens before you upgrade, downgrade, pause, cancel or reactivate a customer\'s subscription.',
    how: 'Calculates proration (the partial charge or credit for the rest of the cycle), new credits and seats, and checks conflicts — e.g. a downgrade is blocked if they use more seats than the smaller plan allows.',
  },

  // ─── Billing (SA06) ───
  'Unbilled usage preview': {
    what: 'Usage this billing cycle that will appear on the next invoice.',
    how: 'Shown as an estimate until the invoice is finalized at the cutoff time.',
  },
  'Late usage policy': {
    what: 'What to do with usage that arrives after an invoice was already finalized (e.g. a delayed provider feed).',
    how: 'Options: add it to the next invoice, or issue a separate debit note.',
  },
  'Invoices': {
    what: 'All invoices: draft, finalized, paid, overdue. Each line links back to the usage that created it.',
    actions: ['Open an invoice', 'Issue a credit note (reduce) or debit note (add)'],
  },
  'Payment provider events': {
    what: 'Messages ("webhooks") sent by your payment provider (e.g. Stripe) when something happens — payment succeeded, failed, refunded, disputed.',
    how: 'Each event is verified with a signature so fakes are rejected. Duplicates are ignored and out-of-order events are handled safely.',
    actions: ['Replay a failed event (with permission)', 'Resolve an exception'],
    watch: '"Invalid signature" means the message did not come from your payment provider — never trust it.',
  },
  'Past-due accounts': {
    what: 'Customers who have not paid on time, grouped by how late (aging buckets: 1–30, 31–60, 61–90, 90+ days).',
    actions: ['See the next scheduled action (reminder, retry, suspend)', 'Write off an uncollectable amount (requires authority)'],
  },
  'Collection policy': {
    what: 'The automatic steps taken when a payment fails: retry schedule, reminder emails, grace period, and when access is limited.',
  },
  'Refund preview': {
    what: 'Shows the full effect of a refund before you issue it: cash returned, credits reversed, and provider cost you still paid.',
    how: 'Choose a reason code. The preview shows margin impact because AI provider costs already incurred cannot be refunded to you.',
  },
  'Disputes & accounting export': {
    what: 'Chargebacks raised by a customer\'s bank, and the status of sending billing data to your accounting system.',
    watch: 'While a dispute is open, refunds on that payment are restricted to avoid paying twice.',
  },

  // ─── Profitability (SA07) ───
  'Chart-of-accounts mapping': {
    what: 'A "chart of accounts" is your accountant\'s list of categories (e.g. 4000 Subscription revenue, 5100 AI provider costs). This screen decides which category each item in the platform goes into.',
    how: 'Every revenue and cost type is mapped to exactly one account. Each cost is either a "service cost" (counts in gross margin) or an "operating expense" (counts below gross margin) — never both.',
    actions: ['Add mapping — choose the platform item, the account code and the classification', 'Change a mapping (applies to open periods only)'],
    example: 'OpenAI invoices → 5100 AI provider costs → Service cost.',
  },
  'Revenue recognition': {
    what: 'The schedule for when prepaid money becomes "earned" revenue.',
    how: 'An annual plan paid upfront is recognized 1/12 each month. Credits are recognized when they are used or expire.',
  },
  'Customer unit economics': {
    what: 'Profitability per customer: their revenue, their direct costs, their share of shared costs, and the resulting margin.',
    actions: ['Sort by margin to find unprofitable customers', 'Drill into a customer to see why'],
  },
  'Feature & model cost': {
    what: 'Cost broken down by product feature and AI model, so you can see which features are expensive to run.',
    how: 'Revenue is shown only when it can be fairly attributed to a feature; otherwise cost only.',
  },
  'Thresholds': {
    what: 'The margin levels that trigger warnings (e.g. alert if a customer\'s margin drops below 40%).',
  },
  'Operating result': {
    what: 'Your profit and loss statement: revenue minus service cost minus operating expenses.',
    how: '"Accrual" means income and costs are counted when earned or incurred, not when cash moves.',
  },
  'Cash movement': {
    what: 'Real money in and out of the bank this period, shown next to the profit and loss so you can see both views.',
  },
  'Period close': {
    what: 'Locking a month once its numbers are final. After closing, figures cannot change — corrections go into the next open month as linked adjustments.',
    actions: ['Close period (Finance)', 'Reopen period (requires permission and a reason)'],
  },
  'FX rates': {
    what: 'Currency exchange rates used to convert foreign-currency amounts into your reporting currency.',
    how: 'Shows the source and the date of each rate. If a rate is missing the amount shows as unavailable — it is never converted at a guessed rate.',
  },

  // ─── Growth (SA08) ───
  'Identity linkage': {
    what: 'Connecting a website visitor, a signup and a paying company into one customer journey, so marketing can be credited correctly.',
    how: 'Links are made using signup tags, email domain and billing records. Unknown sources stay "Unknown" rather than being guessed.',
  },
  'Spend imports': {
    what: 'Marketing spend pulled in from ad platforms (Google Ads, LinkedIn, etc.).',
    how: 'Each source shows when it last imported successfully. Spend is mapped to a channel so CAC can be calculated.',
  },
  'CAC by channel': {
    what: 'CAC (customer acquisition cost) = how much marketing spend it took to win one paying company, per channel.',
    how: 'Ad-only CAC = ad spend ÷ new paying companies. Fully loaded CAC also includes salaries, tools and trial costs. Shows "n.a." if no customers were won (to avoid dividing by zero).',
  },
  'Signup cohort funnel': {
    what: 'Of the companies that signed up in a month, how many activated, became paying, and stayed.',
    how: 'Recent cohorts are labelled "immature" because they have not had time to convert yet.',
  },
  'CAC payback & lifetime contribution': {
    what: 'How many months it takes for a customer\'s contribution (revenue minus cost) to repay what it cost to acquire them.',
    how: 'Observed values (what really happened) are shown next to modelled projections, with the model version and date. New cohorts show "unavailable".',
  },

  // ─── Adoption (SA09) ───
  'Feature adoption': {
    what: 'Which features customers actually use, compared with how many could use them.',
    how: 'Eligible = companies whose plan includes the feature. Active = used it in the period. Staff and test accounts are excluded. Also shows unused paid seats.',
  },
  'Task success by model & prompt version': {
    what: 'How often AI tasks produced a useful result.',
    how: 'Completed (finished technically) vs Accepted (user kept the result) vs Rejected vs Unknown (no feedback). Cost per useful outcome includes the cost of retries.',
  },
  'Revenue retention': {
    what: 'How much revenue you keep from existing customers over time.',
    how: 'Starting revenue + expansion (upgrades) − contraction (downgrades) − churn (cancellations) = ending revenue.\nGRR (gross revenue retention) ignores expansion; NRR (net revenue retention) includes it. NRR above 100% means existing customers grow faster than you lose them.',
  },
  'Customer health & support burden': {
    what: 'A transparent health score per customer, built from visible signals, plus how much support effort they need.',
    how: 'Each signal shows its reason. Missing signals are shown. A person can override the score, but the computed values stay visible. Advisory only.',
  },

  // ─── AI (SA10) ───
  'Provider & model registry': {
    what: 'The list of AI providers and models the platform is allowed to use, and which plans and environments can use each one.',
    how: 'To add a model: register it → validate (a test call) → enable it for plans and environments. API keys are stored in the key vault (Settings › Integrations) and are always masked here. Retired models cannot receive new traffic.',
    actions: ['Register model', 'Validate', 'Enable for plans / environments', 'Retire'],
  },
  'Routing policy': {
    what: 'Rules that decide which model handles each request, and what to fall back to if it fails.',
    how: 'An ordered list: try model 1; if unavailable, try model 2, and so on. Each fallback is checked for region, privacy and plan eligibility. The preview explains why each request would go where.',
  },
  'Cache & fallback effect': {
    what: 'How much money and time caching and fallbacks saved (or cost) in the last 7 days.',
    how: 'Caching reuses an identical answer for the same customer instead of paying for a new AI call. Caches are never shared between customers.',
  },
  'Agent execution limits': {
    what: 'Safety limits on AI agents: maximum steps, spend, duration, retries and which tools they may use.',
    how: 'If an agent hits a limit it is stopped and the reason is logged. Irreversible actions (sending email, deleting data) require explicit authorization.',
  },
  'Recently stopped runs': {
    what: 'Agent runs that were stopped by a guardrail, with the reason (e.g. "spend limit reached").',
  },
  'Prompt versions & evaluations': {
    what: 'Testing a new version of an AI instruction ("prompt") against the current one before releasing it.',
    how: 'Both versions run on a test dataset and are compared on quality, safety, speed and cost. You release to a small cohort first and set a rollback threshold. An approver must sign off.',
  },

  // ─── Knowledge (SA11) ───
  'Knowledge sources': {
    what: 'Customer documents connected for the AI to search (e.g. Google Drive, SharePoint, uploaded files).',
    how: 'Shows sync progress, last successful sync, number of documents, failures and the cost of processing them.',
    actions: ['Pause a sync', 'Retry only the failed items'],
  },
  'Permission-aware retrieval': {
    what: 'Makes sure the AI only uses documents the asking user is allowed to see in the original system.',
    how: 'Access lists are synced from the source. If they are out of date, retrieval "fails closed" — it refuses rather than risk showing a private document.',
  },
  'Chunking & embedding': {
    what: 'How documents are split into small pieces and converted into a searchable form for the AI.',
  },
  'Connector credentials': {
    what: 'The logins (tokens) used to connect to each customer\'s external system, their permissions (scopes) and expiry.',
    actions: ['Reconnect an expired connector', 'Revoke — previews which sync jobs will stop'],
  },
  'Storage by tenant': {
    what: 'How much storage each customer uses by type (files, search index, backups) compared with their plan quota.',
  },
  'Lifecycle': {
    what: 'Cleanup of old data, with a preview of what will be removed and when backups expire.',
  },

  // ─── Controls (SA12) ───
  'Spend & rate limit hierarchy': {
    what: 'Spending and speed caps at every level: whole platform → provider → company → user → feature → single task.',
    how: 'The strictest applicable limit always wins. When a request is denied, the customer sees the reason and when the limit resets.',
  },
  'Kill switches': {
    what: 'Emergency off-buttons to immediately stop a model, feature, customer or the whole platform.',
    how: 'Choose the scope and mode: "Stop new" (let running tasks finish) or "Cancel running" (stop everything now). Preview the impact, give a reason and incident number, then watch it propagate.',
    watch: 'Use during incidents such as a runaway agent or a provider outage. Every activation is audited.',
  },
  'Abuse & trial-farming signals': {
    what: 'Suspicious behaviour, such as one person creating many free trials or unusual spend spikes.',
    actions: ['Review evidence', 'Apply a temporary throttle with an expiry'],
  },
  'Active incidents': {
    what: 'Ongoing problems being handled, with owner and status.',
  },
  'Alert catalogue & routing': {
    what: 'Every alert the platform can raise and who receives it (email, Slack, on-call pager) and how it escalates if no one responds.',
  },

  // ─── Security (SA13) ───
  'Role → capability matrix': {
    what: 'What each administrator role can see and do.',
    how: 'Roles: Platform owner, Finance, Operations, Support, Security, Read-only analyst. Each is limited on purpose (e.g. Support cannot see margins). Permissions are enforced by the server, not just hidden in the screen.',
  },
  'Administrators': {
    what: 'People who can sign in to this superadmin panel, their role, MFA status and sessions.',
    how: 'Manage accounts in Settings › Admin team. Passwords are never stored or shown — admins sign in with SSO or their own password plus MFA (a code from an authenticator app).',
  },
  'Audit trail': {
    what: 'A permanent log of every administrative action: who did what, to which record, when, and why.',
    how: 'Cannot be edited or deleted, not even by the owner. Search by person, action, customer or date.',
  },
  'Retention classes': {
    what: 'How long each type of data is kept (e.g. prompts 30 days, invoices 7 years) and what happens after.',
  },
  'Start support session': {
    what: 'Temporary, audited access to look inside a customer\'s account to help them.',
    how: 'Choose the customer, scope and duration, give a reason (e.g. a ticket number). A red banner shows while the session is active, and it expires automatically.',
  },

  // ─── Operations (SA14) ───
  'Event pipeline freshness': {
    what: 'Whether the data feeds behind every number are up to date.',
    how: 'Each feed shows its last event time and delay. Late feeds mark dependent numbers "Incomplete".',
  },
  'Unmatched & duplicate events': {
    what: 'Events that could not be linked to a customer, or arrived twice. Duplicates are counted once.',
  },
  'Background jobs': {
    what: 'Scheduled and queued work (invoice runs, syncs, exports) with status, retries and failures.',
    actions: ['Pause, resume or retry a job'],
  },
  'Service health': {
    what: 'Uptime and response time of each platform service and AI provider.',
  },
  'Backups & integrity checks': {
    what: 'When backups last ran, whether restore tests passed, and checks that totals still add up (e.g. wallet = ledger).',
  },
  'Admin configuration releases': {
    what: 'A change log for settings like pricing and limits, so a bad change can be rolled back.',
  },

  // ─── Support (SA15) ───
  'Support cases': {
    what: 'Customer support tickets with SLA (response deadline) and how much effort each takes (cost to serve).',
  },
  'Customer notification templates': {
    what: 'Emails and in-app messages the platform sends customers — low credits, payment failed, incident notices.',
    how: 'Templates use your brand assets (Settings › Brand). Preview before enabling.',
  },
  'Delivery log': {
    what: 'Which notifications were sent in the last 24 hours and whether they were delivered or bounced.',
  },
  'Charge explanation': {
    what: 'A plain explanation of exactly how a customer was charged for a task — useful when they question a bill.',
  },
  'Goodwill & service credits': {
    what: 'Free credits given to compensate a customer (e.g. after an outage).',
    how: 'Requires a reason; large amounts need a second approver.',
  },

  // ─── Developer (SA16) ───
  'API keys & service accounts': {
    what: 'Keys that customers use to call your platform\'s API from their own software.',
    how: 'The full key is shown only once at creation; afterwards only the last 4 characters. Keys can be scoped, rotated and revoked.',
    watch: 'Your own AI provider keys (OpenAI, Anthropic…) are managed separately in Settings › Integrations & keys.',
  },
  'Outbound webhooks': {
    what: 'Messages your platform sends to customers\' systems when events happen (task done, credits low).',
  },
  'Environment separation': {
    what: 'Production (real customers, real money), Staging (testing), Development and Evaluation are kept separate with different keys.',
  },
  'Bring-your-own-key': {
    what: '"BYOK" lets a customer use their own AI provider key, so the provider bills them directly.',
  },

  // ─── Settings (gap fill) ───
  'Connected integrations': {
    what: 'Every outside service the platform talks to: AI providers, document sources, payments, email and analytics.',
    how: 'To add one: click Add integration → choose the service → paste the API key or sign in → Test connection → choose environments → Save. The key goes into the encrypted vault; nobody can view it again, only replace it.',
    actions: ['Add integration', 'Test connection', 'Rotate key', 'Disable'],
  },
  'Key vault': {
    what: 'The secure, encrypted store for all secrets: AI provider API keys, payment keys, connector secrets.',
    how: 'Keys are shown masked (last 4 characters only). Each has an owner, environment, last-used time and rotation due date. Rotating replaces a key without downtime.',
    watch: 'Never paste keys into chat, email or documents. If a key leaks, rotate it here immediately.',
  },
  'Admin team': {
    what: 'The people who can sign in to this superadmin panel.',
    how: 'Invite by email and choose a role. They set their own password and MFA from the invite email — you never see or set their password. You can send a password reset, require MFA, end their sessions or disable them.',
  },
  'Sign-in policy': {
    what: 'Rules for how administrators sign in: SSO, password strength, MFA and session length.',
  },
  'Brand identity': {
    what: 'Your product name, logos, colours and favicon used on customer-facing pages, emails and invoices.',
  },
  'Email sender & domain': {
    what: 'The "from" address for customer emails and the custom domain for your app.',
    how: 'DNS records must be added at your domain provider to verify the sender — status shows when verification passes.',
  },
  'Legal & company details': {
    what: 'Your legal entity name, address, tax ID, support email and links to terms and privacy policy shown on invoices and emails.',
  },
  'Regional & financial defaults': {
    what: 'Reporting currency, timezone, fiscal year start and the default data region for new customers.',
  },
}

export function sectionHelp(title: string, features?: string[]): Help | undefined {
  const base = title.split(' · ')[0].trim()
  if (SECTION_HELP[base]) return SECTION_HELP[base]
  const key = Object.keys(SECTION_HELP).find((k) => base.startsWith(k))
  if (key) return SECTION_HELP[key]
  void features
  return undefined
}

export type PageGuide = {
  title: string
  summary: string
  why: string
  sections: { name: string; explain: string }[]
  tasks?: { title: string; steps: string[] }[]
}

export const PAGE_GUIDES: Record<string, PageGuide> = {
  '/': {
    title: 'Executive dashboard',
    summary: 'Your morning check-in: is the business healthy today? Shows revenue, cash, costs, profit and the problems that need attention.',
    why: 'Open this first every day. If something looks wrong, click the card to see the records behind it.',
    sections: [
      { name: 'Filter bar (Period, Comparison, Currency…)', explain: 'Period = which dates you are looking at (e.g. October month-to-date). Comparison = what to compare against (previous period or same period last year) — this drives the +/- % on each card. Currency = reporting currency. Company / Plan / Product / Region narrow every number on the page at once.' },
      { name: 'Data coverage strip', explain: 'Shows how complete the underlying data is. Below 100% means some feeds are late, so some numbers are provisional.' },
      { name: 'Metric cards', explain: 'Six headline numbers. The badge on each tells you how final it is: Reconciled = confirmed against source; Estimated (≈) = may still change; Incomplete = data missing; Forecast = projection.' },
      { name: 'Daily revenue vs service cost', explain: 'Day-by-day earnings against delivery cost.' },
      { name: 'Major exceptions', explain: 'Grouped problems to act on.' },
      { name: 'Forecast and margin monitoring', explain: 'Where the month is heading versus budget.' },
    ],
    tasks: [{ title: 'Investigate a number', steps: ['Click the metric card', 'You land on the detail screen with the same filters', 'Keep clicking rows to drill down to individual tasks'] }],
  },
  '/reports': {
    title: 'Reports & saved views',
    summary: 'Build, save, schedule and export reports.',
    why: 'Use it when you look at the same slice of data often, or need to send numbers to someone regularly.',
    sections: [
      { name: 'Drill path', explain: 'Navigate from platform totals down to a single task.' },
      { name: 'Saved views', explain: 'Bookmarks of filters you use often.' },
      { name: 'Scheduled reports & exports', explain: 'Automatic emailed reports and large downloads.' },
    ],
    tasks: [{ title: 'Schedule a weekly report', steps: ['Open Scheduled & exports', 'Click New schedule', 'Preview the report', 'Choose recipients from the allowlist', 'Pick day and time', 'Enable'] }],
  },
  '/customers': {
    title: 'Customers',
    summary: 'Every customer company, their plan, lifecycle state, revenue and health.',
    why: 'Start here to find a customer by name, ID, domain or billing reference.',
    sections: [
      { name: 'Search & lifecycle filter', explain: 'Lifecycle states: Trial → Paying → Past due → Suspended → Closing → Closed.' },
      { name: 'Customer table', explain: 'Click a row to open the Customer 360 profile.' },
      { name: 'Create company / Suspend / Restore', explain: 'Every lifecycle change shows its impact (e.g. what happens to running tasks) and asks for a reason.' },
    ],
  },
  '/customers/[id]': {
    title: 'Customer 360 profile',
    summary: 'Everything about one customer company on one page.',
    why: 'Use it when a customer contacts you, before a renewal, or when investigating a problem.',
    sections: [
      { name: 'Overview', explain: 'Identity & tenancy, Plan & contract, Wallet, Usage & cost, Billing, Acquisition, Health signals, Support & audit. Hover the ⓘ on each card for details.' },
      { name: 'Workspaces & members', explain: 'Teams inside the company, who belongs to each, and their role (Owner, Admin, Member). Invite, revoke and transfer ownership here.' },
      { name: 'Closure & data requests', explain: 'Data exports, deletion requests and account closure.' },
    ],
    tasks: [
      { title: 'Transfer workspace ownership', steps: ['Open Workspaces & members', 'Find the current Workspace owner', 'Click Transfer ownership', 'Choose the new owner (must be an active member)', 'Enter a reason and confirm', 'The previous owner becomes Admin'] },
      { title: 'Invite a user', steps: ['Click Invite member', 'Enter email and role', 'Check the seat impact', 'Enter a reason and confirm'] },
    ],
  },
  '/usage': {
    title: 'Usage, cost & attribution',
    summary: 'What customers did and what it cost you, down to every AI call.',
    why: 'This is the source of truth for service cost. If cost looks wrong on the dashboard, check here.',
    sections: [
      { name: 'Tasks & task tree', explain: 'Every job and the steps it took.' },
      { name: 'Rate catalogue', explain: 'Provider price lists over time.' },
      { name: 'Non-token & shared costs', explain: 'Hosting, storage, OCR and other costs, and how they are split.' },
      { name: 'Provider reconciliation', explain: 'Checking estimates against provider invoices.' },
    ],
    tasks: [
      { title: 'Add a non-token or shared cost', steps: ['Open Non-token & shared costs', 'Click Add cost entry', 'Enter supplier, invoice number, period and amount', 'Choose Direct (pick the customer) or Shared (pick an allocation driver)', 'Save — the tie-out check updates'] },
      { title: 'Reconcile a provider', steps: ['Open Provider reconciliation', 'Import the provider statement', 'Check the variance against tolerance', 'If over tolerance, post an adjustment with a reason', 'Mark reconciled'] },
    ],
  },
  '/credits': {
    title: 'Credits & wallet',
    summary: 'Customer credit balances and every movement in and out.',
    why: 'Use it to answer "why is my balance X?" or to correct a credit mistake.',
    sections: [
      { name: 'Buckets & balance', explain: 'Credits grouped by source and expiry.' },
      { name: 'Reservations', explain: 'Credits held for running tasks.' },
      { name: 'Ledger', explain: 'The permanent record of every movement.' },
      { name: 'Exhaustion & top-ups', explain: 'What happens when credits run out.' },
    ],
  },
  '/plans': {
    title: 'Plans & pricing',
    summary: 'Create and publish the packages you sell, set credit prices, run promotions and change subscriptions.',
    why: 'Plan = package = what a customer buys: a price, included credits, seats and features.',
    sections: [
      { name: 'Plan & entitlement catalogue', explain: 'All plans and versions. "Entitlement" means what a plan allows — features, models, seats, storage.' },
      { name: 'Credit pricing & rules', explain: 'How many credits each AI action costs.' },
      { name: 'Trials, promos & contracts', explain: 'Offers and enterprise deals.' },
      { name: 'Subscription changes', explain: 'Previewing upgrades, downgrades, pauses and cancellations.' },
    ],
    tasks: [
      { title: 'Create a new plan (package)', steps: ['Open Catalogue & versions', 'Click Create plan', 'Step 1: name, description and audience', 'Step 2: billing period and price per seat', 'Step 3: included credits, seat range and storage', 'Step 4: features and models included', 'Step 5: review and Save as draft'] },
      { title: 'Publish a plan', steps: ['In Publish a plan version, select the draft', 'Set effective date and eligibility', 'Choose what happens to existing customers', 'Choose rollout (all at once or staged)', 'Click Preview & publish, check the impact, enter a reason, confirm'] },
    ],
  },
  '/billing': {
    title: 'Billing & collections',
    summary: 'Invoices, payments, overdue accounts, refunds and disputes.',
    why: 'Use it to follow money from usage to invoice to cash.',
    sections: [
      { name: 'Invoices & unbilled usage', explain: 'What has been and will be billed.' },
      { name: 'Payments & webhooks', explain: 'Messages from the payment provider about payments.' },
      { name: 'Collections', explain: 'Chasing late payments.' },
      { name: 'Refunds & disputes', explain: 'Returning money and handling chargebacks.' },
    ],
  },
  '/profitability': {
    title: 'Profitability',
    summary: 'Are you making money — per customer, per feature and overall?',
    why: 'Use it for monthly finance reviews and pricing decisions.',
    sections: [
      { name: 'Classification', explain: 'Mapping platform items to accounting categories (chart of accounts).' },
      { name: 'Unit economics', explain: 'Margin per customer, plan, feature and model.' },
      { name: 'Operating result & cash', explain: 'Profit & loss next to cash movement.' },
      { name: 'FX & period close', explain: 'Currency conversion and locking final months.' },
    ],
    tasks: [{ title: 'Map a new cost to an account', steps: ['Open Classification', 'Click Add mapping', 'Choose the platform item (e.g. OpenRouter invoices)', 'Choose the account code', 'Choose Service cost or Operating expense', 'Save'] }],
  },
  '/growth': {
    title: 'Acquisition',
    summary: 'Where customers come from and what they cost to win.',
    why: 'Use it to decide where to spend marketing money.',
    sections: [
      { name: 'Attribution', explain: 'Which channel gets credit for each customer.' },
      { name: 'Spend & CAC', explain: 'Marketing spend and cost per new customer.' },
      { name: 'Funnel & cohorts', explain: 'Signup → active → paying, by month.' },
      { name: 'Payback & LTV', explain: 'How long until a customer repays their acquisition cost.' },
    ],
  },
  '/adoption': {
    title: 'Adoption & retention',
    summary: 'Do customers use the product, get value, and keep paying?',
    why: 'Low adoption today usually means churn later.',
    sections: [
      { name: 'Activation & features', explain: 'Who uses what.' },
      { name: 'Task success', explain: 'Whether AI results were useful.' },
      { name: 'Revenue retention', explain: 'GRR and NRR.' },
      { name: 'Account health', explain: 'Early-warning signals per customer.' },
    ],
  },
  '/ai': {
    title: 'Models & agents',
    summary: 'Which AI models are used, how requests are routed, and safety limits for agents.',
    why: 'Use it when adding a new model, handling a provider outage or tuning cost and quality.',
    sections: [
      { name: 'Registry', explain: 'Approved providers and models.' },
      { name: 'Routing & fallback', explain: 'Which model handles what, and backups.' },
      { name: 'Agent guardrails', explain: 'Limits that stop runaway agents.' },
      { name: 'Prompt versions & evals', explain: 'Safely testing changes to AI instructions.' },
    ],
    tasks: [{ title: 'Add a new AI provider (e.g. OpenRouter)', steps: ['Go to Settings › Integrations & keys', 'Click Add integration and choose the provider', 'Paste the API key and Test connection', 'Come back here and Register the models you want', 'Validate, then enable them for plans and environments', 'Add a rate card in Usage › Rate catalogue so cost is tracked'] }],
  },
  '/knowledge': {
    title: 'Knowledge & connectors',
    summary: 'Customer documents connected for the AI to search, and their permissions and storage.',
    why: 'Use it when a customer says "the AI can\'t find my document".',
    sections: [
      { name: 'Sources & sync', explain: 'Connected document sources.' },
      { name: 'Retrieval & index', explain: 'Permission-aware search.' },
      { name: 'Connectors', explain: 'Customer connector logins.' },
      { name: 'Storage lifecycle', explain: 'Storage use and cleanup.' },
    ],
  },
  '/controls': {
    title: 'Budgets & emergency',
    summary: 'Spending limits, emergency off-switches, abuse detection and alert routing.',
    why: 'This page protects you from surprise AI bills — a runaway agent can spend thousands in an hour.',
    sections: [
      { name: 'Limits hierarchy', explain: 'Caps at every level; strictest wins.' },
      { name: 'Kill switches', explain: 'Emergency stop buttons.' },
      { name: 'Abuse & trials', explain: 'Suspicious behaviour.' },
      { name: 'Alerts & incidents', explain: 'Who is notified and how it escalates.' },
    ],
  },
  '/security': {
    title: 'Security & audit',
    summary: 'Who can do what in this panel, a permanent record of every action, data retention and customer-access sessions.',
    why: 'It runs continuously in the background: every action anywhere in the panel is checked against your role and logged here.',
    sections: [
      { name: 'Admins, roles & MFA', explain: 'Role permissions and administrator accounts.' },
      { name: 'Audit trail', explain: 'Unchangeable action log.' },
      { name: 'Data policies', explain: 'How long data is kept.' },
      { name: 'Support access', explain: 'Temporary audited access to customer accounts.' },
    ],
  },
  '/operations': {
    title: 'Operations',
    summary: 'Behind-the-scenes health: data feeds, jobs, backups and configuration changes.',
    why: 'If numbers look stale or incomplete, the cause is usually visible here.',
    sections: [
      { name: 'Pipeline', explain: 'Data feed freshness.' },
      { name: 'Health & jobs', explain: 'Service uptime and background work.' },
      { name: 'Backups', explain: 'Backup and restore checks.' },
      { name: 'Config releases', explain: 'Change history with rollback.' },
    ],
  },
  '/support': {
    title: 'Support & comms',
    summary: 'Support cases, customer notifications, billing explanations and goodwill credits.',
    why: 'Everything a support agent needs to answer "why was I charged this?"',
    sections: [
      { name: 'Cases', explain: 'Tickets and effort.' },
      { name: 'Notifications', explain: 'Customer emails and their delivery.' },
      { name: 'Billing evidence', explain: 'Charge explanations.' },
      { name: 'Goodwill credits', explain: 'Compensation credits.' },
    ],
  },
  '/developer': {
    title: 'Developer access',
    summary: 'API keys customers use, webhooks you send them, environments and bring-your-own-key.',
    why: 'Your own AI provider keys live in Settings › Integrations & keys, not here.',
    sections: [
      { name: 'API keys', explain: 'Customer API keys.' },
      { name: 'Webhooks', explain: 'Events sent to customers.' },
      { name: 'Environments', explain: 'Production vs test separation.' },
      { name: 'BYOK', explain: 'Customer-owned AI keys.' },
    ],
  },
  '/settings': {
    title: 'Platform settings',
    summary: 'Set up the platform itself: outside services and their keys, who can sign in, your brand, and company defaults.',
    why: 'This is where you go to connect a new AI provider or service (OpenRouter, Google Drive…), manage admin accounts, or change your logo.',
    sections: [
      { name: 'Integrations & keys', explain: 'All connected services and the encrypted key vault.' },
      { name: 'Admin team', explain: 'Panel users, roles, password resets and MFA.' },
      { name: 'Brand', explain: 'Logos, colours, email sender and domain.' },
      { name: 'General', explain: 'Legal details, currency, timezone, region.' },
    ],
    tasks: [
      { title: 'Connect Google Drive', steps: ['Integrations & keys › Add integration', 'Choose Google Drive', 'Sign in with Google and approve read-only access', 'Choose environments', 'Save — customers can now connect their Drive under Knowledge'] },
      { title: 'Reset an admin\'s password', steps: ['Admin team', 'Find the person', 'Click Send password reset', 'They receive an email link — you never see the password'] },
    ],
  },
  '/start': {
    title: 'Start here',
    summary: 'A plain-language tour of how the platform works.',
    why: 'Read this once. It explains how money flows and where to find everything.',
    sections: [
      { name: 'How money flows', explain: 'From a customer buying a plan to your profit.' },
      { name: 'Setup checklist', explain: 'What must be configured before going live.' },
      { name: 'Where to find things', explain: 'Common questions mapped to screens.' },
      { name: 'Glossary', explain: 'Every term in plain English.' },
    ],
  },
  '/spec': {
    title: 'IA, screens & flows',
    summary: 'The design blueprint: how the panel is organized and the main user journeys.',
    why: 'For product and engineering teams. Day-to-day admins can ignore the Specification section.',
    sections: [{ name: 'Navigation, screens, flows', explain: 'Structure of the panel.' }],
  },
  '/spec/coverage': {
    title: 'Screen-to-feature coverage',
    summary: 'A checklist proving every requirement in the specification (SA01.01…SA16.04) has a screen.',
    why: 'Required so nothing in the specification is forgotten when engineers build it. Admins do not need it day-to-day.',
    sections: [{ name: 'Matrix, gaps and contradictions', explain: 'Each feature ID → screen, plus problems found in the specification.' }],
  },
  '/spec/decisions': {
    title: 'Open decisions',
    summary: 'Business rules the specification left undecided, each shown as configurable options with the assumed default.',
    why: 'A business owner must choose these before launch.',
    sections: [{ name: 'Decisions D01–D20', explain: 'Options, assumed default and affected features.' }],
  },
  '/spec/states': {
    title: 'State gallery',
    summary: 'How every screen looks while loading, empty, failed, restricted or with incomplete data.',
    why: 'Design reference; use the "Preview state" switcher in the top bar to see these on any page.',
    sections: [{ name: 'States', explain: 'Visual treatments.' }],
  },
}

export const GLOSSARY: [string, string][] = [
  ['Tenant / tenancy', 'Each customer company is an isolated tenant. Their data, users and settings never mix with another customer.'],
  ['Company', 'A paying (or trial) customer organization. The unit you bill.'],
  ['Workspace', 'A team inside a company (e.g. Finance). Members and data are grouped by workspace.'],
  ['Seat', 'A paid user licence. "46 of 50 seats" = 46 people using 50 paid licences.'],
  ['Plan / package', 'What a customer buys: price, included credits, seats, features and models.'],
  ['Plan version', 'A snapshot of a plan. Changing a plan creates a new version; existing customers keep theirs.'],
  ['Entitlement', 'Something a plan allows: a feature, a model, a number of seats or storage.'],
  ['Override', 'A one-off exception to a plan for one customer, with reason and expiry.'],
  ['Credit', 'Internal currency customers spend on AI usage. Not cash, not tokens.'],
  ['Token', 'The unit AI providers bill by — roughly ¾ of a word.'],
  ['Sell rate', 'Credits you charge the customer for an action.'],
  ['Provider rate', 'What the AI provider charges you for the same action.'],
  ['Reservation', 'Credits held while a task runs, settled when it ends.'],
  ['Ledger', 'Permanent list of every credit movement. Corrections are new entries, never edits.'],
  ['Recognized revenue', 'Revenue earned in the period by delivering service.'],
  ['Cash collected', 'Money actually received in the bank.'],
  ['MRR', 'Monthly recurring revenue from subscriptions.'],
  ['Service cost / COGS', 'Cost to deliver the service: AI providers, hosting, storage.'],
  ['Gross margin', '(Revenue − service cost) ÷ revenue.'],
  ['Allocation driver', 'Rule for splitting a shared cost across customers.'],
  ['Reconciliation', 'Comparing our estimate with the provider invoice and explaining differences.'],
  ['Estimated (≈)', 'Live figure that can still change.'],
  ['Reconciled', 'Confirmed against the source. Final unless corrected.'],
  ['Incomplete', 'Some source data is missing. Never treated as zero.'],
  ['Period close', 'Locking a month so its numbers cannot change.'],
  ['Chart of accounts', 'The accountant\'s list of revenue and expense categories.'],
  ['Proration', 'Partial charge or credit when a plan changes mid-cycle.'],
  ['Webhook', 'An automatic message one system sends another when something happens.'],
  ['CAC', 'Customer acquisition cost — marketing spend ÷ new paying customers.'],
  ['LTV', 'Lifetime value — total contribution a customer brings over their life.'],
  ['GRR / NRR', 'Gross / net revenue retention — how much revenue you keep from existing customers.'],
  ['Churn', 'Customers or revenue lost through cancellation.'],
  ['Routing / fallback', 'Which AI model handles a request, and which one to try if it fails.'],
  ['Guardrail', 'A safety limit on what an AI agent may do or spend.'],
  ['Kill switch', 'Emergency stop for a model, feature, customer or the whole platform.'],
  ['Prompt', 'The instructions given to the AI model.'],
  ['Evaluation (eval)', 'Testing a prompt or model against a dataset before release.'],
  ['RAG / retrieval', 'The AI searching customer documents to ground its answers.'],
  ['Connector', 'A link to an outside system such as Google Drive or SharePoint.'],
  ['API key', 'A secret password that lets one system call another.'],
  ['Key vault', 'Encrypted storage for API keys and secrets.'],
  ['BYOK', 'Bring your own key — customer uses their own AI provider account.'],
  ['MFA', 'Multi-factor authentication — a second code in addition to the password.'],
  ['SSO', 'Single sign-on — sign in with your company Google/Microsoft account.'],
  ['Audit trail', 'Unchangeable log of every admin action.'],
  ['DSR', 'Data subject request — legal request to export or delete data.'],
  ['Environment', 'Production (real), Staging (test), Development, Evaluation.'],
  ['SLA', 'Service level agreement — promised response or uptime.'],
]
