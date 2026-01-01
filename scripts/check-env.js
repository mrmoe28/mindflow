#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Verifies that all required Supabase environment variables are set
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file if it exists
const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
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
  
  // Set environment variables
  Object.assign(process.env, envVars);
}

// Required environment variables
const requiredVars = {
  client: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
  server: [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  database: [
    'DATABASE_URL',
  ],
};

let hasErrors = false;
const missing = [];
const empty = [];

console.log('🔍 Checking environment variables...\n');

// Check client-side variables
console.log('📱 Client-side variables:');
requiredVars.client.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missing.push(varName);
    hasErrors = true;
    console.log(`  ❌ ${varName} - MISSING`);
  } else if (value.includes('your-') || value.includes('YOUR-')) {
    empty.push(varName);
    hasErrors = true;
    console.log(`  ⚠️  ${varName} - Not configured (placeholder value)`);
  } else {
    console.log(`  ✅ ${varName} - Set`);
  }
});

// Check server-side variables
console.log('\n🖥️  Server-side variables:');
requiredVars.server.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missing.push(varName);
    hasErrors = true;
    console.log(`  ❌ ${varName} - MISSING`);
  } else if (value.includes('your-') || value.includes('YOUR-')) {
    empty.push(varName);
    hasErrors = true;
    console.log(`  ⚠️  ${varName} - Not configured (placeholder value)`);
  } else {
    console.log(`  ✅ ${varName} - Set`);
  }
});

// Check database variables
console.log('\n🗄️  Database variables:');
requiredVars.database.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missing.push(varName);
    hasErrors = true;
    console.log(`  ❌ ${varName} - MISSING`);
  } else if (value.includes('your-') || value.includes('YOUR-') || value.includes('[YOUR-')) {
    empty.push(varName);
    hasErrors = true;
    console.log(`  ⚠️  ${varName} - Not configured (placeholder value)`);
  } else {
    console.log(`  ✅ ${varName} - Set`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ Some environment variables are missing or not configured.\n');
  
  if (missing.length > 0) {
    console.log('Missing variables:');
    missing.forEach(v => console.log(`  - ${v}`));
  }
  
  if (empty.length > 0) {
    console.log('\nVariables with placeholder values:');
    empty.forEach(v => console.log(`  - ${v}`));
  }
  
  console.log('\n📝 Next steps:');
  console.log('  1. Copy .env.example to .env:');
  console.log('     cp .env.example .env');
  console.log('  2. Get your Supabase credentials from:');
  console.log('     https://supabase.com/dashboard > Your Project > Settings > API');
  console.log('  3. Update .env with your actual values');
  console.log('  4. Run this check again: npm run setup:check');
  
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are configured!');
  console.log('\n🚀 You can now:');
  console.log('  - Run database migrations: npm run db:migrate:supabase');
  console.log('  - Start development: npm run dev');
  process.exit(0);
}

