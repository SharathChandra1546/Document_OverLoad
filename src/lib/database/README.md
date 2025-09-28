# Database Setup and Configuration

This directory contains the database connection utilities, schema, and initialization scripts for the DocuMind application.

## Overview

The application uses two databases:
- **PostgreSQL**: For storing metadata (users, documents, audit logs, sessions)
- **Milvus**: For storing document vectors for semantic search (optional)

## Files Structure

```
src/lib/database/
├── index.ts          # Main exports
├── postgres.ts       # PostgreSQL connection and utilities
├── milvus.ts         # Milvus vector database connection
├── init.ts           # Database initialization
├── utils.ts          # Common database utilities
├── schema.sql        # PostgreSQL schema definition
├── test.ts           # Database testing utilities
└── README.md         # This file
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure your database connections:

```bash
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=documind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Milvus Configuration (optional)
MILVUS_HOST=localhost:19530

# Authentication
JWT_SECRET=your-super-secret-jwt-key
```

### 2. Database Installation

#### PostgreSQL
```bash
# Using Docker
docker run --name postgres-documind \
  -e POSTGRES_DB=documind \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Or install locally (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### Milvus (Optional)
```bash
# Using Docker Compose
curl -sfL https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh -o standalone_embed.sh
bash standalone_embed.sh start
```

### 3. Initialize Database

The database will be automatically initialized when the application starts. You can also manually initialize it:

```bash
# Via API endpoint (development only)
curl -X POST http://localhost:3000/api/admin/init-database

# Or run the test script
node scripts/test-database.js
```

## Database Schema

### Users Table
- Stores user accounts with roles (staff, manager, admin, auditor)
- Includes authentication and profile information
- Default users are created during initialization

### Documents Table
- Stores document metadata and file information
- Links to users via `uploaded_by` foreign key
- Supports tags, content text, and JSON metadata

### Audit Logs Table
- Records all user actions and system events
- Includes IP address and user agent for security
- Supports JSON details for flexible logging

### User Sessions Table
- Manages JWT token lifecycle
- Supports token blacklisting and expiration
- Links to users for session management

## Usage Examples

### Basic Database Operations

```typescript
import { postgres, DatabaseUtils } from '@/lib/database';

// Simple query
const users = await postgres.query('SELECT * FROM users WHERE role = $1', ['admin']);

// Using utilities
const user = await DatabaseUtils.findById('users', userId);
const newUser = await DatabaseUtils.insert('users', userData);
```

### Vector Operations

```typescript
import { milvus, withVectorDB } from '@/lib/database';

// Insert vectors
await withVectorDB(async (db) => {
  await db.insertVectors([{
    id: 'chunk-1',
    document_id: 'doc-123',
    vector: [0.1, 0.2, ...],
    chunk_index: 0,
    content_snippet: 'Document content...'
  }]);
});

// Search vectors
const results = await milvus.searchVectors(queryVector, 10);
```

### Transactions

```typescript
import { postgres } from '@/lib/database';

const result = await postgres.transaction(async (client) => {
  const user = await client.query('INSERT INTO users (...) RETURNING *', [...]);
  const document = await client.query('INSERT INTO documents (...) RETURNING *', [...]);
  return { user: user.rows[0], document: document.rows[0] };
});
```

## Health Monitoring

Check database health via API:

```bash
curl http://localhost:3000/api/health/database
```

Response:
```json
{
  "success": true,
  "services": {
    "postgres": { "status": "healthy", "required": true },
    "milvus": { "status": "healthy", "required": false }
  },
  "overall": "healthy"
}
```

## Default Users

The system creates default users during initialization:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@documind.com | admin123 | admin | System administration |
| staff@documind.com | staff123 | staff | Regular user testing |
| manager@documind.com | manager123 | manager | Manager role testing |
| auditor@documind.com | auditor123 | auditor | Audit access testing |

**⚠️ Change these passwords in production!**

## Error Handling

The database utilities include:
- Automatic retry logic with exponential backoff
- Connection pooling and health monitoring
- Graceful degradation when Milvus is unavailable
- Comprehensive error logging

## Performance Considerations

- Database indexes are created for common query patterns
- Connection pooling is configured for optimal performance
- Pagination utilities prevent large result sets
- Vector operations are optimized for search performance

## Security Notes

- All queries use parameterized statements to prevent SQL injection
- Passwords are hashed using bcrypt
- JWT tokens support blacklisting via sessions table
- Audit logging tracks all sensitive operations
- Role-based access control is enforced at the database level