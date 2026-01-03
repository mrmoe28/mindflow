# Supabase Migration Guide

This guide explains how to migrate from custom authentication to Supabase Auth.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your Supabase credentials:
   - Project URL
   - Anon (public) key
   - Service role key (for server-side operations)

## Quick Setup

### Option 1: Interactive Setup (Recommended)
```bash
npm run setup
```
This will guide you through the setup process interactively.

### Option 2: Manual Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your Supabase credentials to `.env`:**
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Server-side (for API routes)
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Database (if you're using Supabase's PostgreSQL)
   DATABASE_URL=your-supabase-connection-string
   ```

3. **Verify your configuration:**
   ```bash
   npm run setup:check
   ```

## Database Migration

Run the migration script:
```bash
npm run db:migrate:supabase
```

This will:
- Update your schema to work with Supabase Auth
- Remove old custom auth tables
- Set up proper foreign key relationships

**Note:** If the script fails, you can run it manually:
```bash
psql $DATABASE_URL -f database/supabase_migration.sql
```

Or use the Supabase SQL Editor:
1. Go to https://supabase.com/dashboard
2. Select your project > SQL Editor
3. Copy and paste the contents of `database/supabase_migration.sql`
4. Run the query

## Key Changes

### Authentication Flow

**Before (Custom Auth):**
- Custom signin/signup endpoints
- JWT tokens generated manually
- Password hashing with bcrypt
- Custom password reset flow

**After (Supabase Auth):**
- Client-side authentication via Supabase client
- Automatic JWT token management
- Built-in password reset and email verification
- OAuth providers support (optional)

### API Endpoints

**Removed:**
- `/api/auth/signin` - Now handled by Supabase client
- `/api/auth/signup` - Now handled by Supabase client
- `/api/auth/forgot-password` - Now handled by Supabase client
- `/api/auth/reset-password` - Now handled by Supabase client

**Updated:**
- `/api/auth/me` - Now uses Supabase token verification
- All `/api/mindmaps/*` endpoints - Now use Supabase auth middleware

### Frontend Changes

The auth store now uses Supabase client directly:
- `signIn()` - Uses `supabase.auth.signInWithPassword()`
- `signUp()` - Uses `supabase.auth.signUp()`
- `signOut()` - Uses `supabase.auth.signOut()`
- `checkAuth()` - Uses `supabase.auth.getSession()`

## Row Level Security (RLS)

Supabase supports Row Level Security policies. Consider enabling RLS on your tables:

```sql
-- Enable RLS on mind_maps
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own mind maps
CREATE POLICY "Users can view own mind maps"
ON mind_maps FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only create their own mind maps
CREATE POLICY "Users can create own mind maps"
ON mind_maps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Similar policies for UPDATE and DELETE
```

## Testing the Migration

1. **Sign Up:**
   ```typescript
   await useAuthStore.getState().signUp('user@example.com', 'password123', 'User Name');
   ```

2. **Sign In:**
   ```typescript
   await useAuthStore.getState().signIn('user@example.com', 'password123');
   ```

3. **Check Auth:**
   ```typescript
   await useAuthStore.getState().checkAuth();
   ```

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Check that variables are prefixed with `VITE_` for client-side access

### "Invalid token" errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly for server-side operations
- Check that tokens are being passed in Authorization headers

### Database connection issues
- If using Supabase's database, use the connection string from Supabase dashboard
- If using external database, ensure it's accessible and credentials are correct

## Next Steps

1. Set up email templates in Supabase dashboard
2. Configure OAuth providers (optional)
3. Enable Row Level Security policies
4. Set up email verification flow
5. Test password reset functionality

