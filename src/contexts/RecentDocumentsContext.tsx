"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type RecentDocumentStatus = 'Processed' | 'Pending' | 'Failed';

export interface RecentDocumentEntry {
  id: string;
  title: string;
  uploadedAt: string; // ISO string
  fileType: string; // e.g. PDF, PNG, TXT
  size: string; // human readable like 2.3 MB
  status: RecentDocumentStatus;
  // For viewing
  previewUrl?: string; // blob/object URL for browser
  textContent?: string; // for text-based docs
  // Raw file reference for local preview if needed
  fileName?: string;
}

interface RecentDocumentsContextType {
  documents: RecentDocumentEntry[];
  addDocument: (doc: RecentDocumentEntry) => void;
  clearDocuments: () => void;
  getDocumentById: (id: string) => RecentDocumentEntry | undefined;
  deleteDocument: (id: string) => void;
}

const RecentDocumentsContext = createContext<RecentDocumentsContextType | undefined>(undefined);

const STORAGE_KEY = 'recentDocuments';

function loadFromSessionStorage(): RecentDocumentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentDocumentEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToSessionStorage(docs: RecentDocumentEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // ignore
  }
}

export const RecentDocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<RecentDocumentEntry[]>([]);
  const initializedRef = useRef(false);

  // Initialize from storage
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    // Migrate from session to local if exists
    const sessionDocs = loadFromSessionStorage();
    const localRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const localDocs = localRaw ? (JSON.parse(localRaw) as RecentDocumentEntry[]) : [];
    const initial = (localDocs && Array.isArray(localDocs) ? localDocs : []).length > 0 ? localDocs : sessionDocs;
    setDocuments(initial);
    try {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      } catch {}
    }
  }, [documents]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.storageArea === localStorage) {
        try {
          const next = e.newValue ? (JSON.parse(e.newValue) as RecentDocumentEntry[]) : [];
          setDocuments(next || []);
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addDocument = useCallback((doc: RecentDocumentEntry) => {
    setDocuments(prev => [doc, ...prev.filter(d => d.id !== doc.id)]);
  }, []);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    try {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
  }, []);

  const getDocumentById = useCallback((id: string) => {
    return documents.find(d => d.id === id);
  }, [documents]);

  // Deletion API
  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const value = useMemo(() => ({
    documents,
    addDocument,
    clearDocuments,
    getDocumentById,
    deleteDocument
  }), [documents, addDocument, clearDocuments, getDocumentById, deleteDocument]);

  return (
    <RecentDocumentsContext.Provider value={value}>
      {children}
    </RecentDocumentsContext.Provider>
  );
};

export function useRecentDocuments(): RecentDocumentsContextType {
  const ctx = useContext(RecentDocumentsContext);
  if (!ctx) throw new Error('useRecentDocuments must be used within RecentDocumentsProvider');
  return ctx;
}


