#!/usr/bin/env node

/**
 * Test script to verify Supabase connection
 * Run this after setting up your Supabase credentials
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local', override: true });

const SUPABASE_DB_CONFIG = {
  host: process.env.SUPABASE_HOST || 'aws-1-us-east-2.pooler.supabase.com',
  port: parseInt(process.env.SUPABASE_PORT || '5432'),
  database: process.env.SUPABASE_DB || 'postgres',
  user: process.env.SUPABASE_USER || 'postgres.enmydvcrqenckbllewaa',
  password: process.env.SUPABASE_PASSWORD || 'hS7azyLGjgNPdmFt',
  ssl: { rejectUnauthorized: false }
};

console.log('🔍 Testing Supabase connection...\n');

async function testConnection() {
  const pool = new Pool(SUPABASE_DB_CONFIG);
  
  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connected successfully!');
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
    
    // Test table existence
    console.log('\n📋 Checking database schema...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Test data counts
    console.log('\n📊 Checking data counts...');
    const counts = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM documents'),
      pool.query('SELECT COUNT(*) as count FROM audit_logs'),
      pool.query('SELECT COUNT(*) as count FROM user_sessions')
    ]);
    
    console.log('✅ Data counts:');
    console.log(`   - Users: ${counts[0].rows[0].count}`);
    console.log(`   - Documents: ${counts[1].rows[0].count}`);
    console.log(`   - Audit Logs: ${counts[2].rows[0].count}`);
    console.log(`   - User Sessions: ${counts[3].rows[0].count}`);
    
    // Test a sample query
    console.log('\n🔍 Testing sample query...');
    const usersResult = await pool.query('SELECT email, name, role FROM users LIMIT 3');
    console.log('✅ Sample users:');
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🎉 Supabase connection test completed successfully!');
    console.log('\n📝 Your database is ready to use with your application.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase credentials in .env.local');
    console.log('2. Verify your Supabase project is active');
    console.log('3. Check if your IP is allowed in Supabase settings');
    console.log('4. Ensure SSL settings are correct');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if required environment variables are set
function checkEnvironment() {
  const required = [
    'SUPABASE_HOST',
    'SUPABASE_USER', 
    'SUPABASE_PASSWORD'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n📝 Please set these in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables configured');
}

if (require.main === module) {
  checkEnvironment();
  testConnection();
}

module.exports = { testConnection };
