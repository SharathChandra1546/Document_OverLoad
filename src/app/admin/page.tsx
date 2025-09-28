'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Layout from '@/components/layout/Layout';
import AdminManagement from '@/components/admin/AdminManagement';

export default function AdminPage() {
  const { isAuthenticated, currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else if (currentUser?.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || currentUser?.role !== 'Admin') {
    return null;
  }

  return (
    <Layout>
      <AdminManagement />
    </Layout>
  );
}
