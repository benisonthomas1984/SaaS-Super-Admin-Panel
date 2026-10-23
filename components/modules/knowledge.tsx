import { RefreshCw, KeyRound } from 'lucide-react'
import { ActionButton, Gate, StateFrame } from '@/components/admin/state'
import { Assumption, Badge, Bar, Callout, DataTable, KV, Panel, Prov } from '@/components/admin/ui'

export function SourcesSection() {
  return (
    <Panel title="Knowledge sources" features={['SA11.01']} description="Per-source sync status, item counts and failures. Partial syncs are labelled, never shown as complete.">
      <StateFrame features={['SA11.01']} cap="view.usage" emptyTitle="No knowledge sources" emptyHint="Tenants add sources from the product; admins see them here.">
        <DataTable dense columns={[{ key: 's', label: 'Source' }, { key: 'co', label: 'Company', mono: true }, { key: 't', label: 'Type' }, { key: 'i', label: 'Items', align: 'right' }, { key: 'last', label: 'Last sync' }, { key: 'st', label: 'Status' }, { key: 'a', label: '' }]} rows={[
          { s: 'Ops runbooks', co: 'CO-10482', t: 'Drive connector', i: '4,812', last: '23 Oct 10:02', st: <Badge tone="good">Complete</Badge>, a: null },
          { s: 'Claims archive', co: 'CO-10482', t: 'Upload', i: '22,190', last: '22 Oct 23:40', st: <Badge tone="warn">Partial · 214 failed (OCR)</Badge>, a: <ActionButton label="Retry failed" cap="act.ops" size="xs" icon={<RefreshCw />} dialog={{ title: 'Retry 214 failed items', feature: 'SA11.01', impact: ['≈ 1,280 OCR pages · ≈ $25.60 provider cost', 'Charged to tenant credits per sell-rate (SA05.02)'] }} /> },
          { s: 'Matter files', co: 'CO-10019', t: 'Document mgmt connector', i: '118,004', last: '23 Oct 06:00', st: <Badge tone="bad">Auth expired</Badge>, a: null },
          { s: 'Help center', co: 'CO-10377', t: 'Web crawl', i: '612', last: '—', st: <Badge tone="neutral">Paused (past due)</Badge>, a: null },
        ]} />
      </StateFrame>
    </Panel>
  )
}

export function RetrievalSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Permission-aware retrieval" features={['SA11.02']} className="col-span-2" description="Retrieval respects source ACLs at query time. Revoked access stops retrieval within the propagation target.">
        <StateFrame features={['SA11.02']} cap="view.security">
          <DataTable dense columns={[{ key: 'i', label: 'Index', mono: true }, { key: 'acl', label: 'ACL sync' }, { key: 'lag', label: 'ACL lag' }, { key: 'iso', label: 'Tenant isolation' }, { key: 'del', label: 'Pending deletions', align: 'right' }]} rows={[
            { i: 'ns_10482', acl: <Badge tone="good">Synced 10:02</Badge>, lag: '3 min', iso: <Badge tone="good">Namespace per tenant</Badge>, del: '0' },
            { i: 'ns_10019', acl: <Badge tone="bad">Stale · auth expired</Badge>, lag: '4 h 12 min', iso: <Badge tone="good">Namespace per tenant</Badge>, del: '12' },
          ]} />
          <div className="mt-3"><Callout tone="bad" title="ns_10019 ACLs stale beyond target">Retrieval for CO-10019 is restricted to items with confirmed ACLs until re-sync. Propagation target: TBD (D17 · G06).</Callout></div>
        </StateFrame>
      </Panel>
      <Panel title="Chunking & embedding" features={['SA11.02']}>
        <KV items={[['Embedding model', 'prov-a/embed-2025-11'], ['Chunk size', '800 tok · 100 overlap'], ['Re-index on model change', 'Required · scheduled'], ['Re-index cost (ns_10482)', <Gate key="c" cap="view.margin"><span className="italic">≈ $42.10</span></Gate>]]} />
      </Panel>
    </div>
  )
}

export function ConnectorsSection() {
  return (
    <Panel title="Connector credentials" features={['SA11.03', 'SA13.01']} description="Secrets are never displayed. Only metadata, scopes and expiry.">
      <StateFrame features={['SA11.03']} cap="view.security">
        <DataTable dense columns={[{ key: 'c', label: 'Connector' }, { key: 'co', label: 'Company', mono: true }, { key: 'scope', label: 'Scopes' }, { key: 'exp', label: 'Expiry' }, { key: 'sec', label: 'Secret' }, { key: 'a', label: '' }]} rows={[
          { c: 'Drive connector', co: 'CO-10482', scope: 'files.read', exp: '14 Jan 2027', sec: <span className="font-mono text-xs text-muted-foreground">••••••••a91c</span>, a: null },
          { c: 'Document mgmt', co: 'CO-10019', scope: 'documents.read · acl.read', exp: <Badge tone="bad">Expired 23 Oct 06:00</Badge>, sec: <span className="font-mono text-xs text-muted-foreground">••••••••77e0</span>, a: <ActionButton label="Request re-auth" cap="act.support" size="xs" icon={<KeyRound />} dialog={{ title: 'Request customer re-authorization', feature: 'SA11.03', impact: ['Sends “Connector re-auth required” template to tenant admins (SA15.02)', 'Admins cannot re-authorize on behalf of customer'] }} /> },
          { c: 'CRM connector', co: 'CO-10702', scope: 'contacts.read', exp: '02 Nov 2026', sec: <span className="font-mono text-xs text-muted-foreground">••••••••0c3d</span>, a: <ActionButton label="Revoke" cap="act.security" size="xs" variant="destructive" dialog={{ title: 'Revoke CRM connector credential', feature: 'SA11.03', destructive: true, impact: ['Sync stops immediately', 'Indexed content remains until deletion request'] }} /> },
        ]} />
      </StateFrame>
    </Panel>
  )
}

export function StorageSection() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <Panel title="Storage by tenant" features={['SA11.04', 'SA03.03']} className="col-span-2">
        <StateFrame features={['SA11.04']} cap="view.margin">
          <DataTable dense columns={[{ key: 'co', label: 'Company' }, { key: 'f', label: 'Files', align: 'right' }, { key: 'v', label: 'Vectors', align: 'right' }, { key: 'q', label: 'Quota use', width: '160px' }, { key: 'c', label: 'Storage cost / mo', align: 'right' }]} rows={[
            { co: 'Halcyon Legal LLP', f: '1.8 TB', v: '41 GB', q: <Bar value={1840} max={2000} tone="warn" />, c: <Gate cap="view.margin">$612.40</Gate> },
            { co: 'Northwind Logistics', f: '412 GB', v: '9.2 GB', q: <Bar value={412} max={600} />, c: <Gate cap="view.margin">$118.22</Gate> },
            { co: 'Brightpath Health', f: '96 GB', v: '2.1 GB', q: <Bar value={96} max={100} tone="warn" />, c: <Gate cap="view.margin">$31.80</Gate> },
          ]} />
        </StateFrame>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Lifecycle" features={['SA11.04', 'SA13.03']}>
          <KV items={[['Orphaned vectors', <span key="o">3.4 GB · <Prov kind="unknown" label="Owner unknown" /></span>], ['Deletion backlog', '12 items'], ['Cold tier after', '180 days idle']]} />
        </Panel>
        <Assumption decision="D09">Storage allocated by GB-month for shared vector clusters.</Assumption>
      </div>
    </div>
  )
}
