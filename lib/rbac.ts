export type RoleId = 'owner' | 'finance' | 'operations' | 'support' | 'security' | 'analyst'

export type Capability =
  | 'view.finance'
  | 'view.margin'
  | 'view.usage'
  | 'view.customer'
  | 'view.security'
  | 'view.content'
  | 'act.finance'
  | 'act.pricing'
  | 'act.ops'
  | 'act.killswitch'
  | 'act.support'
  | 'act.security'
  | 'act.roles'
  | 'act.export'

export const ROLES: Record<RoleId, { label: string; short: string; boundary: string; caps: Capability[] }> = {
  owner: {
    label: 'Platform owner',
    short: 'Owner',
    boundary: 'No invisible audit deletion; customer-content access still governed by SA13.03.',
    caps: [
      'view.finance', 'view.margin', 'view.usage', 'view.customer', 'view.security',
      'act.pricing', 'act.ops', 'act.killswitch', 'act.roles', 'act.export', 'act.security',
    ],
  },
  finance: {
    label: 'Finance administrator',
    short: 'Finance',
    boundary: 'No provider secret exposure or default raw prompt access.',
    caps: ['view.finance', 'view.margin', 'view.usage', 'view.customer', 'act.finance', 'act.pricing', 'act.export'],
  },
  operations: {
    label: 'Operations administrator',
    short: 'Operations',
    boundary: 'No unrestricted refunds, role grants or customer content.',
    caps: ['view.usage', 'view.customer', 'act.ops', 'act.killswitch', 'act.export'],
  },
  support: {
    label: 'Support administrator',
    short: 'Support',
    boundary: 'No margin visibility by default; tenant access time-limited and audited.',
    caps: ['view.customer', 'view.usage', 'act.support'],
  },
  security: {
    label: 'Security administrator',
    short: 'Security',
    boundary: 'No automatic authority to change prices or issue refunds.',
    caps: ['view.security', 'view.usage', 'view.customer', 'act.security', 'act.roles'],
  },
  analyst: {
    label: 'Read-only analyst',
    short: 'Analyst',
    boundary: 'Authorized aggregates and de-identified metadata only. No configuration, balances or raw content.',
    caps: ['view.finance', 'view.usage', 'act.export'],
  },
}

export const CAP_LABEL: Record<Capability, string> = {
  'view.finance': 'view financial records',
  'view.margin': 'view margin and provider cost',
  'view.usage': 'view usage metadata',
  'view.customer': 'view identifiable customer records',
  'view.security': 'view security and audit records',
  'view.content': 'view raw customer content',
  'act.finance': 'post refunds, adjustments and period close',
  'act.pricing': 'draft and publish pricing',
  'act.ops': 'pause jobs and change operational limits',
  'act.killswitch': 'activate kill switches',
  'act.support': 'open support sessions and update cases',
  'act.security': 'revoke credentials and manage security policy',
  'act.roles': 'grant or revoke admin roles',
  'act.export': 'export permitted rows',
}

export function can(role: RoleId, cap: Capability) {
  return ROLES[role].caps.includes(cap)
}

export function rolesWith(cap: Capability) {
  return (Object.keys(ROLES) as RoleId[]).filter((r) => can(r, cap)).map((r) => ROLES[r].short)
}
