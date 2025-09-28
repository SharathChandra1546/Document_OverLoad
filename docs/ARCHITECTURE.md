# Architecture Overview

- Recent Documents
  - Implemented as a React context: `src/contexts/RecentDocumentsContext.tsx`
  - Stores array of entries in localStorage under `recentDocuments`
  - APIs: addDocument, deleteDocument, clearDocuments, getDocumentById
  - Cross-tab updates via `storage` event listener

- Upload Flow
  - `src/components/upload/UploadPage.tsx`
  - Processes file locally and adds entry with `previewUrl` and `textContent`
  - Triggers real-time updates to Dashboard and Search via context state

- Dashboard
  - `src/components/dashboard/Dashboard.tsx`
  - Shows Recent Documents, details modal, read full document link, clear all, delete

- Search
  - `src/components/search/SearchPage.tsx`
  - Client-side search over Recent Documents (title, filename, textContent)
  - Results update immediately when documents change

- Document View
  - `src/components/document/DocumentPreview.tsx`
  - Loads entry by id from context and renders metadata, OCR text, and iframe preview

- Future Endpoints
  - Defined in `docs/ENDPOINTS.md`
