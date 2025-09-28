// Database model types

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  department: string | null;
  role: 'staff' | 'manager' | 'admin' | 'auditor';
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  department?: string;
  role?: 'staff' | 'manager' | 'admin' | 'auditor';
}

export interface UserUpdateInput {
  email?: string;
  name?: string;
  department?: string;
  role?: 'staff' | 'manager' | 'admin' | 'auditor';
  is_active?: boolean;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string | null;
  uploaded_at: Date;
  updated_at: Date;
  status: 'active' | 'deleted' | 'processing';
  tags: string[];
  content_text: string | null;
  vector_id: string | null;
  metadata: Record<string, any> | null;
}

export interface DocumentCreateInput {
  title: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  tags?: string[];
  content_text?: string;
  metadata?: Record<string, any>;
}

export interface DocumentUpdateInput {
  title?: string;
  status?: 'active' | 'deleted' | 'processing';
  tags?: string[];
  content_text?: string;
  vector_id?: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface AuditLogCreateInput {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  is_active: boolean;
}

export interface UserSessionCreateInput {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}

// Search and filter types
export interface DocumentFilters {
  uploaded_by?: string;
  file_type?: string;
  status?: 'active' | 'deleted' | 'processing';
  tags?: string[];
  uploaded_after?: Date;
  uploaded_before?: Date;
  search?: string;
}

export interface AuditLogFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface UserFilters {
  role?: 'staff' | 'manager' | 'admin' | 'auditor';
  department?: string;
  is_active?: boolean;
  search?: string;
}

// API response types
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends DatabaseResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Vector database types
export interface VectorDocument {
  id: string;
  document_id: string;
  vector: number[];
  chunk_index: number;
  content_snippet: string;
}

export interface VectorSearchResult {
  id: string;
  document_id: string;
  score: number;
  content_snippet: string;
  chunk_index: number;
}

// Database connection status
export interface DatabaseHealth {
  postgres: boolean;
  milvus: boolean;
  overall: boolean;
}