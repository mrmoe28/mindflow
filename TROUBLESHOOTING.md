# Troubleshooting Guide

## Vercel Deployment Errors

### Error: Function Runtimes must have a valid version

**Error Message:**
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

**Cause:**
The `vercel.json` file contains a `functions` configuration with an invalid runtime format. Vercel doesn't recognize runtime specifications like `nodejs20.x` in the functions configuration for TypeScript/JavaScript files.

**Solution:**
Remove the `functions` configuration from `vercel.json`. Vercel automatically detects and handles TypeScript/JavaScript files in the `api` directory as serverless functions without explicit runtime configuration.

**Before:**
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

**After:**
Simply remove the `functions` section entirely. Vercel will auto-detect Node.js functions based on your project configuration.

**Note:** Vercel automatically uses the appropriate Node.js runtime version based on your project's Node.js version specification (e.g., in `package.json` or `.nvmrc`).

## Sign-In Issues

### Unable to Sign In

**Symptoms:**
- Sign-in form submits but fails silently
- API requests return errors
- Authentication not working

**Cause:**
API endpoints were using custom request/response interfaces instead of Vercel's proper types from `@vercel/node`. Additionally, request bodies may need explicit parsing in Vercel serverless functions.

**Solution:**
1. Update all API endpoints to use Vercel types:
   ```typescript
   import type { VercelRequest, VercelResponse } from '@vercel/node';
   ```

2. Add body parsing for request bodies:
   ```typescript
   // Parse body if it's a Buffer or string
   let body = req.body;
   if (Buffer.isBuffer(body)) {
     body = JSON.parse(body.toString());
   } else if (typeof body === 'string') {
     body = JSON.parse(body);
   }
   const { email, password } = body as { email: string; password: string };
   ```

**Files Updated:**
- `api/auth/signin.ts`
- `api/auth/signup.ts`
- `api/auth/me.ts`
- `api/auth/forgot-password.ts`
- `api/auth/reset-password.ts`
- `api/lib/middleware.ts`
- `api/mindmaps/index.ts`
- `api/mindmaps/[id].ts`
- `api/mindmaps/[id]/save.ts`

### Sign-In Not Working in Local Development

**Symptoms:**
- Sign-in form submits but API requests fail
- 404 errors for `/api/auth/signin` endpoint
- Network errors in browser console

**Cause:**
When running `npm run dev` with Vite, the API routes in the `api/` directory are not served because Vite doesn't know how to handle Vercel serverless functions.

**Solution:**
Use `vercel dev` for local development instead of `vite dev`. The `npm run dev` script has been updated to use `vercel dev` by default.

1. Install Vercel CLI if not already installed:
   ```bash
   npm i -g vercel
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   This will run `vercel dev` which handles both the frontend (Vite) and API routes (serverless functions).

3. If you only want to run the frontend without API routes (for UI development only), use:
   ```bash
   npm run dev:vite
   ```

**Note:** Make sure you have a `.env` file with `DATABASE_URL` set for the API routes to work properly.
- `api/auth/me.ts`
- `api/auth/forgot-password.ts`
- `api/auth/reset-password.ts`
- `api/lib/middleware.ts`
- `api/mindmaps/index.ts`
- `api/mindmaps/[id].ts`
- `api/mindmaps/[id]/save.ts`

