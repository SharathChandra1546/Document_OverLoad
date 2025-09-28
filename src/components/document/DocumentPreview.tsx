'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useRecentDocuments } from '@/contexts/RecentDocumentsContext';

interface DocumentPreviewProps {
  documentId: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentId }) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'ocr' | 'preview'>('metadata');
  const { getDocumentById } = useRecentDocuments();
  const document = getDocumentById(documentId);

  if (!document) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Document Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The requested document could not be found.
        </p>
        <Link href="/search">
          <Button variant="primary">
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const handleTraceToSource = () => {
    alert('Trace to Source feature would connect to the original document source system');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // No expiry or language tracking for local-only recent docs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {document.title}
            </h1>
            <div className="flex items-center space-x-3">
              <Badge variant="default">{document.fileType}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/search">
              <Button variant="outline">
                Back to Search
              </Button>
            </Link>
            <Button variant="primary" onClick={handleTraceToSource}>
              Trace to Source
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <Card>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'metadata', label: 'Metadata', icon: '📋' },
                  { id: 'ocr', label: 'OCR Text', icon: '👁️' },
                  { id: 'preview', label: 'Preview', icon: '🖼️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <CardContent className="p-6">
              {activeTab === 'metadata' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Document Information
                      </h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs text-gray-500 dark:text-gray-400">Title</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{document.title}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 dark:text-gray-400">File Type</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{document.fileType}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 dark:text-gray-400">File Size</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{document.size}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Upload Information
                      </h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs text-gray-500 dark:text-gray-400">Upload Date</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{new Date(document.uploadedAt).toLocaleString()}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'ocr' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Extracted Text (OCR)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {document.textContent || 'No text content available.'}
                    </pre>
                  </div>
                </div>
              )}
              
              {activeTab === 'preview' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Preview
                  </h3>
                  {document.previewUrl ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <iframe
                        src={document.previewUrl}
                        className="w-full h-96 rounded"
                        title={document.title}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300">No preview available.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar placeholder removed for simplified local preview */}
        <div className="space-y-6" />
      </div>
    </div>
  );
};

export default DocumentPreview;
