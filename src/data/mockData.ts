export type UserRole = 'Admin' | 'Staff' | 'Engineer' | 'Executive';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  avatar?: string;
}

export interface Document {
  id: string;
  title: string;
  uploader: string;
  uploadDate: string;
  language: 'English' | 'Malayalam';
  summary: string;
  ocrText: string;
  tags: string[];
  expiryDate?: string;
  fileType: string;
  fileSize: string;
  relevanceScore?: number;
}

export interface ComplianceItem {
  id: string;
  title: string;
  relatedDocument: string;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Expired' | 'In Review';
  responsiblePerson: string;
  department: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface SearchResult {
  document: Document;
  snippet: string;
  relevanceScore: number;
  matchedTerms: string[];
}

// Deprecated mock users removed

// Deprecated mock documents removed. Use RecentDocuments context instead.

// Deprecated mock compliance items removed

// Deprecated mock search results removed

// Helper functions
// Deprecated helpers removed

// Deprecated helpers removed

// Deprecated helpers removed

// Deprecated search function removed
