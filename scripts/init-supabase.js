#!/usr/bin/env node

/**
 * Script to initialize Supabase database with schema and sample data.
 * This script will:
 * 1. Connect to Supabase PostgreSQL.
 * 2. Create schema in Supabase (if not exists).
 * 3. Insert sample data for testing.
 * 4. Verify setup.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local', override: true });

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

async function testSupabaseConnection() {
  console.log('📡 Testing Supabase connection...');
  
  const supabasePool = new Pool(SUPABASE_DB_CONFIG);
  
  try {
    await supabasePool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase database successfully');
    return supabasePool;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    throw error;
  }
}

async function createSchema(supabasePool) {
  console.log('\n📋 Creating database schema...');
  
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await supabasePool.query(statement);
        } catch (error) {
          // Ignore errors for existing objects
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️ Warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database schema created successfully');
    
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    throw error;
  }
}

async function insertSampleData(supabasePool) {
  console.log('\n📊 Inserting sample data...');
  
  try {
    // Check if data already exists
    const usersCount = await supabasePool.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) > 0) {
      console.log('ℹ️ Sample data already exists, skipping...');
      return;
    }
    
    // Insert sample users
    await supabasePool.query(`
      INSERT INTO users (id, email, password_hash, name, department, role, created_at, updated_at, is_active)
      VALUES 
        ('550e8400-e29b-41d4-a716-446655440001', 'admin@kochimetro.com', '$2b$10$rQZ8K9XvY2H3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I', 'Admin User', 'Operations', 'Admin', NOW(), NOW(), true),
        ('550e8400-e29b-41d4-a716-446655440002', 'staff@kochimetro.com', '$2b$10$rQZ8K9XvY2H3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I', 'Staff User', 'Operations', 'Staff', NOW(), NOW(), true),
        ('550e8400-e29b-41d4-a716-446655440003', 'engineer@kochimetro.com', '$2b$10$rQZ8K9XvY2H3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I', 'Engineer User', 'Technical', 'Engineer', NOW(), NOW(), true)
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✅ Sample users inserted');
    
    // Insert sample documents
    await supabasePool.query(`
      INSERT INTO documents (id, title, filename, file_path, file_type, file_size, uploaded_by, uploaded_at, updated_at, status, tags, content_text)
      VALUES 
        ('doc-001', 'Kochi Metro Operations Manual', 'metro_operations.pdf', '/uploads/metro_operations.pdf', 'application/pdf', 2048576, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), 'processed', ARRAY['operations', 'manual'], 'Kochi Metro Rail operations manual containing safety procedures, operational guidelines, and maintenance protocols.'),
        ('doc-002', 'Station Layout Plans', 'station_layouts.pdf', '/uploads/station_layouts.pdf', 'application/pdf', 1536000, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 'processed', ARRAY['stations', 'layout'], 'Detailed station layout plans showing passenger flow, emergency exits, and facility locations.'),
        ('doc-003', 'Safety Guidelines', 'safety_guidelines.pdf', '/uploads/safety_guidelines.pdf', 'application/pdf', 1024000, '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 'processed', ARRAY['safety', 'guidelines'], 'Comprehensive safety guidelines for passengers and staff including emergency procedures and evacuation protocols.')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Sample documents inserted');
    
    // Insert sample audit logs
    await supabasePool.query(`
      INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
      VALUES 
        ('audit-001', '550e8400-e29b-41d4-a716-446655440001', 'login', 'user', '550e8400-e29b-41d4-a716-446655440001', '{"method": "email", "success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
        ('audit-002', '550e8400-e29b-41d4-a716-446655440001', 'upload', 'document', 'doc-001', '{"filename": "metro_operations.pdf", "size": 2048576}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
        ('audit-003', '550e8400-e29b-41d4-a716-446655440002', 'view', 'document', 'doc-002', '{"document_id": "doc-002"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Sample audit logs inserted');
    
    console.log('✅ Sample data inserted successfully');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  }
}

async function verifySetup(supabasePool) {
  console.log('\n🔍 Verifying database setup...');
  
  try {
    // Check table counts
    const usersCount = await supabasePool.query('SELECT COUNT(*) FROM users');
    const documentsCount = await supabasePool.query('SELECT COUNT(*) FROM documents');
    const auditLogsCount = await supabasePool.query('SELECT COUNT(*) FROM audit_logs');
    const sessionsCount = await supabasePool.query('SELECT COUNT(*) FROM user_sessions');
    
    console.log(`📊 Supabase Database Status:`);
    console.log(`   - Users: ${usersCount.rows[0].count}`);
    console.log(`   - Documents: ${documentsCount.rows[0].count}`);
    console.log(`   - Audit Logs: ${auditLogsCount.rows[0].count}`);
    console.log(`   - User Sessions: ${sessionsCount.rows[0].count}`);
    
    // Test a simple query
    const testQuery = await supabasePool.query(`
      SELECT u.name, u.email, u.role, COUNT(d.id) as document_count
      FROM users u
      LEFT JOIN documents d ON u.id = d.uploaded_by
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY u.name
    `);
    
    console.log('\n👥 User Summary:');
    testQuery.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role} - ${user.document_count} documents`);
    });
    
    console.log('\n✅ Supabase database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Test your application with the Supabase database');
    console.log('2. Update your deployment configuration');
    console.log('3. Configure your API keys for OCR and AI features');
    
  } catch (error) {
    console.error('❌ Error verifying setup:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  let supabasePool;
  
  try {
    supabasePool = await testSupabaseConnection();
    await createSchema(supabasePool);
    await insertSampleData(supabasePool);
    await verifySetup(supabasePool);
  } catch (error) {
    console.error('\n❌ Supabase initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (supabasePool) {
      await supabasePool.end();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSupabaseConnection, createSchema, insertSampleData, verifySetup };
