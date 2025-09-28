// Database configuration
export const databaseConfig = {
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'documind',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
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