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
  const { documents, clearDocuments, deleteDocument } = useRecentDocuments();

  const recentDocuments = useMemo(() => documents.slice(0, 5), [documents]);

  const getRoleSpecificContent = () => {
    switch (currentUser?.role) {
      case 'admin':
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
      case 'manager':
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
      case 'auditor':
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
      default: // staff
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
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {roleContent.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {roleContent.subtitle}
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <Badge variant="default">{currentUser?.role}</Badge>
              <Badge variant="secondary">{currentUser?.department}</Badge>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleContent.stats.map((stat, index) => (
          <Card key={index} hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {roleContent.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              System Alerts
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleContent.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                      : alert.type === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    alert.type === 'warning'
                      ? 'bg-yellow-500'
                      : alert.type === 'success'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`} />
                  <p className="text-sm text-foreground font-medium">
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
            <h3 className="text-lg font-semibold text-foreground">
              Recent Documents
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearDocuments}>
                Clear All
              </Button>
              <Link href="/upload">
                <Button variant="default" size="sm">Upload</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentDocuments.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📄</span>
              <p className="text-sm text-muted-foreground">No documents yet. Upload to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold text-xs">
                      {doc.fileType}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <Badge size="sm" variant={doc.status === 'Processed' ? 'default' : doc.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/document/${doc.id}`}>
                      <Button size="sm" variant="default">View</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => deleteDocument(doc.id)}>Delete</Button>
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
          <h3 className="text-lg font-semibold text-foreground">
            Quick Actions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/upload">
              <Button variant="default" className="w-full gap-2">
                <span>📤</span>
                Upload Document
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full gap-2">
                <span>🔍</span>
                Search Documents
              </Button>
            </Link>
            <Link href="/compliance">
              <Button variant="outline" className="w-full gap-2">
                <span>✅</span>
                View Compliance
              </Button>
            </Link>
            
            {currentUser?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" className="w-full gap-2">
                  <span>⚙️</span>
                  Manage Users
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default Dashboard;

