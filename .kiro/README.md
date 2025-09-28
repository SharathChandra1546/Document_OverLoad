# DocuMind Audit System Enhancements - Setup Guide

This guide provides step-by-step instructions to set up and run the DocuMind application with all the audit system enhancements after completing the implementation tasks.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **Docker** (optional, for easier database setup)
- **Git**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=documind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here

# Milvus Vector Database (Optional)
MILVUS_HOST=localhost:19530

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# OpenAI (for embeddings - optional)
OPENAI_API_KEY=your-openai-api-key-here

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name documind-postgres \
  -e POSTGRES_DB=documind \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password_here \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps
```

#### Option B: Local PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE documind;
CREATE USER postgres WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE documind TO postgres;
\q
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb documind
```

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install and follow the setup wizard
3. Create a database named `documind`

### 4. Set Up Milvus (Optional - for Semantic Search)

Milvus is optional but recommended for advanced document search capabilities.

#### Using Docker:

```bash
# Download and start Milvus
curl -sfL https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh -o standalone_embed.sh
bash standalone_embed.sh start

# Verify Milvus is running
curl http://localhost:19530/health
```

### 5. Initialize the Database

Build the project and initialize the database schema:

```bash
# Build the project
npm run build

# Initialize database (creates tables and default users)
curl -X POST http://localhost:3000/api/admin/init-database

# Or start the development server and it will auto-initialize
npm run dev
```

### 6. Verify Setup

Test your database connections:

```bash
# Run database tests
node scripts/test-database.js

# Check health endpoint
curl http://localhost:3000/api/health/database
```

Expected response:
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

## 👥 Default User Accounts

The system creates default users for testing. **Change these passwords in production!**

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@documind.com | admin123 | admin | Full system access |
| manager@documind.com | manager123 | manager | Department management |
| staff@documind.com | staff123 | staff | Basic document access |
| auditor@documind.com | auditor123 | auditor | Audit log access |

## 🔧 API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user info

### Users Management
- `GET /api/users` - List users (paginated)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `POST /api/users` - Create new user

### Documents Management
- `GET /api/documents` - List documents (paginated, filtered)
- `GET /api/documents/[id]` - Get document by ID
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/upload` - Upload new document
- `GET /api/documents/search` - Search documents (text + semantic)

### Audit Logs
- `GET /api/audit-logs` - List audit logs (paginated, filtered)
- `GET /api/audit-logs/[id]` - Get audit log by ID
- `POST /api/audit-logs` - Create audit log entry

### System Health
- `GET /api/health/database` - Database health check
- `POST /api/admin/init-database` - Initialize database (dev only)

## 🧪 Testing the System

### 1. Test Authentication

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@documind.com", "password": "admin123"}'

# Save the returned JWT token for subsequent requests
export JWT_TOKEN="your_jwt_token_here"
```

### 2. Test User Management

```bash
# List users
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "department": "IT",
    "role": "staff"
  }'
```

### 3. Test Document Upload

```bash
# Upload a document
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@/path/to/your/document.pdf" \
  -F "title=Test Document" \
  -F "tags=test,sample"
```

### 4. Test Audit Logs

```bash
# View audit logs
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:3000/api/audit-logs?page=1&limit=10"
```

## 🔍 Troubleshooting

### Database Connection Issues

1. **PostgreSQL not connecting:**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql  # Linux
   brew services list | grep postgresql  # macOS
   
   # Test connection manually
   psql -h localhost -U postgres -d documind
   ```

2. **Permission denied errors:**
   ```bash
   # Grant proper permissions
   sudo -u postgres psql
   GRANT ALL PRIVILEGES ON DATABASE documind TO postgres;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
   ```

### Milvus Connection Issues

1. **Milvus not starting:**
   ```bash
   # Check Docker containers
   docker ps -a
   
   # Restart Milvus
   bash standalone_embed.sh restart
   ```

2. **Port conflicts:**
   - Change `MILVUS_HOST` in `.env` if using different port
   - Default Milvus port is 19530

### Application Issues

1. **Build errors:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment variables not loading:**
   - Ensure `.env` file is in project root
   - Restart the development server after changes
   - Check for typos in variable names

3. **JWT token issues:**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration settings
   - Clear browser cookies/localStorage

## 📁 File Structure

```
project-root/
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── src/
│   ├── app/
│   │   ├── api/                  # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── users/           # User management endpoints
│   │   │   ├── documents/       # Document management endpoints
│   │   │   ├── audit-logs/      # Audit log endpoints
│   │   │   └── health/          # Health check endpoints
│   │   └── ...                  # Next.js app pages
│   ├── lib/
│   │   ├── database/            # Database utilities
│   │   │   ├── postgres.ts      # PostgreSQL connection
│   │   │   ├── milvus.ts        # Milvus connection
│   │   │   ├── schema.sql       # Database schema
│   │   │   └── init.ts          # Database initialization
│   │   ├── auth/                # Authentication utilities
│   │   └── types/               # TypeScript type definitions
│   └── components/              # React components
├── scripts/
│   └── test-database.js         # Database testing script
└── uploads/                     # File upload directory
```

## 🔐 Security Considerations

### Production Deployment

1. **Change default passwords:**
   ```sql
   -- Connect to your database and update passwords
   UPDATE users SET password_hash = '$2a$10$new_hash_here' 
   WHERE email IN ('admin@documind.com', 'staff@documind.com', 'manager@documind.com', 'auditor@documind.com');
   ```

2. **Update JWT secret:**
   ```env
   JWT_SECRET=your-very-secure-random-string-here
   ```

3. **Configure HTTPS:**
   - Use reverse proxy (nginx/Apache)
   - Enable SSL certificates
   - Update `NEXT_PUBLIC_APP_URL` to use https://

4. **Database security:**
   - Use strong database passwords
   - Enable SSL connections
   - Restrict database access by IP
   - Regular backups

### Environment Variables for Production

```env
NODE_ENV=production
POSTGRES_HOST=your-production-db-host
POSTGRES_PASSWORD=very-secure-password
JWT_SECRET=very-long-random-string
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📊 Monitoring and Maintenance

### Health Monitoring

Set up monitoring for:
- Database connectivity: `GET /api/health/database`
- Application health: `GET /api/health`
- Disk space for uploads directory
- Database performance and query times

### Regular Maintenance

1. **Database cleanup:**
   ```sql
   -- Clean old audit logs (older than 1 year)
   DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
   
   -- Clean expired sessions
   DELETE FROM user_sessions WHERE expires_at < NOW();
   ```

2. **File cleanup:**
   ```bash
   # Remove orphaned files (files not referenced in database)
   # Create a cleanup script based on your needs
   ```

## 🆘 Support

If you encounter issues:

1. Check the application logs
2. Verify database connections using the health endpoints
3. Run the database test script: `node scripts/test-database.js`
4. Check environment variables are correctly set
5. Ensure all required services (PostgreSQL, Milvus) are running

For development issues, check the browser console and network tab for API errors.

## 🎉 Success!

If everything is working correctly, you should be able to:

- ✅ Access the application at http://localhost:3000
- ✅ Login with default user accounts
- ✅ Upload and manage documents
- ✅ View audit logs
- ✅ Search documents (text and semantic if Milvus is configured)
- ✅ Manage users (admin role)

The DocuMind audit system enhancements are now fully operational!