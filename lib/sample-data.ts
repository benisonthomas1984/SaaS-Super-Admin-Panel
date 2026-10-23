// All figures are illustrative SAMPLE data for design review. No real business results or live provider prices.

export type Lifecycle = 'Trial' | 'Active' | 'Past due' | 'Suspended' | 'Cancellation pending' | 'Closed'

export type Company = {
  id: string
  name: string
  domain: string
  billingRef: string
  plan: string
  planVersion: string
  lifecycle: Lifecycle
  region: string
  seats: { used: number; paid: number }
  mrr: number
  revenue: number
  cost: number
  costCoverage: number
  creditsAvailable: number
  source: string
  owner: string
  lastSync: string
}

export const COMPANIES: Company[] = [
  { id: 'CO-10482', name: 'Northwind Logistics', domain: 'northwind-logistics.example', billingRef: 'cus_SAMPLE_8812', plan: 'Scale', planVersion: 'v3', lifecycle: 'Active', region: 'EU-West', seats: { used: 46, paid: 50 }, mrr: 4800, revenue: 5212.4, cost: 1874.18, costCoverage: 100, creditsAvailable: 182400, source: 'Paid search · "ai document agent"', owner: 'M. Okafor', lastSync: '10:41 UTC' },
  { id: 'CO-10233', name: 'Atlas Freight Inc.', domain: 'atlasfreight.example', billingRef: 'cus_SAMPLE_2290', plan: 'Growth', planVersion: 'v2', lifecycle: 'Active', region: 'US-East', seats: { used: 18, paid: 20 }, mrr: 1600, revenue: 1712.0, cost: 612.55, costCoverage: 100, creditsAvailable: 41200, source: 'Referral · Halcyon Legal', owner: 'J. Brandt', lastSync: '10:40 UTC' },
  { id: 'CO-11807', name: 'Atlas Freight Ltd', domain: 'atlasfreight-uk.example', billingRef: 'cus_SAMPLE_7731', plan: 'Starter', planVersion: 'v4', lifecycle: 'Trial', region: 'UK-South', seats: { used: 3, paid: 0 }, mrr: 0, revenue: 0, cost: 84.12, costCoverage: 100, creditsAvailable: 8800, source: 'Unknown', owner: 'Unassigned', lastSync: '10:40 UTC' },
  { id: 'CO-10019', name: 'Halcyon Legal LLP', domain: 'halcyonlegal.example', billingRef: 'cus_SAMPLE_0193', plan: 'Enterprise (custom)', planVersion: 'contract C-221', lifecycle: 'Active', region: 'US-East', seats: { used: 212, paid: 250 }, mrr: 21500, revenue: 22140.0, cost: 9311.7, costCoverage: 82, creditsAvailable: 1204000, source: 'Outbound sales · conference', owner: 'M. Okafor', lastSync: '09:12 UTC' },
  { id: 'CO-10377', name: 'Brightpath Health', domain: 'brightpath.example', billingRef: 'cus_SAMPLE_3771', plan: 'Scale', planVersion: 'v2', lifecycle: 'Past due', region: 'US-West', seats: { used: 38, paid: 40 }, mrr: 3840, revenue: 3840.0, cost: 2961.04, costCoverage: 100, creditsAvailable: 0, source: 'Content · webinar', owner: 'R. Iyer', lastSync: '10:41 UTC' },
  { id: 'CO-10512', name: 'Quillon Analytics', domain: 'quillon.example', billingRef: 'cus_SAMPLE_5120', plan: 'Growth', planVersion: 'v3', lifecycle: 'Active', region: 'EU-Central', seats: { used: 12, paid: 15 }, mrr: 1200, revenue: 1488.2, cost: 1702.9, costCoverage: 100, creditsAvailable: 2100, source: 'Paid social', owner: 'J. Brandt', lastSync: '10:41 UTC' },
  { id: 'CO-10601', name: 'Kestrel Robotics', domain: 'kestrel.example', billingRef: 'cus_SAMPLE_6014', plan: 'Scale', planVersion: 'v3', lifecycle: 'Suspended', region: 'US-East', seats: { used: 22, paid: 25 }, mrr: 2400, revenue: 0, cost: 41.2, costCoverage: 100, creditsAvailable: 30500, source: 'Organic search', owner: 'R. Iyer', lastSync: '10:39 UTC' },
  { id: 'CO-10655', name: 'Marlow & Finch', domain: 'marlowfinch.example', billingRef: 'cus_SAMPLE_6550', plan: 'Growth', planVersion: 'v2', lifecycle: 'Cancellation pending', region: 'UK-South', seats: { used: 9, paid: 10 }, mrr: 800, revenue: 800.0, cost: 210.33, costCoverage: 100, creditsAvailable: 12900, source: 'Paid search', owner: 'J. Brandt', lastSync: '10:40 UTC' },
  { id: 'CO-10702', name: 'Tidewater Insurance', domain: 'tidewater.example', billingRef: 'cus_SAMPLE_7020', plan: 'Enterprise (custom)', planVersion: 'contract C-238', lifecycle: 'Active', region: 'US-East', seats: { used: 140, paid: 150 }, mrr: 14200, revenue: 14200.0, cost: 4890.12, costCoverage: 64, creditsAvailable: 640000, source: 'Partner · reseller', owner: 'M. Okafor', lastSync: '07:55 UTC' },
  { id: 'CO-10044', name: 'Orchard Learning', domain: 'orchardlearn.example', billingRef: 'cus_SAMPLE_0440', plan: 'Starter', planVersion: 'v3', lifecycle: 'Closed', region: 'EU-West', seats: { used: 0, paid: 0 }, mrr: 0, revenue: 0, cost: 0, costCoverage: 100, creditsAvailable: 0, source: 'Organic search', owner: '—', lastSync: '—' },
]

export function company(id: string) {
  return COMPANIES.find((c) => c.id === id)
}

export const fmtMoney = (n: number, digits = 2) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtNum = (n: number) => n.toLocaleString('en-US')

export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`
