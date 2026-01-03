# Quick Setup Guide

## 🚀 Getting Started with Supabase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `mindflow` (or your preferred name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. You'll need these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

3. Go to **Settings** > **Database** to get your connection string:
   - Click "Connection string" tab
   - Select "URI" format
   - Copy the connection string (replace `[YOUR-PASSWORD]` with your database password)

### Step 3: Configure Environment Variables

#### Option A: Interactive Setup (Recommended)
```bash
npm run setup
```
This will guide you through entering your credentials.

#### Option B: Manual Setup

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```bash
   # Client-side (used by Vite/React)
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Server-side (used by API routes)
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Database Connection
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

3. Verify your configuration:
   ```bash
   npm run setup:check
   ```

### Step 4: Run Database Migration

```bash
npm run db:migrate:supabase
```

This will:
- Remove old custom auth tables
- Update schema to work with Supabase Auth
- Set up proper indexes

**Alternative:** If the script doesn't work, you can run it manually:
```bash
psql $DATABASE_URL -f database/supabase_migration.sql
```

Or use Supabase SQL Editor:
1. Go to your Supabase dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New query**
4. Copy and paste the contents of `database/supabase_migration.sql`
5. Click **Run**

### Step 5: Configure Supabase Dashboard

1. **Set Password Reset Redirect URL:**
   - Go to **Authentication** > **URL Configuration**
   - Add your redirect URL:
     - Development: `http://localhost:3000/reset-password`
     - Production: `https://your-domain.com/reset-password`

2. **Configure Email Templates (Optional):**
   - Go to **Authentication** > **Email Templates**
   - Customize the password reset email template
   - Customize the confirmation email template

3. **Enable Email Verification (Optional):**
   - Go to **Authentication** > **Providers** > **Email**
   - Toggle "Enable email confirmations" if desired

### Step 6: Start Development

```bash
npm run dev
```

This will start the Vercel dev server which handles both frontend and API routes.

### Step 7: Test Authentication

1. Open your app (usually `http://localhost:3000`)
2. Try signing up with a new account
3. Check your email for verification (if enabled)
4. Try signing in
5. Test password reset flow

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] `npm run setup:check` passes
- [ ] Database migration completed
- [ ] Password reset URL configured in Supabase
- [ ] App starts without errors
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can reset password

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Run `npm run setup:check` to see what's missing
- Make sure all variables in `.env` are set (no placeholder values)

### "Invalid token" errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that tokens are being passed in Authorization headers

### Database connection issues
- Verify `DATABASE_URL` is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Check that your IP is allowed (Supabase allows all by default)

### Migration fails
- Try running the SQL manually in Supabase SQL Editor
- Check that you have proper database permissions
- Verify the migration file exists: `database/supabase_migration.sql`

## 📚 Next Steps

- Read [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) for detailed migration info
- Check [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for what changed
- Review Supabase docs: https://supabase.com/docs

