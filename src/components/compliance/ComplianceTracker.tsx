'use client';

import { useState } from 'react';
import Link from 'next/link';
// Compliance data source removed; rendering empty state with basic filters
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

type ComplianceStatus = 'All' | 'Pending' | 'Approved' | 'Expired' | 'In Review';
type SortBy = 'dueDate' | 'priority' | 'status' | 'title';

const ComplianceTracker: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus>('All');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Expired': return 'danger';
      case 'In Review': return 'info';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dueDate: string, status: string) => {
    if (status === 'Approved' || status === 'Expired') return status;
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil <= 7) return 'Due Soon';
    return 'On Track';
  };

  const getDueDateVariant = (dueDate: string, status: string) => {
    const dueStatus = getDueDateStatus(dueDate, status);
    switch (dueStatus) {
      case 'Overdue': return 'danger';
      case 'Due Soon': return 'warning';
      case 'Approved': return 'success';
      case 'Expired': return 'danger';
      default: return 'success';
    }
  };

  // No backend yet: empty list
  const filteredItems: any[] = [];

  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    expired: 0,
    overdue: 0
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Compliance Tracker
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor compliance items, deadlines, and regulatory requirements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="title">Title</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export Report
              </Button>
              <Button variant="default" size="sm">
                Add Compliance Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const daysUntil = getDaysUntilDue(item.dueDate);
          const dueStatus = getDueDateStatus(item.dueDate, item.status);
          
          return (
            <Card key={item.id} hover>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <Badge variant={getStatusVariant(item.status) as any}>
                        {item.status}
                      </Badge>
                      <Badge variant={getPriorityVariant(item.priority) as any}>
                        {item.priority} Priority
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {item.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                          <Badge variant={getDueDateVariant(item.dueDate, item.status) as any} size="sm">
                            {dueStatus}
                            {daysUntil !== 0 && !['Approved', 'Expired'].includes(item.status) && (
                              <span className="ml-1">
                                ({Math.abs(daysUntil)} days {daysUntil < 0 ? 'overdue' : 'remaining'})
                              </span>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Responsible:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.responsiblePerson}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.department}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Related Document:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.relatedDocument}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {item.status === 'Pending' && (
                      <Button variant="default" size="sm">
                        Mark as Reviewed
                      </Button>
                    )}
                    {item.status === 'In Review' && (
                      <Button variant="default" size="sm">
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No compliance items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or add a new compliance item
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComplianceTracker;
