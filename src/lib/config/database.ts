// Database configuration - Supabase focused
export const databaseConfig = {
  postgres: {
    // Supabase PostgreSQL configuration using session pooler
    host: process.env.SUPABASE_HOST || 'aws-1-us-east-2.pooler.supabase.com',
    port: parseInt(process.env.SUPABASE_PORT || '5432'),
    database: process.env.SUPABASE_DB || 'postgres',
    user: process.env.SUPABASE_USER || 'postgres.enmydvcrqenckbllewaa',
    password: process.env.SUPABASE_PASSWORD || 'hS7azyLGjgNPdmFt',
    ssl: { rejectUnauthorized: false }, // Required for Supabase SSL
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Increased timeout for Supabase
    statement_timeout: 30000, // Statement timeout
    query_timeout: 30000, // Query timeout
  },
  milvus: {
    address: process.env.MILVUS_HOST || 'localhost:19530',
    username: process.env.MILVUS_USERNAME || '',
    password: process.env.MILVUS_PASSWORD || '',
    database: process.env.MILVUS_DATABASE || 'default',
    token: process.env.MILVUS_TOKEN || '',
  }
};

export const appConfig = {
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  },
  storage: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  }
};