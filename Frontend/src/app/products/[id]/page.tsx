import { notFound } from 'next/navigation';
import ClientProductView from '@/components/products/ClientProductView';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params first (Next.js 15 requirement)
  const { id } = await params;
  
  // Decode the slug if it's URL encoded
  const decodedSlug = decodeURIComponent(id);
  
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${decodedSlug}`;
    
    const res = await fetch(apiUrl, { 
      headers: {
        'Content-Type': 'application/json',
      }
    });


    if (!res.ok) {
      if (res.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch product: ${res.status}`);
    }

    const product = await res.json();
    console.log('Product data received:', JSON.stringify(product, null, 2));
    return <ClientProductView product={product} />;
  } catch (error) {
    return notFound();
  }
}
