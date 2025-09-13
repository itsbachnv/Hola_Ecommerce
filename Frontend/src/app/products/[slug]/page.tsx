
import { notFound } from 'next/navigation';
import ClientProductView from '@/components/products/ClientProductView';
import api from '@/utils/api';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const decodedSlug = decodeURIComponent(slug);

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${decodedSlug}`;
    console.log('Fetching product from:', apiUrl);
    try {
      const res = await api.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const product = res.data;
      return <ClientProductView product={product} />;
    } catch (error) {
      // Axios error type
      if (error && typeof error === 'object' && 'response' in error && error.response && error.response.status === 404) {
        return notFound();
      }
      console.error('Error fetching product:', error);
      return notFound();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return notFound();
  }
}
