#!/usr/bin/env node

/**
 * Database initialization script for Windows
 * Usage: node scripts/init-database.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

async function initializeDatabase() {
  console.log('🚀 Initializing DocuMind Database...\n');
  
  const config = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'documind',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password'
  };
  
  // Set password for psql commands
  process.env.PGPASSWORD = config.password;
  
  try {
    // Step 1: Test PostgreSQL connection
    console.log('1. Testing PostgreSQL connection...');
    const testCmd = `psql -h ${config.host} -p ${config.port} -U ${config.user} -c "SELECT version();"`;
    execSync(testCmd, { stdio: 'pipe' });
    console.log('   ✅ PostgreSQL connection successful');
    
    // Step 2: Create database if it doesn't exist
    console.log('\n2. Creating database...');
    try {
      const createDbCmd = `psql -h ${config.host} -p ${config.port} -U ${config.user} -c "CREATE DATABASE ${config.database};"`;
      execSync(createDbCmd, { stdio: 'pipe' });
      console.log('   ✅ Database created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ Database already exists');
      } else {
        throw error;
      }
    }
    
    // Step 3: Initialize schema
    console.log('\n3. Initializing database schema...');
    if (!fs.existsSync('src/lib/database/schema.sql')) {
      throw new Error('Schema file not found: src/lib/database/schema.sql');
    }
    
    const schemaCmd = `psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -f src/lib/database/schema.sql`;
    execSync(schemaCmd, { stdio: 'pipe' });
    console.log('   ✅ Database schema initialized');
    
    // Step 4: Verify tables were created
    console.log('\n4. Verifying database setup...');
    const verifyCmd = `psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"`;
    const result = execSync(verifyCmd, { encoding: 'utf8' });
    
    const tables = result.split('\n')
      .filter(line => line.trim() && !line.includes('table_name') && !line.includes('---') && !line.includes('(') && !line.includes('row'))
      .map(line => line.trim())
      .filter(line => line);
    
    if (tables.length > 0) {
      console.log('   ✅ Tables created successfully:');
      tables.forEach(table => console.log(`      • ${table}`));
    } else {
      throw new Error('No tables found after schema initialization');
    }
    
    // Step 5: Verify sample users
    console.log('\n5. Checking sample users...');
    const usersCmd = `psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -c "SELECT email, role FROM users;"`;
    const usersResult = execSync(usersCmd, { encoding: 'utf8' });
    
    if (usersResult.includes('admin@documind.com')) {
      console.log('   ✅ Sample users created successfully');
      console.log('   Default users available:');
      console.log('      • admin@documind.com (password: admin123)');
      console.log('      • manager@documind.com (password: manager123)');
      console.log('      • staff@documind.com (password: staff123)');
      console.log('      • auditor@documind.com (password: auditor123)');
    } else {
      console.log('   ⚠️  Sample users not found (this is okay)');
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start Milvus: docker-compose -f docker-compose.milvus.yml up -d');
    console.log('2. Test setup: node scripts/validate-environment.js');
    console.log('3. Start development: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure PostgreSQL is running: net start postgresql-x64-15');
    console.log('2. Check connection settings in .env file');
    console.log('3. Verify PostgreSQL is in PATH: psql --version');
    process.exit(1);
  }
}

initializeDatabase();