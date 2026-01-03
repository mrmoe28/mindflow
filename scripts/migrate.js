#!/usr/bin/env node

/**
 * NeonDB Migration Script
 * Runs the database migrations in the correct order for NeonDB setup
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env file if it exists
const envPath = join(rootDir, '.env');
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && existsSync(envPath)) {
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
  
  if (!existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    throw new Error(`Migration file not found: ${fileName}`);
  }
  
  const sqlContent = readFileSync(filePath, 'utf-8');
  
  try {
    // Execute the entire SQL file
    await sql.unsafe(sqlContent);
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    // Ignore "already exists" errors for tables/indexes
    if (error.code === '42P07' || error.severity === 'NOTICE') {
      console.log(`⚠️  Some objects already exist (this is OK)`);
      console.log(`✅ ${description} completed successfully`);
    } else if (error.message.includes('already exists')) {
      console.log(`⚠️  Some objects already exist (this is OK)`);
      console.log(`✅ ${description} completed successfully`);
    } else {
      console.error(`❌ Error running ${description}:`, error.message);
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Starting NeonDB migrations...\n');
  const dbInfo = DATABASE_URL.split('@')[1]?.split('/')[0] || 'connected';
  console.log(`📊 Database: ${dbInfo}\n`);

  try {
    // Step 1: Create the update_updated_at_column function first
    console.log('📄 Creating update_updated_at_column function...');
    try {
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
    } catch (error) {
      if (error.code === '42P07' || error.message.includes('already exists')) {
        console.log('⚠️  Function already exists (this is OK)');
      } else {
        throw error;
      }
    }

    // Step 2: Run auth schema (creates users table)
    await runMigration('auth_schema.sql', 'Authentication schema');

    // Step 3: Run main schema (creates mind_maps, nodes, edges)
    await runMigration('schema.sql', 'Main schema');

    // Step 4: Run NeonDB migration (updates user_id to UUID if needed)
    await runMigration('neon_migration.sql', 'NeonDB migration');

    console.log('\n✅ All migrations completed successfully!');
    console.log('\n🎉 Your database is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('  - Start development: npm run dev');
    console.log('  - Test database connection: node scripts/test-db-connection.js');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Alternative: Run migrations manually using NeonDB SQL Editor:');
    console.error('   1. Go to https://console.neon.tech');
    console.error('   2. Select your project > SQL Editor');
    console.error('   3. Run these files in order:');
    console.error('      - database/auth_schema.sql');
    console.error('      - database/schema.sql');
    console.error('      - database/neon_migration.sql');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();

