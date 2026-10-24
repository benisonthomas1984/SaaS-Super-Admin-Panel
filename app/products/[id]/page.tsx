import { ProductDetail } from '@/components/products/detail'

export const metadata = { title: 'Product · Superadmin' }

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params
  const { tab } = await searchParams
  return <ProductDetail id={id} tab={tab} />
}
