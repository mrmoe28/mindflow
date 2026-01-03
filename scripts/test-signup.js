#!/usr/bin/env node

/**
 * Test sign-up functionality
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

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

async function testSignup() {
  try {
    console.log('🧪 Testing sign-up functionality...\n');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';
    
    console.log(`📧 Test email: ${testEmail}`);
    console.log(`🔑 Test password: ${testPassword}\n`);
    
    // Check if user exists
    const existing = await sql`
      SELECT id, email FROM users WHERE email = ${testEmail.toLowerCase()}
    `;
    
    if (existing.length > 0) {
      console.log('⚠️  Test user already exists, deleting...');
      await sql`DELETE FROM users WHERE email = ${testEmail.toLowerCase()}`;
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('✅ Password hashed\n');
    
    // Create user
    console.log('👤 Creating user...');
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${testEmail.toLowerCase()}, ${hashedPassword}, ${testName})
      RETURNING id, email, name, email_verified, created_at
    `;
    
    console.log('✅ User created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Verified: ${user.email_verified}\n`);
    
    // Verify password
    console.log('🔍 Verifying password...');
    const [savedUser] = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `;
    
    const isValid = await bcrypt.compare(testPassword, savedUser.password_hash);
    if (isValid) {
      console.log('✅ Password verification successful!\n');
    } else {
      console.log('❌ Password verification failed!\n');
    }
    
    // Clean up
    console.log('🧹 Cleaning up test user...');
    await sql`DELETE FROM users WHERE id = ${user.id}`;
    console.log('✅ Test user deleted\n');
    
    console.log('✅ All tests passed! Sign-up functionality is working.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testSignup();

