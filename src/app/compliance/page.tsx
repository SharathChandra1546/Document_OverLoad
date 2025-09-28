'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Layout from '@/components/layout/Layout';
import ComplianceTracker from '@/components/compliance/ComplianceTracker';

export default function CompliancePage() {
  const { isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <ComplianceTracker />
    </Layout>
  );
}
