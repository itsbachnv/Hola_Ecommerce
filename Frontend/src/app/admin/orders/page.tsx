import dynamic from 'next/dynamic';
const AdminOrdersContainer = dynamic(() => import('./AdminOrdersContainer'), { ssr: false });
export default function AdminOrdersPage() {
  return <AdminOrdersContainer />;
}
