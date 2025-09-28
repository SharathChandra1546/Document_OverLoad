import { Pool, PoolClient, QueryResult } from 'pg';
import { databaseConfig } from '../config/database';

class PostgreSQLConnection {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    try {
      this.pool = new Pool(databaseConfig.postgres);
      
      // Handle pool errors
      this.pool.on('error', (err) => {
        console.error('PostgreSQL pool error:', err);
        this.isConnected = false;
      });

      // Handle client connection
      this.pool.on('connect', () => {
        console.log('PostgreSQL client connected');
        this.isConnected = true;
      });

      // Handle client removal
      this.pool.on('remove', () => {
        console.log('PostgreSQL client removed');
      });

    } catch (error) {
      console.error('Failed to initialize PostgreSQL pool:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    try {
      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('PostgreSQL connection established successfully');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.pool.query(text, params);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`PostgreSQL query attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    try {
      return await this.pool.connect();
    } catch (error) {
      console.error('Failed to get PostgreSQL client:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        this.isConnected = false;
        console.log('PostgreSQL connection closed');
      } catch (error) {
        console.error('Error closing PostgreSQL connection:', error);
        throw error;
      }
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.pool !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const postgres = new PostgreSQLConnection();

// Helper function for database operations
export const withDatabase = async <T>(
  operation: (db: PostgreSQLConnection) => Promise<T>
): Promise<T> => {
  try {
    if (!postgres.isHealthy()) {
      await postgres.connect();
    }
    return await operation(postgres);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
};