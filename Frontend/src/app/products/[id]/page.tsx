import { notFound } from 'next/navigation';
import ClientProductView from '@/components/products/ClientProductView';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://fakestoreapi.com/products/${params.id}`, { cache: 'no-store' });

  if (!res.ok) return notFound();

  const product = await res.json();

  return <ClientProductView product={product} />;
}
