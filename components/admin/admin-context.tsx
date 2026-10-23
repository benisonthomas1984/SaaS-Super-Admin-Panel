'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { RoleId } from '@/lib/rbac'

export type DemoState = 'live' | 'loading' | 'empty' | 'error' | 'incomplete'
export type Environment = 'production' | 'staging' | 'development' | 'evaluation'

export type SupportSession = {
  company: string
  reason: string
  scope: string
  expiresAt: string
}

export type AuditEntry = { id: string; action: string; target: string; reason: string; at: string; role: RoleId }

type Ctx = {
  role: RoleId
  setRole: (r: RoleId) => void
  demoState: DemoState
  setDemoState: (s: DemoState) => void
  env: Environment
  setEnv: (e: Environment) => void
  supportSession: SupportSession | null
  setSupportSession: (s: SupportSession | null) => void
  audit: AuditEntry[]
  record: (e: Omit<AuditEntry, 'id' | 'at' | 'role'>) => string
}

const AdminContext = createContext<Ctx | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<RoleId>('owner')
  const [demoState, setDemoState] = useState<DemoState>('live')
  const [env, setEnv] = useState<Environment>('production')
  const [supportSession, setSupportSession] = useState<SupportSession | null>(null)
  const [audit, setAudit] = useState<AuditEntry[]>([])

  const record = useCallback(
    (e: Omit<AuditEntry, 'id' | 'at' | 'role'>) => {
      const id = `AUD-${(48211 + audit.length).toString()}`
      const at = new Date().toISOString().slice(11, 19) + ' UTC'
      setAudit((prev) => [{ ...e, id, at, role }, ...prev])
      return id
    },
    [audit.length, role],
  )

  const value = useMemo(
    () => ({ role, setRole, demoState, setDemoState, env, setEnv, supportSession, setSupportSession, audit, record }),
    [role, demoState, env, supportSession, audit, record],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
