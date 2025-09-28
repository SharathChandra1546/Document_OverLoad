// Database connections
export { postgres, withDatabase } from './postgres';
export { milvus, withVectorDB } from './milvus';

// Database initialization
export { dbInitializer, ensureDatabaseInitialized, DatabaseInitializer } from './init';

// Database utilities
export { DatabaseUtils } from './utils';
export type { PaginationOptions, PaginatedResult } from './utils';

// Vector database types
export type { VectorChunk, SearchResult } from './milvus';

// Configuration
export { databaseConfig, appConfig } from '../config/database';

// Testing utilities (development only)
export { DatabaseTest, runDatabaseTests } from './test';