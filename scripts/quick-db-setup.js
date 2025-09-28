/**
 * Quick database setup and verification script
 * This will help you get started with viewing your database
 */

// Import database configuration
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'documind',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const postgres = new Pool(dbConfig);

async function quickDbSetup() {
  console.log('🚀 Quick Database Setup & Verification\n');
  console.log('=====================================\n');

  try {
    // Test connection
    console.log('1. Testing database connection...');
    await postgres.query('SELECT 1');
    console.log('   ✅ Database connection successful!\n');

    // Check if tables exist
    console.log('2. Checking database tables...');
    const tablesResult = await postgres.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const expectedTables = ['users', 'documents', 'user_sessions', 'audit_logs'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} table exists`);
      } else {
        console.log(`   ❌ ${table} table missing`);
      }
    });

    // Show existing users
    console.log('\n3. Checking existing users...');
    const usersResult = await postgres.query(`
      SELECT email, name, role, created_at, is_active 
      FROM users 
      ORDER BY created_at
    `);

    if (usersResult.rows.length > 0) {
      console.log('   📋 Existing users:');
      usersResult.rows.forEach((user, index) => {
        const status = user.is_active ? '🟢' : '🔴';
        console.log(`   ${index + 1}. ${status} ${user.email} (${user.role}) - ${user.name}`);
      });
    } else {
      console.log('   ⚠️  No users found');
    }

    // Show connection info for pgAdmin
    console.log('\n📊 pgAdmin Connection Details:');
    console.log('==============================');
    console.log('Host: localhost');
    console.log('Port: 5432');
    console.log('Database: documind');
    console.log('Username: postgres');
    console.log('Password: password');

    // Show login credentials
    console.log('\n🔐 Available Login Credentials:');
    console.log('===============================');
    if (usersResult.rows.length > 0) {
      console.log('Use these accounts to test login:');
      console.log('');
      console.log('Admin Account:');
      console.log('  Email: admin@documind.com');
      console.log('  Password: admin123');
      console.log('');
      console.log('Staff Account:');
      console.log('  Email: staff@documind.com');
      console.log('  Password: staff123');
      console.log('');
      console.log('Manager Account:');
      console.log('  Email: manager@documind.com');
      console.log('  Password: manager123');
      console.log('');
      console.log('Auditor Account:');
      console.log('  Email: auditor@documind.com');
      console.log('  Password: auditor123');
    } else {
      console.log('No default users found. Run database initialization:');
      console.log('  node scripts/init-database.js');
    }

    // Show next steps
    console.log('\n📝 Next Steps:');
    console.log('==============');
    console.log('1. Download pgAdmin: https://www.pgadmin.org/download/');
    console.log('2. Create server connection with details above');
    console.log('3. Navigate to: Servers → DocuMind Local → Databases → documind → Tables');
    console.log('4. Right-click on "users" table → View/Edit Data → All Rows');
    console.log('5. Try logging into the app: npm run dev → http://localhost:3000');

    console.log('\n🎉 Database setup verification complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running: docker-compose up -d');
    console.log('2. Check environment variables in .env file');
    console.log('3. Initialize database: node scripts/init-database.js');
    console.log('4. Check Docker containers: docker ps');
  } finally {
    process.exit(0);
  }
}

quickDbSetup();