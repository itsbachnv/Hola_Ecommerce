// hooks/useProduct.ts
import { useEffect, useState } from "react";

export const useProduct = (slug?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const json = await res.json();
      setData(json);
      setLoading(false);
    };

    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${slug}`);
      const json = await res.json();
      setProduct(json);
      setLoading(false);
    };

    if (slug) fetchProduct();
    else fetchProducts();
  }, [slug]);

  return { data, product, loading };
};
