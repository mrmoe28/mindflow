# Vercel Deployment Setup

## Setting Environment Variables in Vercel

The blank page issue is usually caused by missing environment variables in Vercel. Follow these steps to configure them:

### Step 1: Go to Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Select your project (mindflow)
3. Go to **Settings** > **Environment Variables**

### Step 2: Add Required Variables

Add these environment variables for **Production**, **Preview**, and **Development**:

#### Client-Side Variables (for Vite/React)
These are prefixed with `VITE_` and are included in the client bundle:

- **Name:** `VITE_SUPABASE_URL`
  - **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
  - **Environment:** Production, Preview, Development

- **Name:** `VITE_SUPABASE_ANON_KEY`
  - **Value:** Your Supabase anon/public key
  - **Environment:** Production, Preview, Development

#### Server-Side Variables (for API routes)
These are only available on the server:

- **Name:** `SUPABASE_URL`
  - **Value:** Your Supabase project URL (same as VITE_SUPABASE_URL)
  - **Environment:** Production, Preview, Development

- **Name:** `SUPABASE_ANON_KEY`
  - **Value:** Your Supabase anon/public key (same as VITE_SUPABASE_ANON_KEY)
  - **Environment:** Production, Preview, Development

- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
  - **Value:** Your Supabase service role key (keep this secret!)
  - **Environment:** Production, Preview, Development

- **Name:** `DATABASE_URL`
  - **Value:** Your database connection string
  - **Environment:** Production, Preview, Development

### Step 3: Get Your Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings** > **Database**
6. Copy the **Connection string** (URI format) → Use for `DATABASE_URL`

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

### Step 5: Verify

1. Open your production URL
2. Check the browser console (F12) for any errors
3. The app should now load properly

## Troubleshooting

### Still seeing a blank page?

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check if Supabase variables are missing

2. **Check Vercel build logs**
   - Go to your deployment in Vercel
   - Click on the deployment
   - Check the build logs for errors

3. **Verify environment variables**
   - Make sure all variables are set for **Production** environment
   - Check that variable names match exactly (case-sensitive)
   - Ensure no extra spaces in values

4. **Check network tab**
   - Open browser DevTools → Network tab
   - Look for failed requests to Supabase
   - Check if API routes are returning errors

### Common Issues

**Issue:** "Missing Supabase environment variables"
- **Solution:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel

**Issue:** API routes returning 500 errors
- **Solution:** Add server-side variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`

**Issue:** Build succeeds but page is blank
- **Solution:** Check browser console for JavaScript errors, verify all environment variables are set

## Quick Checklist

- [ ] `VITE_SUPABASE_URL` set in Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_URL` set in Vercel
- [ ] `SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel
- [ ] `DATABASE_URL` set in Vercel
- [ ] All variables set for Production environment
- [ ] Redeployed after adding variables
- [ ] Checked browser console for errors

