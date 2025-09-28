import { readFileSync } from 'fs';
import { join } from 'path';
import { postgres } from './postgres';
import { milvus } from './milvus';

export class DatabaseInitializer {
  private static instance: DatabaseInitializer;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer();
    }
    return DatabaseInitializer.instance;
  }

  async initializeAll(): Promise<void> {
    if (this.isInitialized) {
      console.log('Database already initialized');
      return;
    }

    try {
      console.log('Starting database initialization...');
      
      // Initialize PostgreSQL
      await this.initializePostgreSQL();
      
      // Initialize Milvus
      await this.initializeMilvus();
      
      this.isInitialized = true;
      console.log('Database initialization completed successfully');
      
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async initializePostgreSQL(): Promise<void> {
    try {
      console.log('Initializing PostgreSQL...');
      
      // Connect to PostgreSQL
      await postgres.connect();
      
      // Read and execute schema
      const schemaPath = join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements and execute them
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await postgres.query(statement);
          } catch (error) {
            // Log but don't fail on duplicate objects or other non-critical errors
            console.warn('Schema statement warning:', error);
          }
        }
      }
      
      console.log('PostgreSQL schema initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize PostgreSQL:', error);
      throw error;
    }
  }

  private async initializeMilvus(): Promise<void> {
    try {
      console.log('Initializing Milvus...');
      
      // Connect to Milvus (this will also create the collection if it doesn't exist)
      await milvus.connect();
      
      console.log('Milvus initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize Milvus:', error);
      // Don't throw error for Milvus as it's optional for basic functionality
      console.warn('Continuing without Milvus - semantic search will be unavailable');
    }
  }

  async healthCheck(): Promise<{
    postgres: boolean;
    milvus: boolean;
    overall: boolean;
  }> {
    const postgresHealth = await postgres.healthCheck();
    const milvusHealth = await milvus.healthCheck();
    
    return {
      postgres: postgresHealth,
      milvus: milvusHealth,
      overall: postgresHealth, // Postgres is required, Milvus is optional
    };
  }

  async shutdown(): Promise<void> {
    try {
      console.log('Shutting down database connections...');
      
      await Promise.all([
        postgres.disconnect(),
        milvus.disconnect(),
      ]);
      
      this.isInitialized = false;
      console.log('Database connections closed successfully');
      
    } catch (error) {
      console.error('Error during database shutdown:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const dbInitializer = DatabaseInitializer.getInstance();

// Helper function to ensure database is initialized
export const ensureDatabaseInitialized = async (): Promise<void> => {
  if (!dbInitializer.isReady()) {
    await dbInitializer.initializeAll();
  }
};