#!/usr/bin/env node

/**
 * Test database connection and check for users
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file
const envPath = join(rootDir, '.env');
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && require('fs').existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  DATABASE_URL = envVars.DATABASE_URL;
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connection successful\n');
    
    // Check if users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('❌ Users table does not exist. Run migrations first.');
      process.exit(1);
    }
    
    console.log('✅ Users table exists\n');
    
    // Count users
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`📊 Total users in database: ${userCount[0].count}\n`);
    
    // List users (email only)
    if (userCount[0].count > 0) {
      const users = await sql`SELECT email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5`;
      console.log('👥 Recent users:');
      users.forEach(user => {
        console.log(`   - ${user.email}${user.name ? ` (${user.name})` : ''}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No users found. You need to sign up first!\n');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testConnection();

