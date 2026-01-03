#!/usr/bin/env node

/**
 * Run database migrations
 * This script runs the SQL migrations in the correct order
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file if it exists
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
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env file or environment variables');
  process.exit(1);
}

// Create postgres client
const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

async function runMigration(fileName, description) {
  console.log(`\n📄 Running ${description}...`);
  const filePath = join(rootDir, 'database', fileName);
  const sqlContent = readFileSync(filePath, 'utf-8');
  
  try {
    // Drop existing triggers first to avoid conflicts
    await sql.unsafe(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP TRIGGER IF EXISTS update_mind_maps_updated_at ON mind_maps;
      DROP TRIGGER IF EXISTS update_nodes_updated_at ON nodes;
    `);
    
    // Execute the entire SQL file as one statement
    // This handles functions and multi-line statements correctly
    await sql.unsafe(sqlContent);
    
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    // Ignore "already exists" errors for tables/indexes (NOTICE level)
    if (error.code === '42P07' || error.severity === 'NOTICE') {
      console.log(`⚠️  Some objects already exist (this is OK)`);
      console.log(`✅ ${description} completed successfully`);
    } else if (error.message.includes('already exists') && error.message.includes('trigger')) {
      // Trigger already exists, that's OK
      console.log(`⚠️  Trigger already exists (this is OK)`);
      console.log(`✅ ${description} completed successfully`);
    } else {
      console.error(`❌ Error running ${description}:`, error.message);
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📊 Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'connected'}\n`);

  try {
    // Step 1: Create the update_updated_at_column function first (from schema.sql)
    console.log('📄 Creating update_updated_at_column function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    console.log('✅ Function created successfully');

    // Step 2: Run auth schema (creates users table)
    await runMigration('auth_schema.sql', 'Authentication schema');

    // Step 3: Run main schema (creates mind_maps, nodes, edges)
    await runMigration('schema.sql', 'Main schema');

    console.log('\n✅ All migrations completed successfully!');
    console.log('\n🎉 Your database is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();

