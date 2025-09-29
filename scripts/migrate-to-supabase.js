#!/usr/bin/env node

/**
 * Migration script to move from local PostgreSQL to Supabase
 * This script will:
 * 1. Export data from local PostgreSQL
 * 2. Create schema in Supabase
 * 3. Import data to Supabase
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'documind',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
};

const SUPABASE_DB_CONFIG = {
  host: process.env.SUPABASE_HOST || 'db.your-project-id.supabase.co',
  port: parseInt(process.env.SUPABASE_PORT || '5432'),
  database: process.env.SUPABASE_DB || 'postgres',
  user: process.env.SUPABASE_USER || 'postgres',
  password: process.env.SUPABASE_PASSWORD || '',
  ssl: { rejectUnauthorized: false }
};

console.log('🚀 Starting migration from local PostgreSQL to Supabase...\n');

async function exportLocalData() {
  console.log('📤 Step 1: Exporting data from local PostgreSQL...');
  
  const localPool = new Pool(LOCAL_DB_CONFIG);
  
  try {
    // Test local connection
    await localPool.query('SELECT NOW()');
    console.log('✅ Connected to local PostgreSQL database');
    
    // Export users data
    const usersResult = await localPool.query('SELECT * FROM users ORDER BY created_at');
    const users = usersResult.rows;
    console.log(`📊 Found ${users.length} users`);
    
    // Export documents data
    const documentsResult = await localPool.query('SELECT * FROM documents ORDER BY uploaded_at');
    const documents = documentsResult.rows;
    console.log(`📊 Found ${documents.length} documents`);
    
    // Export audit logs data
    const auditLogsResult = await localPool.query('SELECT * FROM audit_logs ORDER BY created_at');
    const auditLogs = auditLogsResult.rows;
    console.log(`📊 Found ${auditLogs.length} audit logs`);
    
    // Export user sessions data
    const sessionsResult = await localPool.query('SELECT * FROM user_sessions ORDER BY created_at');
    const sessions = sessionsResult.rows;
    console.log(`📊 Found ${sessions.length} user sessions`);
    
    // Save exported data to JSON files
    const exportDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(exportDir, 'users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(exportDir, 'documents.json'), JSON.stringify(documents, null, 2));
    fs.writeFileSync(path.join(exportDir, 'audit_logs.json'), JSON.stringify(auditLogs, null, 2));
    fs.writeFileSync(path.join(exportDir, 'user_sessions.json'), JSON.stringify(sessions, null, 2));
    
    console.log('✅ Data exported successfully to ./scripts/exports/');
    
    return { users, documents, auditLogs, sessions };
    
  } catch (error) {
    console.error('❌ Error exporting local data:', error.message);
    throw error;
  } finally {
    await localPool.end();
  }
}

async function createSupabaseSchema() {
  console.log('\n📋 Step 2: Creating schema in Supabase...');
  
  const supabasePool = new Pool(SUPABASE_DB_CONFIG);
  
  try {
    // Test Supabase connection
    await supabasePool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase database');
    
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
    
    console.log('✅ Schema created successfully in Supabase');
    
  } catch (error) {
    console.error('❌ Error creating Supabase schema:', error.message);
    throw error;
  } finally {
    await supabasePool.end();
  }
}

async function importDataToSupabase(data) {
  console.log('\n📥 Step 3: Importing data to Supabase...');
  
  const supabasePool = new Pool(SUPABASE_DB_CONFIG);
  
  try {
    // Import users
    if (data.users.length > 0) {
      console.log(`📤 Importing ${data.users.length} users...`);
      for (const user of data.users) {
        await supabasePool.query(`
          INSERT INTO users (id, email, password_hash, name, department, role, created_at, updated_at, last_login, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            name = EXCLUDED.name,
            department = EXCLUDED.department,
            role = EXCLUDED.role,
            updated_at = EXCLUDED.updated_at,
            last_login = EXCLUDED.last_login,
            is_active = EXCLUDED.is_active
        `, [
          user.id, user.email, user.password_hash, user.name, user.department, user.role,
          user.created_at, user.updated_at, user.last_login, user.is_active
        ]);
      }
      console.log('✅ Users imported successfully');
    }
    
    // Import documents
    if (data.documents.length > 0) {
      console.log(`📤 Importing ${data.documents.length} documents...`);
      for (const doc of data.documents) {
        await supabasePool.query(`
          INSERT INTO documents (id, title, filename, file_path, file_type, file_size, uploaded_by, uploaded_at, updated_at, status, tags, content_text, vector_id, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            filename = EXCLUDED.filename,
            file_path = EXCLUDED.file_path,
            file_type = EXCLUDED.file_type,
            file_size = EXCLUDED.file_size,
            uploaded_by = EXCLUDED.uploaded_by,
            updated_at = EXCLUDED.updated_at,
            status = EXCLUDED.status,
            tags = EXCLUDED.tags,
            content_text = EXCLUDED.content_text,
            vector_id = EXCLUDED.vector_id,
            metadata = EXCLUDED.metadata
        `, [
          doc.id, doc.title, doc.filename, doc.file_path, doc.file_type, doc.file_size,
          doc.uploaded_by, doc.uploaded_at, doc.updated_at, doc.status, doc.tags,
          doc.content_text, doc.vector_id, doc.metadata
        ]);
      }
      console.log('✅ Documents imported successfully');
    }
    
    // Import audit logs
    if (data.auditLogs.length > 0) {
      console.log(`📤 Importing ${data.auditLogs.length} audit logs...`);
      for (const log of data.auditLogs) {
        await supabasePool.query(`
          INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          log.id, log.user_id, log.action, log.resource_type, log.resource_id,
          log.details, log.ip_address, log.user_agent, log.created_at
        ]);
      }
      console.log('✅ Audit logs imported successfully');
    }
    
    // Import user sessions
    if (data.sessions.length > 0) {
      console.log(`📤 Importing ${data.sessions.length} user sessions...`);
      for (const session of data.sessions) {
        await supabasePool.query(`
          INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            token_hash = EXCLUDED.token_hash,
            expires_at = EXCLUDED.expires_at,
            is_active = EXCLUDED.is_active
        `, [
          session.id, session.user_id, session.token_hash, session.expires_at,
          session.created_at, session.is_active
        ]);
      }
      console.log('✅ User sessions imported successfully');
    }
    
    console.log('✅ All data imported successfully to Supabase');
    
  } catch (error) {
    console.error('❌ Error importing data to Supabase:', error.message);
    throw error;
  } finally {
    await supabasePool.end();
  }
}

async function verifyMigration() {
  console.log('\n🔍 Step 4: Verifying migration...');
  
  const supabasePool = new Pool(SUPABASE_DB_CONFIG);
  
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
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with Supabase credentials');
    console.log('2. Test your application with the new database');
    console.log('3. Update your deployment configuration');
    
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
    throw error;
  } finally {
    await supabasePool.end();
  }
}

// Main execution
async function main() {
  try {
    const data = await exportLocalData();
    await createSupabaseSchema();
    await importDataToSupabase(data);
    await verifyMigration();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { exportLocalData, createSupabaseSchema, importDataToSupabase, verifyMigration };
