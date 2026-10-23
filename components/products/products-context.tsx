'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { SEED_PRODUCTS, type BillingOwner, type ExecutionMode, type Product, type ProductPackage, type ProductStatus } from '@/lib/products'

type NewProduct = { name: string; slug: string; owner: string; appUrl: string; execution: ExecutionMode; billingOwner: BillingOwner; creditUnit: string }
type NewPackage = { name: string; slug: string; monthly: string; annual: string; credits: string }

type Ctx = {
  products: Product[]
  get: (id: string) => Product | undefined
  createProduct: (p: NewProduct) => string
  addPackage: (productId: string, p: NewPackage) => { ok: true; id: string } | { ok: false; error: string }
  setStatus: (productId: string, s: ProductStatus) => void
  markConnected: (productId: string) => void
}

const ProductsContext = createContext<Ctx | null>(null)

const rand = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)

  const get = useCallback((id: string) => products.find((p) => p.id === id), [products])

  const createProduct = useCallback((p: NewProduct) => {
    const id = `prd_${rand()}${rand()}`.slice(0, 14)
    setProducts((prev) => [...prev, {
      ...p, id, status: 'draft', connection: 'not_connected', environments: ['sandbox'], packages: [],
      accounts: 0, revenue: 0, cost: 0, lastHeartbeat: 'never',
    }])
    return id
  }, [])

  const addPackage = useCallback((productId: string, p: NewPackage) => {
    const product = products.find((x) => x.id === productId)
    if (!product) return { ok: false as const, error: '404 · Parent product not found. A package cannot exist before its product.' }
    if (product.status === 'archived') return { ok: false as const, error: '409 · Product is archived. New packages are blocked.' }
    if (product.packages.some((x) => x.slug === p.slug)) return { ok: false as const, error: `409 · Slug "${p.slug}" already exists in ${product.name}. Slugs are unique within a product; the same name in another product is allowed.` }
    const id = `pkg_${rand()}`
    const pkg: ProductPackage = {
      id, name: p.name, slug: p.slug, status: 'draft', currentVersion: 'v1 (draft)', monthly: p.monthly, annual: p.annual, subscribers: 0,
      versions: [{ id: `pkv_${rand()}`, label: 'v1', status: 'draft', effectiveFrom: '—', credits: p.credits, subscribers: 0 }],
    }
    setProducts((prev) => prev.map((x) => (x.id === productId ? { ...x, packages: [...x.packages, pkg] } : x)))
    return { ok: true as const, id }
  }, [products])

  const setStatus = useCallback((productId: string, s: ProductStatus) => {
    setProducts((prev) => prev.map((x) => (x.id === productId ? { ...x, status: s } : x)))
  }, [])

  const markConnected = useCallback((productId: string) => {
    setProducts((prev) => prev.map((x) => (x.id === productId ? { ...x, connection: 'connected', status: x.status === 'draft' ? 'testing' : x.status, lastHeartbeat: 'just now' } : x)))
  }, [])

  const value = useMemo(() => ({ products, get, createProduct, addPackage, setStatus, markConnected }), [products, get, createProduct, addPackage, setStatus, markConnected])
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider')
  return ctx
}
