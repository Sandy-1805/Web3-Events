'use client';

import dynamic from 'next/dynamic';

const AdminApp = dynamic(
  () => import('@/components/admin/AdminApp'),
  { ssr: false, loading: () => <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Chargement...</p></div> }
);

export default function AdminPage() {
  return <AdminApp />;
}
