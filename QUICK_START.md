# 🚀 Quick Start

Get up and running in 5 minutes!

## Prerequisites
- Node.js 16+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
```bash
npm run setup
```
Follow the interactive prompts to enter your Supabase credentials.

**Don't have Supabase credentials yet?**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Get your credentials from: Dashboard > Settings > API
3. Get your database URL from: Dashboard > Settings > Database

### 3. Verify Configuration
```bash
npm run setup:check
```
This will verify all environment variables are set correctly.

### 4. Run Database Migration
```bash
npm run db:migrate:supabase
```
This sets up your database schema for Supabase Auth.

### 5. Configure Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **URL Configuration**
3. Add redirect URL: `http://localhost:3000/reset-password`

### 6. Start Development Server
```bash
npm run dev
```

### 7. Test It Out!
1. Open http://localhost:3000
2. Sign up with a new account
3. Sign in
4. Create a mind map!

## 🆘 Need Help?

- **Detailed setup:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Migration info:** See [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md)
- **Troubleshooting:** Check the setup guide's troubleshooting section

## ✅ What's Next?

- Customize email templates in Supabase dashboard
- Enable OAuth providers (Google, GitHub, etc.)
- Set up Row Level Security policies
- Deploy to production!

