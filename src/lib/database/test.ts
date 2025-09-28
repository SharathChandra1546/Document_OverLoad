import { postgres } from './postgres';
import { milvus } from './milvus';
import { dbInitializer } from './init';

/**
 * Simple database test functions for development and debugging
 */
export class DatabaseTest {
  
  static async testPostgreSQLConnection(): Promise<boolean> {
    try {
      console.log('Testing PostgreSQL connection...');
      
      await postgres.connect();
      const result = await postgres.query('SELECT NOW() as current_time, version() as version');
      
      console.log('PostgreSQL connection successful:');
      console.log('- Current time:', result.rows[0].current_time);
      console.log('- Version:', result.rows[0].version.split(' ')[0]);
      
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    }
  }

  static async testMilvusConnection(): Promise<boolean> {
    try {
      console.log('Testing Milvus connection...');
      
      await milvus.connect();
      const isHealthy = await milvus.healthCheck();
      
      if (isHealthy) {
        console.log('Milvus connection successful');
        return true;
      } else {
        console.error('Milvus health check failed');
        return false;
      }
    } catch (error) {
      console.error('Milvus connection test failed:', error);
      return false;
    }
  }

  static async testDatabaseSchema(): Promise<boolean> {
    try {
      console.log('Testing database schema...');
      
      // Test users table
      const usersResult = await postgres.query(`
        SELECT COUNT(*) as count FROM users WHERE role = 'admin'
      `);
      console.log('- Admin users found:', usersResult.rows[0].count);

      // Test documents table structure
      const documentsResult = await postgres.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        ORDER BY ordinal_position
      `);
      console.log('- Documents table columns:', documentsResult.rows.length);

      // Test audit_logs table structure
      const auditResult = await postgres.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        ORDER BY ordinal_position
      `);
      console.log('- Audit logs table columns:', auditResult.rows.length);

      // Test user_sessions table structure
      const sessionsResult = await postgres.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        ORDER BY ordinal_position
      `);
      console.log('- User sessions table columns:', sessionsResult.rows.length);

      return true;
    } catch (error) {
      console.error('Database schema test failed:', error);
      return false;
    }
  }

  static async runAllTests(): Promise<{
    postgres: boolean;
    milvus: boolean;
    schema: boolean;
    overall: boolean;
  }> {
    console.log('Running database tests...\n');

    // Initialize database first
    try {
      await dbInitializer.initializeAll();
    } catch (error) {
      console.error('Database initialization failed:', error);
    }

    const postgresTest = await this.testPostgreSQLConnection();
    console.log('');
    
    const milvusTest = await this.testMilvusConnection();
    console.log('');
    
    const schemaTest = postgresTest ? await this.testDatabaseSchema() : false;
    console.log('');

    const overall = postgresTest && schemaTest; // Milvus is optional

    console.log('Test Results:');
    console.log('- PostgreSQL:', postgresTest ? '✅ PASS' : '❌ FAIL');
    console.log('- Milvus:', milvusTest ? '✅ PASS' : '⚠️  OPTIONAL');
    console.log('- Schema:', schemaTest ? '✅ PASS' : '❌ FAIL');
    console.log('- Overall:', overall ? '✅ PASS' : '❌ FAIL');

    return {
      postgres: postgresTest,
      milvus: milvusTest,
      schema: schemaTest,
      overall,
    };
  }
}

// Export test runner for CLI usage
export const runDatabaseTests = DatabaseTest.runAllTests.bind(DatabaseTest);