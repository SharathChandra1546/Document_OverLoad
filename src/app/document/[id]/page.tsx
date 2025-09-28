'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Layout from '@/components/layout/Layout';
import DocumentPreview from '@/components/document/DocumentPreview';

export default function DocumentPage() {
  const { isAuthenticated } = useUser();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

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
      <DocumentPreview documentId={documentId} />
    </Layout>
  );
}
