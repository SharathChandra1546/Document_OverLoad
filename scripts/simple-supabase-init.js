#!/usr/bin/env node

/**
 * Simple Supabase initialization script
 * Creates tables and sample data step by step
 */

const { Pool } = require('pg');

// Supabase configuration
const SUPABASE_DB_CONFIG = {
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.enmydvcrqenckbllewaa',
  password: 'hS7azyLGjgNPdmFt',
  ssl: { rejectUnauthorized: false }
};

console.log('🚀 Initializing Supabase database...\n');

async function createTables() {
  const pool = new Pool(SUPABASE_DB_CONFIG);
  
  try {
    console.log('📡 Testing connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase');
    
    console.log('\n📋 Creating tables...');
    
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('staff', 'manager', 'admin', 'auditor')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ Users table created');
    
    // Create documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(1000) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'processing')),
        tags TEXT[],
        content_text TEXT,
        summary TEXT,
        vector_id VARCHAR(255),
        metadata JSONB
      )
    `);
    console.log('✅ Documents table created');
    
    // Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Audit logs table created');
    
    // Create user_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ User sessions table created');
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
    console.log('✅ Indexes created');
    
    // Insert sample data
    console.log('\n📊 Inserting sample data...');
    
    // Check if data already exists
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) > 0) {
      console.log('ℹ️ Sample data already exists, skipping...');
    } else {
      // Insert sample users
      await pool.query(`
        INSERT INTO users (id, email, password_hash, name, department, role, created_at, updated_at, is_active)
        VALUES 
          ('550e8400-e29b-41d4-a716-446655440001', 'admin@kochimetro.com', '$2b$10$rQZ8K9XvY2H3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I', 'Admin User', 'Operations', 'admin', NOW(), NOW(), true),
          ('550e8400-e29b-41d4-a716-446655440002', 'staff@kochimetro.com', '$2b$10$rQZ8K9XvY2H3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I', 'Staff User', 'Operations', 'staff', NOW(), NOW(), true),
          ('550e8400-e29b-41d4-a716-446655440003', 'auditor@kochimetro.com', '$2b$10$rQZ8K9XvY2H3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I', 'Auditor User', 'Compliance', 'auditor', NOW(), NOW(), true)
        ON CONFLICT (email) DO NOTHING
      `);
      console.log('✅ Sample users inserted');
      
      // Insert sample documents
      await pool.query(`
        INSERT INTO documents (id, title, filename, file_path, file_type, file_size, uploaded_by, uploaded_at, updated_at, status, tags, content_text)
        VALUES 
          ('550e8400-e29b-41d4-a716-446655440010', 'Kochi Metro Operations Manual', 'metro_operations.pdf', '/uploads/metro_operations.pdf', 'application/pdf', 2048576, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), 'processed', ARRAY['operations', 'manual'], 'Kochi Metro Rail operations manual containing safety procedures, operational guidelines, and maintenance protocols.'),
          ('550e8400-e29b-41d4-a716-446655440011', 'Station Layout Plans', 'station_layouts.pdf', '/uploads/station_layouts.pdf', 'application/pdf', 1536000, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 'processed', ARRAY['stations', 'layout'], 'Detailed station layout plans showing passenger flow, emergency exits, and facility locations.'),
          ('550e8400-e29b-41d4-a716-446655440012', 'Safety Guidelines', 'safety_guidelines.pdf', '/uploads/safety_guidelines.pdf', 'application/pdf', 1024000, '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 'processed', ARRAY['safety', 'guidelines'], 'Comprehensive safety guidelines for passengers and staff including emergency procedures and evacuation protocols.')
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('✅ Sample documents inserted');
    }
    
    // Verify setup
    console.log('\n🔍 Verifying setup...');
    const usersCountFinal = await pool.query('SELECT COUNT(*) FROM users');
    const documentsCount = await pool.query('SELECT COUNT(*) FROM documents');
    const auditLogsCount = await pool.query('SELECT COUNT(*) FROM audit_logs');
    const sessionsCount = await pool.query('SELECT COUNT(*) FROM user_sessions');
    
    console.log(`📊 Database Status:`);
    console.log(`   - Users: ${usersCountFinal.rows[0].count}`);
    console.log(`   - Documents: ${documentsCount.rows[0].count}`);
    console.log(`   - Audit Logs: ${auditLogsCount.rows[0].count}`);
    console.log(`   - User Sessions: ${sessionsCount.rows[0].count}`);
    
    console.log('\n🎉 Supabase database initialization completed successfully!');
    console.log('\n📝 Your database is ready to use with your application.');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createTables().catch(error => {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createTables };
