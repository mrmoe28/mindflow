#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Verifies that all required environment variables are set
 * Supports both NeonDB (custom auth) and Supabase setups
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

// Detect which setup is being used
const hasSupabase = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const hasNeonDB = process.env.DATABASE_URL && !hasSupabase;

// Required environment variables for NeonDB (custom auth)
const neonDBVars = {
  database: [
    'DATABASE_URL',
  ],
  auth: [
    'JWT_SECRET',
  ],
};

// Required environment variables for Supabase
const supabaseVars = {
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

const requiredVars = hasNeonDB ? neonDBVars : supabaseVars;

let hasErrors = false;
const missing = [];
const empty = [];

console.log('🔍 Checking environment variables...\n');

if (hasNeonDB) {
  console.log('📦 Detected: NeonDB with custom authentication\n');
  
  // Check database variables
  console.log('🗄️  Database variables:');
  if (requiredVars.database) {
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
  }
  
  // Check auth variables
  console.log('\n🔐 Authentication variables:');
  if (requiredVars.auth) {
    requiredVars.auth.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        missing.push(varName);
        hasErrors = true;
        console.log(`  ❌ ${varName} - MISSING`);
      } else if (value.includes('your-') || value.includes('YOUR-') || value === 'your-secret-key-change-in-production') {
        empty.push(varName);
        hasErrors = true;
        console.log(`  ⚠️  ${varName} - Not configured (placeholder value)`);
      } else {
        console.log(`  ✅ ${varName} - Set`);
      }
    });
  }
} else {
  console.log('📦 Detected: Supabase setup\n');
  
  // Check client-side variables
  if (requiredVars.client) {
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
  }
  
  // Check server-side variables
  if (requiredVars.server) {
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
  }
  
  // Check database variables
  if (requiredVars.database) {
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
  }
}

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
  if (hasNeonDB) {
    console.log('  1. Get your NeonDB connection string from:');
    console.log('     https://console.neon.tech > Your Project > Connection Details');
    console.log('  2. Generate a JWT secret:');
    console.log('     node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
    console.log('  3. Update .env with your DATABASE_URL and JWT_SECRET');
    console.log('  4. Run database migrations: npm run db:migrate');
    console.log('  5. Run this check again: npm run setup:check');
  } else {
    console.log('  1. Copy .env.example to .env:');
    console.log('     cp .env.example .env');
    console.log('  2. Get your Supabase credentials from:');
    console.log('     https://supabase.com/dashboard > Your Project > Settings > API');
    console.log('  3. Update .env with your actual values');
    console.log('  4. Run this check again: npm run setup:check');
  }
  
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are configured!');
  console.log('\n🚀 You can now:');
  if (hasNeonDB) {
    console.log('  - Run database migrations: npm run db:migrate');
  } else {
    console.log('  - Run database migrations: npm run db:migrate:supabase');
  }
  console.log('  - Start development: npm run dev');
  process.exit(0);
}

