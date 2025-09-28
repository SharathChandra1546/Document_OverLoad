# REST Endpoints (Planned)

These are the standardized endpoint names for future backend integration. The current app is client-only; these define the contract to implement server-side later.

- GET /api/documents
  - List documents
  - Query params: none (future: pagination, filters)
  - 200: [{ id, title, uploadedAt, fileType, size, status }]

- POST /api/documents
  - Upload a document
  - Content-Type: multipart/form-data
  - Fields: file (binary), metadata (JSON string, optional)
  - 201: { id }

- GET /api/documents/{id}
  - Get a document metadata and content preview URL (signed URL)
  - 200: { id, title, uploadedAt, fileType, size, status, previewUrl }

- DELETE /api/documents/{id}
  - Delete a document
  - 204: no content

- GET /api/search?query=...
  - Search across title, filename, text
  - 200: [{ id, title, fileType, size, snippet, relevanceScore }]

Notes
- Status codes follow standard REST.
- Use snake_case in JSON keys only if backend standards require; otherwise keep camelCase.
