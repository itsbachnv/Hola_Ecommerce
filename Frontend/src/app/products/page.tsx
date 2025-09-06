"use client";
import Index from '@/components/products/index';
import { useAuthen } from '@/hooks/useAuthen';
export default function ProductsPage() {
  useAuthen();
  return <Index />;
}