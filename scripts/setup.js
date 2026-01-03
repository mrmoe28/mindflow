#!/usr/bin/env node

/**
 * Setup Script
 * Interactive setup guide for Supabase configuration
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🚀 MindFlow Supabase Setup\n');
  console.log('This script will help you configure Supabase for your project.\n');
  console.log('📋 Prerequisites:');
  console.log('   1. A Supabase project (create one at https://supabase.com)');
  console.log('   2. Your Supabase credentials from the dashboard\n');
  
  const proceed = await question('Ready to start? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  console.log('\n📝 Getting Supabase credentials...');
  console.log('   Go to: https://supabase.com/dashboard > Your Project > Settings > API\n');

  const supabaseUrl = await question('Enter your Supabase URL (VITE_SUPABASE_URL): ');
  const anonKey = await question('Enter your Anon/Public Key (VITE_SUPABASE_ANON_KEY): ');
  const serviceKey = await question('Enter your Service Role Key (SUPABASE_SERVICE_ROLE_KEY): ');
  const dbUrl = await question('Enter your Database URL (DATABASE_URL): ');

  if (!supabaseUrl || !anonKey || !serviceKey || !dbUrl) {
    console.log('\n❌ All fields are required. Setup cancelled.');
    rl.close();
    return;
  }

  // Create .env file
  const envPath = join(rootDir, '.env');
  const envExamplePath = join(rootDir, '.env.example');
  
  let envContent = '';
  if (existsSync(envExamplePath)) {
    envContent = readFileSync(envExamplePath, 'utf-8');
  } else {
    envContent = readFileSync(join(__dirname, '..', '.env.example'), 'utf-8');
  }

  // Replace placeholder values
  envContent = envContent.replace(/VITE_SUPABASE_URL=.*/g, `VITE_SUPABASE_URL=${supabaseUrl}`);
  envContent = envContent.replace(/VITE_SUPABASE_ANON_KEY=.*/g, `VITE_SUPABASE_ANON_KEY=${anonKey}`);
  envContent = envContent.replace(/SUPABASE_URL=.*/g, `SUPABASE_URL=${supabaseUrl}`);
  envContent = envContent.replace(/SUPABASE_ANON_KEY=.*/g, `SUPABASE_ANON_KEY=${anonKey}`);
  envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/g, `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`);
  envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${dbUrl}`);

  writeFileSync(envPath, envContent);
  console.log('\n✅ .env file created successfully!');

  // Check if user wants to run migration
  const runMigration = await question('\n📦 Run database migration now? (y/n): ');
  if (runMigration.toLowerCase() === 'y') {
    console.log('\n🔄 Running migration...');
    try {
      const { execSync } = await import('child_process');
      execSync('npm run db:migrate:supabase', { stdio: 'inherit' });
    } catch (error) {
      console.log('\n⚠️  Migration script failed. You can run it manually:');
      console.log('   npm run db:migrate:supabase');
    }
  }

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Verify environment variables: npm run setup:check');
  console.log('   2. Configure Supabase dashboard:');
  console.log('      - Set password reset redirect URL');
  console.log('      - Configure email templates (optional)');
  console.log('   3. Start development: npm run dev');
  console.log('\n🎉 Happy coding!');

  rl.close();
}

setup().catch(error => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});

