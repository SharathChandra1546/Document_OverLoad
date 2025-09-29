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
            { label: 'Total Users', value: '24', icon: '👥', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
            { label: 'Active Documents', value: '156', icon: '📄', color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
            { label: 'Storage Used', value: '2.3GB', icon: '💾', color: 'bg-gradient-to-br from-purple-500 to-purple-600' }
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
            { label: 'Compliance Score', value: '87%', icon: '✅', color: 'bg-gradient-to-br from-emerald-500 to-green-600' },
            { label: 'Pending Reviews', value: '5', icon: '📋', color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
            { label: 'Monthly Uploads', value: '23', icon: '📤', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
            { label: 'Risk Level', value: 'Low', icon: '🟢', color: 'bg-gradient-to-br from-green-500 to-green-600' }
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
            { label: 'API Status', value: 'Operational', icon: '🔧', color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
            { label: 'OCR Accuracy', value: '94%', icon: '👁️', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
            { label: 'Processing Queue', value: '12', icon: '⚙️', color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
            { label: 'System Load', value: '67%', icon: '📊', color: 'bg-gradient-to-br from-red-500 to-red-600' }
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
            { label: 'My Documents', value: '12', icon: '📁', color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
            { label: 'Recent Uploads', value: '3', icon: '⬆️', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
            { label: 'Search Queries', value: '8', icon: '🔍', color: 'bg-gradient-to-br from-violet-500 to-violet-600' },
            { label: 'Compliance Items', value: '4', icon: '📋', color: 'bg-gradient-to-br from-amber-500 to-amber-600' }
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
    <div className="space-y-8 p-2">
      {/* Enhanced Header with Modern Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/10 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 opacity-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-16 bg-gradient-to-b from-primary via-primary/80 to-primary/60 rounded-full animate-pulse shadow-lg shadow-primary/25"></div>
              <div className="space-y-2">
                <h1 className="text-5xl font-black bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
                  {roleContent.title}
                </h1>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                  {roleContent.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant="default" 
                className="px-6 py-3 text-base font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                {currentUser?.role}
              </Badge>
              <Badge 
                variant="secondary" 
                className="px-6 py-3 text-base font-bold bg-muted/80 backdrop-blur-sm text-muted-foreground border border-border/50 hover:bg-muted hover:border-border transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                {currentUser?.department}
              </Badge>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/25 group-hover:shadow-3xl group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-4xl font-black text-primary-foreground drop-shadow-lg">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid with Improved Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roleContent.stats.map((stat, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl shadow-muted/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-3 hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 group-hover:to-primary/10 transition-all duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:blur-xl transition-all duration-500"></div>
            
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-foreground group-hover:text-primary transition-colors duration-300">
                    {stat.value}
                  </p>
                </div>
                <div className={`relative w-18 h-18 ${stat.color} rounded-3xl flex items-center justify-center shadow-xl shadow-black/10 group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <span className="text-4xl filter drop-shadow-lg">{stat.icon}</span>
                  <div className="absolute inset-0 bg-white/20 rounded-3xl group-hover:bg-white/30 transition-all duration-300"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Alerts Section */}
      {roleContent.alerts.length > 0 && (
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl shadow-muted/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-b border-border/50 p-8">
            <h3 className="text-3xl font-bold text-foreground flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-white text-2xl">🚨</span>
              </div>
              <span>System Alerts</span>
            </h3>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {roleContent.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`group flex items-center space-x-6 p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    alert.type === 'warning'
                      ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 dark:border-amber-700 hover:from-amber-100 hover:via-yellow-100 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:via-yellow-900/30 dark:hover:to-amber-900/30 hover:shadow-amber-500/20'
                      : alert.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-emerald-200 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-900/20 dark:border-emerald-700 hover:from-emerald-100 hover:via-green-100 hover:to-emerald-100 dark:hover:from-emerald-900/30 dark:hover:via-green-900/30 dark:hover:to-emerald-900/30 hover:shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-blue-200 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 dark:border-blue-700 hover:from-blue-100 hover:via-cyan-100 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:via-cyan-900/30 dark:hover:to-blue-900/30 hover:shadow-blue-500/20'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300 ${
                    alert.type === 'warning'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                      : alert.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                      : 'bg-gradient-to-r from-blue-400 to-cyan-500'
                  }`} />
                  <p className="text-base font-semibold text-foreground flex-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Recent Documents Section */}
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl shadow-muted/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-b border-border/50 p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-foreground flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white text-2xl">📄</span>
              </div>
              <span>Recent Documents</span>
            </h3>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearDocuments}
                className="px-8 py-3 font-bold border-2 border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Clear All
              </Button>
              <Link href="/upload">
                <Button 
                  variant="default" 
                  size="sm"
                  className="px-8 py-3 font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground border-0 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                >
                  Upload
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {recentDocuments.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <span className="relative text-9xl block filter drop-shadow-2xl">📄</span>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">No documents yet</h4>
              <p className="text-lg font-medium text-muted-foreground">
                Upload your first document to get started with DocuMind AI
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentDocuments.map((doc, index) => (
                <div 
                  key={doc.id} 
                  className="group flex items-center gap-6 p-6 border-2 border-border rounded-3xl hover:bg-muted/30 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl flex items-center justify-center shadow-xl shadow-primary/25 group-hover:shadow-2xl group-hover:shadow-primary/30 group-hover:scale-110 transition-all duration-300">
                    <span className="text-primary-foreground font-black text-base drop-shadow-sm">
                      {doc.fileType}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-semibold">{new Date(doc.uploadedAt).toLocaleString()}</span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      <span className="font-semibold">{doc.size}</span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      <Badge 
                        size="sm" 
                        variant={doc.status === 'Processed' ? 'default' : doc.status === 'Pending' ? 'secondary' : 'destructive'}
                        className="px-4 py-1 font-bold rounded-xl"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link href={`/document/${doc.id}`}>
                      <Button 
                        size="sm" 
                        variant="default"
                        className="px-6 py-3 font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                      >
                        View
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteDocument(doc.id)}
                      className="px-6 py-3 font-bold bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground border-0 rounded-2xl shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-300 hover:scale-105"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions Section */}
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl shadow-muted/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-b border-border/50 p-8">
          <h3 className="text-3xl font-bold text-foreground flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <span>Quick Actions</span>
          </h3>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/upload" className="group">
              <Button 
                variant="default" 
                className="w-full h-24 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground border-0 rounded-3xl shadow-2xl shadow-primary/25 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">📤</span>
                <span className="font-bold text-base">Upload Document</span>
              </Button>
            </Link>
            
            <Link href="/search" className="group">
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col items-center justify-center gap-4 border-2 border-border text-muted-foreground hover:bg-gradient-to-br hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 hover:text-white hover:border-transparent rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group-hover:shadow-emerald-500/25"
              >
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">🔍</span>
                <span className="font-bold text-base">Search Documents</span>
              </Button>
            </Link>
            
            <Link href="/compliance" className="group">
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col items-center justify-center gap-4 border-2 border-border text-muted-foreground hover:bg-gradient-to-br hover:from-amber-500 hover:via-orange-500 hover:to-red-500 hover:text-white hover:border-transparent rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group-hover:shadow-amber-500/25"
              >
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300">✅</span>
                <span className="font-bold text-base">View Compliance</span>
              </Button>
            </Link>
            
            {currentUser?.role === 'admin' && (
              <Link href="/admin" className="group">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-4 border-2 border-border text-muted-foreground hover:bg-gradient-to-br hover:from-red-500 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group-hover:shadow-red-500/25"
                >
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300">⚙️</span>
                  <span className="font-bold text-base">Manage Users</span>
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