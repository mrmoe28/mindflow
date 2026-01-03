# NeonDB Setup Guide

This guide explains how to set up MindFlow with NeonDB and custom authentication.

## Prerequisites

1. A NeonDB account (free at [neon.tech](https://neon.tech))
2. Node.js 16+ installed

## Step 1: Create NeonDB Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "Create Project"
3. Fill in project details:
   - Project name: `mindflow` (or your preferred name)
   - Region: Choose closest to you
   - PostgreSQL version: Latest (recommended)
4. Wait for project to be created (~1 minute)
5. Copy your connection string from the dashboard

## Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Connection (from NeonDB dashboard)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# JWT Secret (generate a strong random string)
JWT_SECRET=your-strong-random-secret-key-here

# Optional: API URL (defaults to /api)
VITE_API_URL=/api
```

**Generate a JWT Secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 3: Run Database Migrations

Run the migrations in order:

```bash
# 1. Main schema (mind maps, nodes, edges)
psql $DATABASE_URL -f database/schema.sql

# 2. Authentication schema (users, password reset tokens)
psql $DATABASE_URL -f database/auth_schema.sql

# 3. NeonDB migration (updates user_id to UUID)
psql $DATABASE_URL -f database/neon_migration.sql
```

**Alternative:** If you don't have `psql` installed, you can use NeonDB's SQL Editor:
1. Go to your NeonDB dashboard
2. Click "SQL Editor"
3. Copy and paste each migration file's contents
4. Run them in order

## Step 4: Verify Setup

1. Check that tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

   You should see:
   - `users`
   - `password_reset_tokens`
   - `email_verification_tokens`
   - `mind_maps`
   - `nodes`
   - `edges`

2. Verify foreign key constraint:
   ```sql
   SELECT constraint_name, table_name 
   FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY' 
   AND table_name = 'mind_maps';
   ```

## Step 5: Start Development

```bash
npm run dev
```

## Environment Variables for Vercel

When deploying to Vercel, add these environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **DATABASE_URL** - Your NeonDB connection string
   - **JWT_SECRET** - Your JWT secret key (same as in .env)
3. Redeploy your project

## Database Schema Overview

### Users Table
- Stores user accounts with email and hashed passwords
- Uses UUID for primary key
- Includes email verification status

### Password Reset Tokens
- Stores temporary tokens for password resets
- Tokens expire after 1 hour
- Tokens are marked as used after password reset

### Mind Maps
- References users via `user_id` (UUID foreign key)
- Cascade delete: when user is deleted, their mind maps are deleted

## Troubleshooting

### "relation users does not exist"
- Run `database/auth_schema.sql` first

### "column user_id is of type character varying but expression is of type uuid"
- Run `database/neon_migration.sql` to convert user_id to UUID

### Connection errors
- Verify your `DATABASE_URL` is correct
- Check that SSL mode is set: `?sslmode=require`
- Ensure your IP is allowed (NeonDB allows all by default)

### Authentication not working
- Verify `JWT_SECRET` is set in environment variables
- Check that users table has data
- Check browser console for API errors

## Security Notes

- **JWT_SECRET**: Use a strong, random secret. Never commit it to git.
- **DATABASE_URL**: Contains credentials. Keep it secure.
- **Password Hashing**: Uses bcrypt with 10 rounds (secure)
- **Token Expiry**: JWT tokens expire after 7 days

## Next Steps

- Set up email service for password reset emails
- Configure email verification flow
- Add rate limiting for auth endpoints
- Set up database backups

