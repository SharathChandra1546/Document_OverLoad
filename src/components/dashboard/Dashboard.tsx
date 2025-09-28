'use client';

import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRecentDocuments, RecentDocumentEntry } from '@/contexts/RecentDocumentsContext';
import { useMemo, useState } from 'react';

const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const { documents, clearDocuments } = useRecentDocuments();
  const { deleteDocument } = useRecentDocuments() as any;
  const [detailsDoc, setDetailsDoc] = useState<RecentDocumentEntry | null>(null);
  const recentDocuments = useMemo(() => documents.slice(0, 5), [documents]);

  const getRoleSpecificContent = () => {
    switch (currentUser?.role) {
      case 'Admin':
        return {
          title: 'System Administration',
          subtitle: 'Manage users, system settings, and overall platform oversight',
          stats: [
            { label: 'Total Users', value: '24', icon: '👥' },
            { label: 'Active Documents', value: '156', icon: '📄' },
            { label: 'Storage Used', value: '2.3GB', icon: '💾' }
          ],
          alerts: [
            { type: 'warning', message: '2 user accounts require password reset' },
            { type: 'info', message: 'System backup completed successfully' }
          ]
        };
      case 'Executive':
        return {
          title: 'Executive Overview',
          subtitle: 'Strategic insights, compliance monitoring, and high-level analytics',
          stats: [
            { label: 'Compliance Score', value: '87%', icon: '✅' },
            { label: 'Pending Reviews', value: '5', icon: '📋' },
            { label: 'Monthly Uploads', value: '23', icon: '📤' },
            { label: 'Risk Level', value: 'Low', icon: '🟢' }
          ],
          alerts: [
            { type: 'warning', message: '3 compliance items due within 7 days' },
            { type: 'success', message: 'Q1 compliance audit passed' }
          ]
        };
      case 'Engineer':
        return {
          title: 'Technical Operations',
          subtitle: 'Technical documentation, system monitoring, and operational alerts',
          stats: [
            { label: 'API Status', value: 'Operational', icon: '🔧' },
            { label: 'OCR Accuracy', value: '94%', icon: '👁️' },
            { label: 'Processing Queue', value: '12', icon: '⚙️' },
            { label: 'System Load', value: '67%', icon: '📊' }
          ],
          alerts: [
            { type: 'warning', message: 'OCR processing delay detected' },
            { type: 'info', message: 'System maintenance scheduled for Sunday' }
          ]
        };
      default: // Staff
        return {
          title: 'Document Management',
          subtitle: 'Upload, search, and manage your documents efficiently',
          stats: [
            { label: 'My Documents', value: '12', icon: '📁' },
            { label: 'Recent Uploads', value: '3', icon: '⬆️' },
            { label: 'Search Queries', value: '8', icon: '🔍' },
            { label: 'Compliance Items', value: '4', icon: '📋' }
          ],
          alerts: [
            { type: 'info', message: 'Welcome to DocuMind AI platform' },
            { type: 'success', message: 'Your last document was processed successfully' }
          ]
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {roleContent.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {roleContent.subtitle}
        </p>
        <div className="mt-4 flex items-center space-x-2">
          <Badge variant="info">{currentUser?.role}</Badge>
          <Badge variant="success">{currentUser?.department}</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleContent.stats.map((stat, index) => (
          <Card key={index} hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {roleContent.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Alerts
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleContent.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                      : alert.type === 'success'
                      ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'warning'
                      ? 'bg-yellow-500'
                      : alert.type === 'success'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`} />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Documents + Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Documents
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearDocuments}>
                Clear All
              </Button>
              <Link href="/upload">
                <Button variant="primary" size="sm">Upload</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentDocuments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No documents yet. Upload to see them here.</p>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                      {doc.fileType}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <Badge size="sm" variant={doc.status === 'Processed' ? 'success' : doc.status === 'Pending' ? 'warning' : 'danger'}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDetailsDoc(doc)}>View Details</Button>
                    <Link href={`/document/${doc.id}`}>
                      <Button size="sm" variant="primary">Read Full Document</Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => deleteDocument(doc.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/upload">
              <Button variant="primary" className="w-full">
                Upload Document
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full">
                Search Documents
              </Button>
            </Link>
            
            {currentUser?.role === 'Admin' && (
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {detailsDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="text-gray-900 dark:text-white ml-4 truncate">{detailsDoc.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Uploaded At</span><span className="text-gray-900 dark:text-white ml-4">{new Date(detailsDoc.uploadedAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">File Type</span><span className="text-gray-900 dark:text-white ml-4">{detailsDoc.fileType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Size</span><span className="text-gray-900 dark:text-white ml-4">{detailsDoc.size}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-gray-900 dark:text-white ml-4">{detailsDoc.status}</span></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDetailsDoc(null)}>Close</Button>
              <Link href={`/document/${detailsDoc.id}`}>
                <Button variant="primary">Read Full Document</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

