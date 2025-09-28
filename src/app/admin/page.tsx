'use client';

import Layout from '@/components/layout/Layout';
import AdminManagement from '@/components/admin/AdminManagement';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <AdminManagement />
      </Layout>
    </ProtectedRoute>
  );
}
