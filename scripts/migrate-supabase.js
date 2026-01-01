#!/usr/bin/env node

/**
 * Supabase Migration Script
 * Runs the Supabase migration SQL file against your database
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file
const envPath = join(rootDir, '.env');
if (!existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.error('   Please create a .env file with your DATABASE_URL');
  console.error('   You can copy .env.example to .env as a starting point');
  process.exit(1);
}

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

const databaseUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env file!');
  console.error('   Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const migrationFile = join(rootDir, 'database', 'supabase_migration.sql');

if (!existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

console.log('🔄 Running Supabase migration...\n');
console.log(`📄 Migration file: ${migrationFile}`);
console.log(`🗄️  Database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);

try {
  // Read the migration SQL
  const sql = readFileSync(migrationFile, 'utf-8');
  
  // Execute using psql
  console.log('Executing migration SQL...\n');
  execSync(`psql "${databaseUrl}" -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
    stdio: 'inherit',
    shell: true,
  });
  
  console.log('\n✅ Supabase migration completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('  1. Verify your database schema in Supabase dashboard');
  console.log('  2. Configure password reset redirect URL in Supabase dashboard');
  console.log('  3. Test authentication: npm run dev');
  
} catch (error) {
  console.error('\n❌ Migration failed!');
  console.error('\n💡 Alternative: Run the migration manually:');
  console.error(`   psql "${databaseUrl}" -f ${migrationFile}`);
  console.error('\nOr use the Supabase SQL Editor:');
  console.error('   1. Go to https://supabase.com/dashboard');
  console.error('   2. Select your project > SQL Editor');
  console.error('   3. Copy and paste the contents of database/supabase_migration.sql');
  console.error('   4. Run the query');
  process.exit(1);
}

